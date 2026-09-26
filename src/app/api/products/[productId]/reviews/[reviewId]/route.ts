import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { allowReviewWrite } from "@/lib/reviews-rate-limit";
import { resolvePublicProductId, REVIEW_BODY_LIMIT } from "@/lib/reviews";
import {
  isCustomerReviewRole,
  validateReviewPayload,
} from "@/lib/reviews-policy";

const noStore = { "Cache-Control": "private, no-store" };

function userIdFromRequest(request: Request) {
  const userId = Number(request.headers.get("x-user-id"));
  return Number.isInteger(userId) && userId > 0 ? userId : null;
}

function response(message: string, status: number) {
  return NextResponse.json({ message }, { status, headers: noStore });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ productId: string; reviewId: string }> },
) {
  const userId = userIdFromRequest(request);
  if (!userId) return response("Vui lòng đăng nhập để chỉnh sửa đánh giá.", 401);
  if (!isCustomerReviewRole(request.headers.get("x-user-role"))) {
    return response("Chỉ khách hàng mới có thể chỉnh sửa đánh giá.", 403);
  }
  if (Number(request.headers.get("content-length") || 0) > REVIEW_BODY_LIMIT) {
    return response("Nội dung gửi lên quá lớn.", 413);
  }
  if (!allowReviewWrite(userId)) {
    return response("Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.", 429);
  }

  const routeParams = await params;
  const productId = await resolvePublicProductId(routeParams.productId);
  const reviewId = Number(routeParams.reviewId);
  if (!productId || !Number.isInteger(reviewId) || reviewId < 1) {
    return response("Không tìm thấy đánh giá.", 404);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return response("Dữ liệu đánh giá không hợp lệ.", 400);
  }
  const payload = validateReviewPayload(body);
  if (!payload.ok) return response(payload.message, 400);

  const result = await prisma.review.updateMany({
    where: { id: reviewId, productId, userId },
    data: { rating: payload.rating, comment: payload.comment },
  });
  if (!result.count) return response("Bạn không có quyền chỉnh sửa đánh giá này.", 404);

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { id: true, rating: true, comment: true, isApproved: true, createdAt: true, updatedAt: true },
  });
  return NextResponse.json({ review }, { headers: noStore });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ productId: string; reviewId: string }> },
) {
  const userId = userIdFromRequest(request);
  if (!userId) return response("Vui lòng đăng nhập để xóa đánh giá.", 401);
  if (!isCustomerReviewRole(request.headers.get("x-user-role"))) {
    return response("Chỉ khách hàng mới có thể xóa đánh giá.", 403);
  }
  if (!allowReviewWrite(userId)) {
    return response("Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.", 429);
  }

  const routeParams = await params;
  const productId = await resolvePublicProductId(routeParams.productId);
  const reviewId = Number(routeParams.reviewId);
  if (!productId || !Number.isInteger(reviewId) || reviewId < 1) {
    return response("Không tìm thấy đánh giá.", 404);
  }

  const result = await prisma.review.deleteMany({
    where: { id: reviewId, productId, userId },
  });
  if (!result.count) return response("Bạn không có quyền xóa đánh giá này.", 404);
  return NextResponse.json({ deleted: true }, { headers: noStore });
}
