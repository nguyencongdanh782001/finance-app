import type { Prisma } from "@/app/generated/prisma/client";
import { ProductStatus } from "@/app/generated/prisma/client";
import { isProductStatus } from "./product-status";
import { normalizeSearchText } from "@/lib/search";

export const PRODUCT_LIST_MAX_LIMIT = 100;

export type ProductListQuery = {
  page: number;
  limit: number;
  search?: string;
  categoryId?: number;
  categorySlug?: string;
  gender?: Prisma.ProductWhereInput["gender"];
  color?: string;
  size?: string;
  minPrice?: number;
  maxPrice?: number;
  sort: string;
  status?: ProductStatus;
  stockStatus?: "IN_STOCK" | "OUT_OF_STOCK";
};

const positiveInt = (value: string | null, fallback: number) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export function parseProductListQuery(
  params: URLSearchParams,
  admin = false,
): ProductListQuery {
  const page = positiveInt(params.get("page"), 1);
  const limit = Math.min(
    PRODUCT_LIST_MAX_LIMIT,
    positiveInt(params.get("limit"), 12),
  );
  const minPrice =
    params.get("minPrice") == null ? undefined : Number(params.get("minPrice"));
  const maxPrice =
    params.get("maxPrice") == null ? undefined : Number(params.get("maxPrice"));
  const rawStatus = params.get("status");
  if (
    admin &&
    rawStatus &&
    rawStatus !== "ALL" &&
    !isProductStatus(rawStatus)
  ) {
    throw new Error(
      "Trạng thái sản phẩm không hợp lệ. Chọn PUBLIC, PRIVATE, DISCONTINUED hoặc ALL.",
    );
  }
  return {
    page,
    limit,
    search: normalizeSearchText(params.get("search")) || undefined,
    categoryId: params.get("categoryId")
      ? Number(params.get("categoryId"))
      : undefined,
    categorySlug: params.get("categorySlug")?.trim() || undefined,
    gender: (params.get("gender") || undefined) as ProductListQuery["gender"],
    color: params.get("color")?.trim() || undefined,
    size: params.get("size")?.trim() || undefined,
    minPrice:
      Number.isFinite(minPrice) && (minPrice as number) >= 0
        ? minPrice
        : undefined,
    maxPrice:
      Number.isFinite(maxPrice) && (maxPrice as number) >= 0
        ? maxPrice
        : undefined,
    sort: params.get("sort") || "newest",
    status:
      rawStatus && rawStatus !== "ALL"
        ? (rawStatus as ProductStatus)
        : undefined,
    stockStatus:
      params.get("stockStatus") === "IN_STOCK" ||
      params.get("stockStatus") === "OUT_OF_STOCK"
        ? (params.get("stockStatus") as "IN_STOCK" | "OUT_OF_STOCK")
        : undefined,
  };
}

export function buildSharedProductFilters(
  query: ProductListQuery,
  matchedProductIds?: number[],
): Prisma.ProductWhereInput {
  const filters: Prisma.ProductWhereInput = {};
  const variantFilters: Prisma.ProductVariantWhereInput[] = [];
  if (query.search) {
    if (matchedProductIds !== undefined) {
      filters.id = { in: matchedProductIds };
    } else {
      // Match every part independently so searches such as "ao len den" still
      // work when those words are not adjacent in the product data.
      const searchTokens = query.search.split(/\s+/).filter(Boolean);
      filters.AND = searchTokens.map((token) => ({
        OR: [
          { title: { contains: token, mode: "insensitive" } },
          { slug: { contains: token, mode: "insensitive" } },
          {
            variants: {
              some: {
                OR: [
                  { sku: { contains: token, mode: "insensitive" } },
                  { barcode: { contains: token, mode: "insensitive" } },
                  { color: { contains: token, mode: "insensitive" } },
                  { size: { contains: token, mode: "insensitive" } },
                ],
              },
            },
          },
        ],
      }));
    }
  }
  if (query.categoryId && Number.isInteger(query.categoryId))
    filters.categoryId = query.categoryId;
  if (query.categorySlug) filters.category = { slug: query.categorySlug };
  if (query.gender) filters.gender = query.gender;
  if (query.color)
    variantFilters.push({
      color: { contains: query.color, mode: "insensitive" },
    });
  if (query.size)
    variantFilters.push({
      size: { contains: query.size, mode: "insensitive" },
    });
  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    filters.sellPrice = {
      ...(query.minPrice !== undefined ? { gte: query.minPrice } : {}),
      ...(query.maxPrice !== undefined ? { lte: query.maxPrice } : {}),
    };
  }
  if (query.stockStatus) {
    variantFilters.push(
      query.stockStatus === "IN_STOCK"
        ? { isActive: true, quantity: { gt: 0 } }
        : { isActive: true, quantity: { lte: 0 } },
    );
  }
  if (variantFilters.length)
    filters.variants = { some: { AND: variantFilters } };
  return filters;
}

