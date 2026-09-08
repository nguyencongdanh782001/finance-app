import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getAdminFromRequest } from "@/lib/orders/daily-orders";

export async function POST(request: Request) {
  try {
    getAdminFromRequest(request);
    const [products, counts] = await Promise.all([
      prisma.product.findMany({ select: { id: true, organicFavoriteCount: true } }),
      prisma.wishlistItem.groupBy({ by: ["productId"], _count: { productId: true } }),
    ]);
    const actualByProduct = new Map(counts.map((item) => [item.productId, item._count.productId]));
    const mismatches = products.filter((product) => product.organicFavoriteCount !== (actualByProduct.get(product.id) || 0));
    await prisma.$transaction(mismatches.map((product) => prisma.product.update({ where: { id: product.id }, data: { organicFavoriteCount: actualByProduct.get(product.id) || 0 } })));
    return NextResponse.json({ checked: products.length, updated: mismatches.length });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Unauthorized" }, { status: 401 });
  }
}
