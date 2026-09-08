import prisma from "@/lib/db";
import { withFavoriteMeta } from "@/lib/products/favorites";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const userId = Number(request.headers.get("x-user-id"));
  if (!userId || request.headers.get("x-user-role") !== "CUSTOMER") return NextResponse.json({ message: "Chỉ khách hàng mới có thể xem sản phẩm yêu thích." }, { status: 403 });
  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page") || 1));
  const limit = Math.min(48, Math.max(1, Number(url.searchParams.get("limit") || 12)));
  const where = { userId, product: { status: "PUBLIC" as const } };
  const [favorites, total] = await Promise.all([
    prisma.wishlistItem.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        product: {
          include: {
            category: true,
            images: { where: { variantId: null }, orderBy: { position: "asc" } },
            variants: { orderBy: { createdAt: "asc" }, include: { images: { orderBy: { position: "asc" } } } },
          },
        },
      },
    }),
    prisma.wishlistItem.count({ where }),
  ]);
  return NextResponse.json({
    items: favorites.map((favorite) => ({
      favoriteId: favorite.id,
      favoritedAt: favorite.createdAt,
      product: withFavoriteMeta(favorite.product, { isAdmin: false, isFavorited: true }),
    })),
    total,
    page,
    limit,
    hasMore: page * limit < total,
  });
}
