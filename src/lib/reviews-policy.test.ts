import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateReviewSummary,
  canManageReview,
  getReviewPage,
  isAdminReviewRole,
  isCustomerReviewRole,
  REVIEW_COMMENT_MAX_LENGTH,
  validateReviewPayload,
} from "./reviews-policy.ts";

test("validates the rating and comment contract", () => {
  assert.deepEqual(validateReviewPayload({ rating: 5, comment: " Rất đẹp " }), {
    ok: true,
    rating: 5,
    comment: "Rất đẹp",
  });
  assert.equal(validateReviewPayload({ rating: 6, comment: "x" }).ok, false);
  assert.equal(validateReviewPayload({ rating: 3.5, comment: "x" }).ok, false);
  assert.equal(validateReviewPayload({ rating: 3, comment: "   " }).ok, false);
  assert.equal(
    validateReviewPayload({ rating: 3, comment: "x".repeat(REVIEW_COMMENT_MAX_LENGTH + 1) }).ok,
    false,
  );
});

test("enforces customer/admin roles and ownership", () => {
  assert.equal(isCustomerReviewRole("CUSTOMER"), true);
  assert.equal(isCustomerReviewRole("ADMIN"), false);
  assert.equal(isAdminReviewRole("SUPER_ADMIN"), true);
  assert.equal(isAdminReviewRole("CUSTOMER"), false);
  assert.equal(canManageReview(7, 7), true);
  assert.equal(canManageReview(7, 8), false);
  assert.equal(canManageReview(null, 7), false);
});

test("summaries exclude hidden reviews and calculate breakdown/average", () => {
  assert.deepEqual(
    calculateReviewSummary([
      { rating: 5, isApproved: true },
      { rating: 4, isApproved: true },
      { rating: 1, isApproved: false },
    ]),
    { average: 4.5, total: 2, breakdown: { 1: 0, 2: 0, 3: 0, 4: 1, 5: 1 } },
  );
  assert.deepEqual(calculateReviewSummary([]), {
    average: 0,
    total: 0,
    breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });
});

test("paginates reviews without loading all records into a page", () => {
  assert.deepEqual(getReviewPage([1, 2, 3, 4, 5, 6], 2, 2), [3, 4]);
  assert.deepEqual(getReviewPage([1, 2], 0, 5), [1, 2]);
});