export const productOrderBy = (
  sort: string,
): Prisma.ProductOrderByWithRelationInput => {
  if (sort === "price-asc") return { sellPrice: "asc" };
  if (sort === "price-desc") return { sellPrice: "desc" };
  if (sort === "title-asc") return { title: "asc" };
  if (sort === "title-desc") return { title: "desc" };
  if (sort === "createdAt-asc") return { createdAt: "asc" };
  return { createdAt: "desc" };
};

export const publicProductSelect = {
  id: true,
  title: true,
  slug: true,
  imageUrl: true,
  sellPrice: true,
  quantity: true,
  description: true,
  descriptionHtml: true,
  descriptionContent: true,
  organicFavoriteCount: true,
  favoriteCountAdjustment: true,
  categoryId: true,
  gender: true,
  category: {
    select: { id: true, name: true, slug: true, color: true, icon: true, tryOnCategory: true },
  },
  images: {
    where: { variantId: null },
    orderBy: { position: "asc" as const },
    select: {
      id: true,
      url: true,
      publicId: true,
      altText: true,
      position: true,
      isPrimary: true,
    },
  },
  variants: {
    where: { isActive: true, quantity: { gt: 0 } },
    orderBy: { createdAt: "asc" as const },
    select: {
      id: true,
      sku: true,
      size: true,
      color: true,
      colorCode: true,
      sellPrice: true,
      comparePrice: true,
      quantity: true,
      reservedQuantity: true,
      isActive: true,
      images: {
        orderBy: { position: "asc" as const },
        select: {
          id: true,
          url: true,
          publicId: true,
          altText: true,
          position: true,
          isPrimary: true,
        },
      },
    },
  },
} as const;

export function serializePublicProduct<
  T extends {
    imageUrl: string;
    quantity: number;
    organicFavoriteCount: number;
    favoriteCountAdjustment: number;
    images: Array<{ isPrimary: boolean; url: string }>;
    variants: Array<{ quantity: number; reservedQuantity: number }>;
  },
>(product: T) {
  const variants = (product.variants || []).filter(
    (variant) => variant.quantity - (variant.reservedQuantity || 0) > 0,
  );
  const { organicFavoriteCount, favoriteCountAdjustment, ...safeProduct } =
    product;
  return {
    ...safeProduct,
    variants,
    imageUrl:
      product.images?.find((image) => image.isPrimary)?.url ||
      product.images?.[0]?.url ||
      product.imageUrl,
    totalAvailableStock: variants.length
      ? variants.reduce(
          (sum, variant) =>
            sum +
            Math.max(0, variant.quantity - (variant.reservedQuantity || 0)),
          0,
        )
      : product.variants.length
        ? 0
        : Math.max(0, product.quantity),
    displayFavoriteCount: Math.max(
      0,
      organicFavoriteCount + favoriteCountAdjustment,
    ),
    isFavorited: false,
  };
}
