import prisma from "@/lib/db";
import { NextResponse } from "next/server";
import { buildSharedProductFilters, parseProductListQuery, productOrderBy, publicProductSelect, serializePublicProduct } from "@/lib/products/product-list";
import { ProductStatus } from "@/app/generated/prisma/client";

export async function GET(request: Request) {
  try {
    const query = parseProductListQuery(new URL(request.url).searchParams);
    const where = { ...buildSharedProductFilters(query), status: ProductStatus.PUBLIC };
    const [products, total] = await Promise.all([
      prisma.product.findMany({ where, select: publicProductSelect, orderBy: productOrderBy(query.sort), skip: (query.page - 1) * query.limit, take: query.limit }),
      prisma.product.count({ where }),
    ]);
    const userId = Number(request.headers.get("x-user-id"));
    const favorites = userId > 0 ? new Set((await prisma.wishlistItem.findMany({ where: { userId, productId: { in: products.map((product) => product.id) } }, select: { productId: true } })).map((item) => item.productId)) : new Set<number>();
    return NextResponse.json({ data: products.map((product) => ({ ...serializePublicProduct(product), isFavorited: favorites.has(product.id) })), pagination: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit), totalPage: Math.ceil(total / query.limit), hasNextPage: query.page * query.limit < total, hasPreviousPage: query.page > 1 } });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Bộ lọc không hợp lệ." }, { status: 400 });
  }
}
