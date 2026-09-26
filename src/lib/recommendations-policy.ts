export const PRODUCT_VIEW_THRESHOLD_MS = 3_000;
export const PRODUCT_VIEW_DEDUP_WINDOW_MS = 30 * 60 * 1_000;
export const PRODUCT_VIEW_RETENTION_DAYS = 30;
export const CATEGORY_INTEREST_HALF_LIFE_DAYS = 14;
export const MIN_PERSONALIZATION_SCORE = 1.5;
export const MIN_PERSONALIZATION_DISTINCT_PRODUCTS = 2;
export const RECOMMENDATION_LIMIT = 8;

export type CategoryViewSignal = {
  categoryId: number;
  productId: number;
  viewedAt: Date;
};

export type CategoryInterestScore = {
  categoryId: number;
  score: number;
  distinctProductCount: number;
  lastViewedAt: Date;
};

export function getDedupeBucket(viewedAt: Date): number {
  return Math.floor(viewedAt.getTime() / PRODUCT_VIEW_DEDUP_WINDOW_MS);
}

export function isMeaningfulVisibleView(input: {
  startedAt: number;
  now: number;
  wasHidden: boolean;
}): boolean {
  return !input.wasHidden && input.now - input.startedAt >= PRODUCT_VIEW_THRESHOLD_MS;
}

export function getCategoryInterestScores(
  events: readonly CategoryViewSignal[],
  now = new Date(),
): CategoryInterestScore[] {
  const cutoff = new Date(
    now.getTime() - PRODUCT_VIEW_RETENTION_DAYS * 24 * 60 * 60 * 1_000,
  );
  const byCategory = new Map<
    number,
    { score: number; products: Set<number>; lastViewedAt: Date }
  >();

  for (const event of events) {
    if (event.viewedAt < cutoff || event.viewedAt > now) continue;
    const ageDays = Math.max(
      0,
      (now.getTime() - event.viewedAt.getTime()) / (24 * 60 * 60 * 1_000),
    );
    const weight = Math.pow(0.5, ageDays / CATEGORY_INTEREST_HALF_LIFE_DAYS);
    const current = byCategory.get(event.categoryId) || {
      score: 0,
      products: new Set<number>(),
      lastViewedAt: event.viewedAt,
    };
    current.score += weight;
    current.products.add(event.productId);
    if (event.viewedAt > current.lastViewedAt) {
      current.lastViewedAt = event.viewedAt;
    }
    byCategory.set(event.categoryId, current);
  }

  return [...byCategory.entries()]
    .map(([categoryId, value]) => ({
      categoryId,
      score: value.score,
      distinctProductCount: value.products.size,
      lastViewedAt: value.lastViewedAt,
    }))
    .sort(
      (left, right) =>
        right.score - left.score ||
        right.distinctProductCount - left.distinctProductCount ||
        right.lastViewedAt.getTime() - left.lastViewedAt.getTime() ||
        left.categoryId - right.categoryId,
    );
}

export function getPersonalizedCategoryIds(
  scores: readonly CategoryInterestScore[],
): number[] {
  return scores
    .filter(
      (score) =>
        score.score >= MIN_PERSONALIZATION_SCORE &&
        score.distinctProductCount >= MIN_PERSONALIZATION_DISTINCT_PRODUCTS,
    )
    .slice(0, 3)
    .map((score) => score.categoryId);
}

const getRecommendationStock = (product: {
  quantity: number;
  variants?: Array<{
    quantity: number;
    reservedQuantity?: number | null;
    isActive: boolean;
  }>;
}) => {
  const activeVariants = (product.variants || []).filter(
    (variant) => variant.isActive,
  );
  if (!activeVariants.length) return Math.max(0, Number(product.quantity));
  return activeVariants.reduce(
    (total, variant) =>
      total +
      Math.max(
        0,
        Number(variant.quantity) - Number(variant.reservedQuantity || 0),
      ),
    0,
  );
};

export function isRecommendationEligibleProduct(product: {
  status: "PUBLIC" | "PRIVATE" | "DISCONTINUED" | string;
  quantity: number;
  variants?: Array<{
    quantity: number;
    reservedQuantity?: number | null;
    isActive: boolean;
  }>;
}): boolean {
  return product.status === "PUBLIC" && getRecommendationStock(product) > 0;
}

export function selectRecommendationMix<T extends { id: number; categoryId: number }>(input: {
  preferredCategoryIds: readonly number[];
  preferredCandidates: readonly T[];
  discoveryCandidates: readonly T[];
  fallbackCandidates?: readonly T[];
  limit?: number;
}): T[] {
  const limit = input.limit ?? RECOMMENDATION_LIMIT;
  const preferredTarget = Math.ceil(limit * 0.6);
  const discoveryTarget = limit - preferredTarget;
  const selected: T[] = [];
  const selectedIds = new Set<number>();

  const add = (candidate: T) => {
    if (selected.length >= limit || selectedIds.has(candidate.id)) return;
    selectedIds.add(candidate.id);
    selected.push(candidate);
  };

  const candidatesByCategory = new Map<number, T[]>();
  for (const categoryId of input.preferredCategoryIds) {
    candidatesByCategory.set(categoryId, []);
  }
  for (const candidate of input.preferredCandidates) {
    candidatesByCategory.get(candidate.categoryId)?.push(candidate);
  }

  let preferredAdded = 0;
  while (preferredAdded < preferredTarget) {
    let addedInRound = false;
    for (const categoryId of input.preferredCategoryIds) {
      const categoryCandidates = candidatesByCategory.get(categoryId) || [];
      const candidate = categoryCandidates.shift();
      if (!candidate) continue;
      add(candidate);
      preferredAdded += 1;
      addedInRound = true;
      if (preferredAdded >= preferredTarget) break;
    }
    if (!addedInRound) break;
  }

  let discoveryAdded = 0;
  for (const candidate of input.discoveryCandidates) {
    if (discoveryAdded >= discoveryTarget) break;
    const before = selected.length;
    add(candidate);
    if (selected.length > before) discoveryAdded += 1;
  }

  for (const candidate of input.preferredCandidates) add(candidate);
  for (const candidate of input.discoveryCandidates) add(candidate);
  for (const candidate of input.fallbackCandidates || []) add(candidate);

  return selected.slice(0, limit);
}
