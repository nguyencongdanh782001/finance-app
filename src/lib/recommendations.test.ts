import assert from "node:assert/strict";
import test from "node:test";
import {
  getCategoryInterestScores,
  getDedupeBucket,
  getPersonalizedCategoryIds,
  isMeaningfulVisibleView,
  isRecommendationEligibleProduct,
  PRODUCT_VIEW_DEDUP_WINDOW_MS,
  selectRecommendationMix,
} from "./recommendations-policy.ts";

const now = new Date("2026-09-26T12:00:00.000Z");

test("a view before three seconds is not meaningful", () => {
  assert.equal(
    isMeaningfulVisibleView({
      startedAt: 1_000,
      now: 3_999,
      wasHidden: false,
    }),
    false,
  );
});

test("a hidden tab cannot produce a meaningful view", () => {
  assert.equal(
    isMeaningfulVisibleView({
      startedAt: 1_000,
      now: 10_000,
      wasHidden: true,
    }),
    false,
  );
});

test("the same product dedupes within one window and can count in a later window", () => {
  const first = new Date("2026-09-26T12:00:00.000Z");
  const withinWindow = new Date(first.getTime() + PRODUCT_VIEW_DEDUP_WINDOW_MS - 1);
  const laterWindow = new Date(first.getTime() + PRODUCT_VIEW_DEDUP_WINDOW_MS);
  assert.equal(getDedupeBucket(first), getDedupeBucket(withinWindow));
  assert.notEqual(getDedupeBucket(first), getDedupeBucket(laterWindow));
});

test("recent category views score higher than equally numerous old views", () => {
  const scores = getCategoryInterestScores(
    [
      { categoryId: 1, productId: 10, viewedAt: new Date("2026-09-25T12:00:00Z") },
      { categoryId: 1, productId: 11, viewedAt: new Date("2026-09-24T12:00:00Z") },
      { categoryId: 2, productId: 20, viewedAt: new Date("2026-08-27T12:00:00Z") },
      { categoryId: 2, productId: 21, viewedAt: new Date("2026-08-26T12:00:00Z") },
    ],
    now,
  );
  assert.equal(scores[0]?.categoryId, 1);
  assert.ok((scores[0]?.score || 0) > (scores[1]?.score || 0));
});

test("one accidental view does not activate personalization", () => {
  const scores = getCategoryInterestScores(
    [{ categoryId: 1, productId: 10, viewedAt: now }],
    now,
  );
  assert.deepEqual(getPersonalizedCategoryIds(scores), []);
});

test("recommendation mix contains no duplicates and keeps discovery space", () => {
  const products = (ids: number[], categoryId: number) =>
    ids.map((id) => ({ id, categoryId }));
  const selected = selectRecommendationMix({
    preferredCategoryIds: [1, 2],
    preferredCandidates: [...products([1, 2, 3], 1), ...products([4, 5], 2)],
    discoveryCandidates: products([6, 7, 8], 3),
    limit: 8,
  });
  assert.equal(selected.length, 8);
  assert.equal(new Set(selected.map((product) => product.id)).size, 8);
  assert.ok(selected.some((product) => product.categoryId === 3));
});

test("private, discontinued, and unavailable products are not eligible", () => {
  const base = {
    quantity: 0,
    variants: [{ quantity: 0, reservedQuantity: 0, isActive: true }],
  };
  assert.equal(
    isRecommendationEligibleProduct({ ...base, status: "PRIVATE" }),
    false,
  );
  assert.equal(
    isRecommendationEligibleProduct({
      ...base,
      status: "DISCONTINUED",
      quantity: 5,
    }),
    false,
  );
  assert.equal(
    isRecommendationEligibleProduct({ ...base, status: "PUBLIC" }),
    false,
  );
  assert.equal(
    isRecommendationEligibleProduct({
      status: "PUBLIC",
      quantity: 0,
      variants: [{ quantity: 3, reservedQuantity: 1, isActive: true }],
    }),
    true,
  );
});
