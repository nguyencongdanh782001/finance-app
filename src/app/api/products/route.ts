import prisma from "@/lib/db";
import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";
import {
  buildSharedProductFilters,
  parseProductListQuery,
  productOrderBy,
  publicProductSelect,
  serializePublicProduct,
} from "@/lib/products/product-list";
import { ProductStatus } from "@/app/generated/prisma/client";
import { findProductIdsBySearch } from "@/lib/products/product-search";

const getCachedProducts = (
  query: ReturnType<typeof parseProductListQuery>,
  matchedProductIds?: number[],
) => {
  const where = {
    ...buildSharedProductFilters(query, matchedProductIds),
    status: ProductStatus.PUBLIC,
  };
  const key = JSON.stringify({
    page: query.page,
    limit: query.limit,
    search: query.search,
    categoryId: query.categoryId,
    categorySlug: query.categorySlug,
    gender: query.gender,
    color: query.color,
    size: query.size,
    minPrice: query.minPrice,
    maxPrice: query.maxPrice,
    sort: query.sort,
    stockStatus: query.stockStatus,
    matchedProductIds,
  });
  return unstable_cache(
    () =>
      Promise.all([
        prisma.product.findMany({
          where,
          select: publicProductSelect,
          orderBy: productOrderBy(query.sort),
          skip: (query.page - 1) * query.limit,
          take: query.limit,
        }),
        prisma.product.count({ where }),
      ]),
    ["public-products", key],
    { revalidate: 60, tags: ["products"] },
  )();
};

export async function GET(request: Request) {
  try {
    const query = parseProductListQuery(new URL(request.url).searchParams);
    const matchedProductIds = query.search
      ? await findProductIdsBySearch(query.search)
      : undefined;
    const [products, total] = await getCachedProducts(query, matchedProductIds);
    const userId = Number(request.headers.get("x-user-id"));
    const favorites =
      userId > 0
        ? new Set(
            (
              await prisma.wishlistItem.findMany({
                where: {
                  userId,
                  productId: { in: products.map((product) => product.id) },
                },
                select: { productId: true },
              })
            ).map((item) => item.productId),
          )
        : new Set<number>();
    return NextResponse.json({
      data: products.map((product) => ({
        ...serializePublicProduct(product),
        isFavorited: favorites.has(product.id),
      })),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
        totalPage: Math.ceil(total / query.limit),
        hasNextPage: query.page * query.limit < total,
        hasPreviousPage: query.page > 1,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Bộ lọc không hợp lệ.",
      },
      { status: 400 },
    );
  }
}
