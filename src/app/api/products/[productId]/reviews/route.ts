import { NextResponse } from "next/server";
import {
  getPublicReviews,
  PUBLIC_REVIEW_PAGE_SIZE,
  resolvePublicProductId,
  REVIEW_BODY_LIMIT,
} from "@/lib/reviews";
import {
  isCustomerReviewRole,
  validateReviewPayload,
} from "@/lib/reviews-policy";
import prisma from "@/lib/db";
import { allowReviewWrite } from "@/lib/reviews-rate-limit";

const noStore = { "Cache-Control": "private, no-store" };

function userIdFromRequest(request: Request) {
  const userId = Number(request.headers.get("x-user-id"));
  return Number.isInteger(userId) && userId > 0 ? userId : null;
}

function errorResponse(message: string, status: number) {
  return NextResponse.json({ message }, { status, headers: noStore });
}

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ productId: string }> },
) {
  const productId = await resolvePublicProductId((await params).productId);
  if (!productId) return errorResponse("Không tìm thấy sản phẩm.", 404);

  const searchParams = new URL(request.url).searchParams;
  const requestedPage = Number(searchParams.get("page") || 1);
  const requestedLimit = Number(searchParams.get("limit") || PUBLIC_REVIEW_PAGE_SIZE);
  const page = Number.isInteger(requestedPage) ? Math.max(1, requestedPage) : 1;
  const limit = Number.isInteger(requestedLimit)
    ? Math.min(10, Math.max(1, requestedLimit))
    : PUBLIC_REVIEW_PAGE_SIZE;

  try {
    const data = await getPublicReviews(
      productId,
      page,
      limit,
      userIdFromRequest(request),
    );
    return NextResponse.json(data, { headers: noStore });
  } catch {
    return errorResponse("Không thể tải đánh giá sản phẩm.", 500);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ productId: string }> },
) {
  const userId = userIdFromRequest(request);
  if (!userId) return errorResponse("Vui lòng đăng nhập để đánh giá sản phẩm.", 401);
  if (!isCustomerReviewRole(request.headers.get("x-user-role"))) {
    return errorResponse("Chỉ khách hàng mới có thể gửi đánh giá.", 403);
  }
  if (Number(request.headers.get("content-length") || 0) > REVIEW_BODY_LIMIT) {
    return errorResponse("Nội dung gửi lên quá lớn.", 413);
  }
  if (!allowReviewWrite(userId)) {
    return errorResponse("Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.", 429);
  }

  const productId = await resolvePublicProductId((await params).productId);
  if (!productId) return errorResponse("Không tìm thấy sản phẩm.", 404);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Dữ liệu đánh giá không hợp lệ.", 400);
  }
  const payload = validateReviewPayload(body);
  if (!payload.ok) return errorResponse(payload.message, 400);

  try {
    const review = await prisma.review.create({
      data: {
        userId,
        productId,
        rating: payload.rating,
        comment: payload.comment,
        isApproved: true,
      },
      select: { id: true, rating: true, comment: true, isApproved: true, createdAt: true, updatedAt: true },
    });
    return NextResponse.json({ review }, { status: 201, headers: noStore });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return errorResponse("Bạn đã đánh giá sản phẩm này. Mỗi khách hàng chỉ được gửi một đánh giá.", 409);
    }
    return errorResponse("Không thể gửi đánh giá lúc này.", 500);
  }
}
