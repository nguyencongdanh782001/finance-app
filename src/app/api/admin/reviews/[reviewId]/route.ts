import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { isAdminReviewRole } from "@/lib/reviews-policy";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ reviewId: string }> },
) {
  if (
    !request.headers.get("x-user-id") ||
    !isAdminReviewRole(request.headers.get("x-user-role"))
  ) {
    return NextResponse.json(
      { message: request.headers.get("x-user-role") ? "Forbidden" : "Unauthorized" },
      { status: request.headers.get("x-user-role") ? 403 : 401 },
    );
  }

  const reviewId = Number((await params).reviewId);
  if (!Number.isInteger(reviewId) || reviewId < 1) {
    return NextResponse.json({ message: "Đánh giá không hợp lệ." }, { status: 400 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Dữ liệu không hợp lệ." }, { status: 400 });
  }
  const visible =
    typeof body === "object" && body !== null && "visible" in body
      ? (body as { visible?: unknown }).visible
      : undefined;
  if (typeof visible !== "boolean") {
    return NextResponse.json({ message: "Trạng thái hiển thị không hợp lệ." }, { status: 400 });
  }

  const result = await prisma.review.updateMany({
    where: { id: reviewId },
    data: { isApproved: visible },
  });
  if (!result.count) return NextResponse.json({ message: "Không tìm thấy đánh giá." }, { status: 404 });
  return NextResponse.json({ id: reviewId, isApproved: visible });
}
