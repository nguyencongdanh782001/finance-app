import prisma from "@/lib/db";
import { REVIEW_COMMENT_MAX_LENGTH, type ReviewSummary } from "@/lib/reviews-policy";

export { REVIEW_COMMENT_MAX_LENGTH };

export const PUBLIC_REVIEW_PAGE_SIZE = 5;
export const REVIEW_BODY_LIMIT = 20_000;

type ReviewUser = {
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
};

const reviewUserSelect = {
  displayName: true,
  firstName: true,
  lastName: true,
} as const;

export type PublicReview = {
  id: number;
  rating: number;
  comment: string;
  authorName: string;
  createdAt: Date;
  updatedAt: Date;
};

export type OwnedReview = PublicReview & { isApproved: boolean };

export type ReviewSummaryResponse = ReviewSummary;

function authorName(user: ReviewUser | null) {
  if (!user) return "Khách hàng";
  return (
    user.displayName?.trim() ||
    [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
    "Khách hàng"
  );
}

function serializeReview(review: {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: Date;
  updatedAt: Date;
  isApproved: boolean;
  user: ReviewUser | null;
}): OwnedReview {
  return {
    id: review.id,
    rating: review.rating,
    comment: review.comment || "",
    authorName: authorName(review.user),
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
    isApproved: review.isApproved,
  };
}

export async function resolvePublicProductId(identifier: string) {
  const numericId = Number(identifier);
  const product = await prisma.product.findFirst({
    where: {
      status: "PUBLIC",
      ...(Number.isInteger(numericId)
        ? { OR: [{ id: numericId }, { slug: identifier }] }
        : { slug: identifier }),
    },
    select: { id: true },
  });
  return product?.id ?? null;
}

export async function getPublicReviews(
  productId: number,
  page: number,
  limit: number,
  userId: number | null,
) {
  const skip = (page - 1) * limit;
  const where = { productId, isApproved: true } as const;
  const [reviews, total, groups, owned] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: { user: { select: reviewUserSelect } },
    }),
    prisma.review.count({ where }),
    prisma.review.groupBy({
      by: ["rating"],
      where,
      _count: { _all: true },
    }),
    userId
      ? prisma.review.findUnique({
          where: { userId_productId: { userId, productId } },
          include: { user: { select: reviewUserSelect } },
        })
      : Promise.resolve(null),
  ]);

  const breakdown: ReviewSummary["breakdown"] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let ratingTotal = 0;
  for (const group of groups) {
    if (group.rating >= 1 && group.rating <= 5) {
      const rating = group.rating as 1 | 2 | 3 | 4 | 5;
      breakdown[rating] = group._count._all;
      ratingTotal += rating * group._count._all;
    }
  }
  const summary: ReviewSummary = {
    average: total ? Math.round((ratingTotal / total) * 10) / 10 : 0,
    total,
    breakdown,
  };

  return {
    reviews: reviews.map(serializeReview),
    summary,
    myReview: owned ? serializeReview(owned) : null,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    },
  };
}

export async function getAdminReviews({
  page,
  limit,
  status,
  search,
}: {
  page: number;
  limit: number;
  status: "all" | "visible" | "hidden";
  search: string;
}) {
  const visibility =
    status === "visible"
      ? { isApproved: true }
      : status === "hidden"
        ? { isApproved: false }
        : {};
  const normalizedSearch = search.trim();
  const where = {
    ...visibility,
    ...(normalizedSearch
      ? {
          OR: [
            { comment: { contains: normalizedSearch, mode: "insensitive" as const } },
            { product: { title: { contains: normalizedSearch, mode: "insensitive" as const } } },
            { user: { displayName: { contains: normalizedSearch, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };
  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: reviewUserSelect },
        product: { select: { id: true, title: true, slug: true } },
      },
    }),
    prisma.review.count({ where }),
  ]);

  return {
    reviews: reviews.map((review) => ({
      ...serializeReview(review),
      product: review.product,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    },
  };
}
