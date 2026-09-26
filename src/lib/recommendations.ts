import type { Prisma } from "../app/generated/prisma/client";
import prisma from "./db";
import {
  getCategoryInterestScores,
  getDedupeBucket,
  getPersonalizedCategoryIds,
  isRecommendationEligibleProduct,
  selectRecommendationMix,
  PRODUCT_VIEW_RETENTION_DAYS,
} from "./recommendations-policy";
import type { CategoryViewSignal } from "./recommendations-policy";

export {
  getCategoryInterestScores,
  getDedupeBucket,
  getPersonalizedCategoryIds,
  isMeaningfulVisibleView,
  isRecommendationEligibleProduct,
  selectRecommendationMix,
  PRODUCT_VIEW_DEDUP_WINDOW_MS,
  PRODUCT_VIEW_RETENTION_DAYS,
  PRODUCT_VIEW_THRESHOLD_MS,
} from "./recommendations-policy";

export const recommendationProductInclude = {
  category: true,
  images: {
    where: { variantId: null },
    orderBy: { position: "asc" as const },
  },
  variants: {
    where: { isActive: true },
    orderBy: { createdAt: "asc" as const },
    include: { images: { orderBy: { position: "asc" as const } } },
  },
} satisfies Prisma.ProductInclude;

export type RecommendationProduct = Prisma.ProductGetPayload<{
  include: typeof recommendationProductInclude;
}>;

const availableProductWhere = (): Prisma.ProductWhereInput => ({
  status: "PUBLIC",
  OR: [
    { quantity: { gt: 0 } },
    { variants: { some: { isActive: true, quantity: { gt: 0 } } } },
  ],
});

const recommendationOrderBy: Prisma.ProductOrderByWithRelationInput[] = [
  { isFeatured: "desc" },
  { soldCount: "desc" },
  { createdAt: "desc" },
  { id: "asc" },
];

export async function getProductRecommendations(input: {
  userId?: number;
  visitorId?: string;
  now?: Date;
  limit?: number;
}): Promise<RecommendationProduct[]> {
  const now = input.now || new Date();
  const cutoff = new Date(
    now.getTime() - PRODUCT_VIEW_RETENTION_DAYS * 24 * 60 * 60 * 1_000,
  );
  const identities: Prisma.ProductViewEventWhereInput[] = [];
  if (input.userId) identities.push({ userId: input.userId });
  if (input.visitorId) identities.push({ visitorId: input.visitorId });
  if (!identities.length) return [];

  const events = await prisma.productViewEvent.findMany({
    where: { viewedAt: { gte: cutoff, lte: now }, OR: identities },
    orderBy: { viewedAt: "desc" },
    take: 500,
    select: { categoryId: true, productId: true, viewedAt: true },
  });
  const signals: CategoryViewSignal[] = events.flatMap((event) =>
    event.categoryId === null
      ? []
      : [
          {
            categoryId: event.categoryId,
            productId: event.productId,
            viewedAt: event.viewedAt,
          },
        ],
  );
  const preferredCategoryIds = getPersonalizedCategoryIds(
    getCategoryInterestScores(signals, now),
  );
  if (!preferredCategoryIds.length) return [];

  const viewedProductIds = [...new Set(events.map((event) => event.productId))];
  const limit = input.limit ?? 8;
  const candidateTake = Math.max(limit * 8, 24);
  const preferredWhere: Prisma.ProductWhereInput = {
    ...availableProductWhere(),
    categoryId: { in: preferredCategoryIds },
    ...(viewedProductIds.length ? { id: { notIn: viewedProductIds } } : {}),
  };
  const discoveryWhere: Prisma.ProductWhereInput = {
    ...availableProductWhere(),
    categoryId: { notIn: preferredCategoryIds },
    ...(viewedProductIds.length ? { id: { notIn: viewedProductIds } } : {}),
  };
  const [preferredCandidates, discoveryCandidates] = await Promise.all([
    prisma.product.findMany({
      where: preferredWhere,
      orderBy: recommendationOrderBy,
      take: candidateTake,
      include: recommendationProductInclude,
    }),
    prisma.product.findMany({
      where: discoveryWhere,
      orderBy: recommendationOrderBy,
      take: candidateTake,
      include: recommendationProductInclude,
    }),
  ]);
  const availablePreferred = preferredCandidates.filter(
    isRecommendationEligibleProduct,
  );
  const availableDiscovery = discoveryCandidates.filter(
    isRecommendationEligibleProduct,
  );
  const selected = selectRecommendationMix({
    preferredCategoryIds,
    preferredCandidates: availablePreferred,
    discoveryCandidates: availableDiscovery,
    limit,
  });

  if (selected.length >= limit) return selected;

  const selectedIds = new Set(selected.map((product) => product.id));
  const fallbackCandidates = await prisma.product.findMany({
    where: {
      ...availableProductWhere(),
      ...(viewedProductIds.length ? { id: { notIn: viewedProductIds } } : {}),
    },
    orderBy: recommendationOrderBy,
    take: candidateTake,
    include: recommendationProductInclude,
  });
  return [
    ...selected,
    ...fallbackCandidates.filter(
      (product) =>
        !selectedIds.has(product.id) && isRecommendationEligibleProduct(product),
    ),
  ].slice(0, limit);
}
