export const REVIEW_COMMENT_MAX_LENGTH = 1000;

export type ReviewRole = "CUSTOMER" | "ADMIN" | "SUPER_ADMIN" | string | null | undefined;

export type ReviewSummary = {
  average: number;
  total: number;
  breakdown: Record<1 | 2 | 3 | 4 | 5, number>;
};

export type ReviewPayloadResult =
  | { ok: true; rating: number; comment: string }
  | { ok: false; message: string };

export function isCustomerReviewRole(role: ReviewRole) {
  return role === "CUSTOMER";
}

export function isAdminReviewRole(role: ReviewRole) {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

export function canManageReview(reviewUserId: number | null, actorUserId: number) {
  return reviewUserId !== null && reviewUserId === actorUserId;
}

export function validateReviewPayload(value: unknown): ReviewPayloadResult {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return { ok: false, message: "Dữ liệu đánh giá không hợp lệ." };
  }

  const input = value as { rating?: unknown; comment?: unknown };
  const rating = input.rating;
  const comment = typeof input.comment === "string" ? input.comment.trim() : "";

  if (
    typeof rating !== "number" ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    return { ok: false, message: "Vui lòng chọn số sao từ 1 đến 5." };
  }

  if (!comment) {
    return { ok: false, message: "Vui lòng nhập nội dung đánh giá." };
  }

  if (comment.length > REVIEW_COMMENT_MAX_LENGTH) {
    return {
      ok: false,
      message: `Nội dung đánh giá không được vượt quá ${REVIEW_COMMENT_MAX_LENGTH} ký tự.`,
    };
  }

  return { ok: true, rating, comment };
}

export function calculateReviewSummary(
  reviews: readonly { rating: number; isApproved: boolean }[],
): ReviewSummary {
  const breakdown: Record<1 | 2 | 3 | 4 | 5, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };
  const visible = reviews.filter(
    (review) => review.isApproved && review.rating >= 1 && review.rating <= 5,
  );
  let totalRating = 0;

  for (const review of visible) {
    const rating = review.rating as 1 | 2 | 3 | 4 | 5;
    breakdown[rating] += 1;
    totalRating += rating;
  }

  return {
    average: visible.length ? Math.round((totalRating / visible.length) * 10) / 10 : 0,
    total: visible.length,
    breakdown,
  };
}

export function getReviewPage<T>(items: readonly T[], page: number, limit: number) {
  const safeLimit = Math.max(1, Math.floor(limit));
  const safePage = Math.max(1, Math.floor(page));
  const start = (safePage - 1) * safeLimit;
  return items.slice(start, start + safeLimit);
}
