import prisma from "@/lib/db";
import { getDisplayFavoriteCount } from "@/lib/products/favorites";
import { NextResponse } from "next/server";

const error = (message: string, status = 400) => NextResponse.json({ message }, { status });

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = Number(request.headers.get("x-user-id"));
  const role = request.headers.get("x-user-role");
  if (!userId || role !== "CUSTOMER") return error("Chỉ khách hàng mới có thể lưu sản phẩm yêu thích.", 403);
  const productId = Number((await params).id);
  if (!Number.isInteger(productId) || productId < 1) return error("Sản phẩm không hợp lệ.");

  try {
    const body = (await request.json()) as { isFavorite?: unknown };
    if (typeof body.isFavorite !== "boolean") return error("Trạng thái yêu thích không hợp lệ.");
    const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true, status: true } });
    if (!product || product.status !== "PUBLIC") return error("Sản phẩm không còn khả dụng.", 404);

    const result = await prisma.$transaction(async (tx) => {
      const wishlist = await tx.wishlist.upsert({
        where: { userId_name: { userId, name: "Default" } },
        create: { userId, name: "Default", isDefault: true },
        update: {},
      });
      let changed = false;
      if (body.isFavorite) {
        const created = await tx.wishlistItem.createMany({
          data: { wishlistId: wishlist.id, userId, productId },
          skipDuplicates: true,
        });
        changed = created.count > 0;
        if (changed) await tx.product.update({ where: { id: productId }, data: { organicFavoriteCount: { increment: 1 } } });
      } else {
        const removed = await tx.wishlistItem.deleteMany({ where: { userId, productId } });
        changed = removed.count > 0;
        if (changed) await tx.product.updateMany({ where: { id: productId, organicFavoriteCount: { gt: 0 } }, data: { organicFavoriteCount: { decrement: 1 } } });
      }
      const updated = await tx.product.findUniqueOrThrow({ where: { id: productId }, select: { organicFavoriteCount: true, favoriteCountAdjustment: true } });
      return { changed, isFavorited: body.isFavorite ? true : false, ...updated };
    });
    return NextResponse.json({ productId, isFavorited: result.isFavorited, organicFavoriteCount: result.organicFavoriteCount, displayFavoriteCount: getDisplayFavoriteCount(result.organicFavoriteCount, result.favoriteCountAdjustment) });
  } catch (cause) {
    console.error("Update product favorite failed", cause);
    return error("Không thể cập nhật sản phẩm yêu thích.", 500);
  }
}
