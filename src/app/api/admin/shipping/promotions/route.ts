/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import prisma from "@/lib/db";

const adminOnly = (request: Request) =>
  ["ADMIN", "SUPER_ADMIN"].includes(request.headers.get("x-user-role") || "");
const serialize = (promotion: any) => ({
  ...promotion,
  freeDistanceKm: Number(promotion.freeDistanceKm),
});
const parse = (body: any) => ({
  name: String(body.name || "").trim(),
  description: String(body.description || "").trim() || null,
  minimumOrderValue: Math.round(Number(body.minimumOrderValue)),
  freeDistanceKm: Number(body.freeDistanceKm),
  maximumShippingDiscount:
    body.maximumShippingDiscount === "" || body.maximumShippingDiscount == null
      ? null
      : Math.round(Number(body.maximumShippingDiscount)),
  priority: Math.round(Number(body.priority || 0)),
  isActive: body.isActive !== false,
  startsAt: body.startsAt ? new Date(body.startsAt) : null,
  endsAt: body.endsAt ? new Date(body.endsAt) : null,
});
const validate = (data: ReturnType<typeof parse>) => {
  if (!data.name) return "Vui lòng nhập tên chương trình.";
  if (!Number.isFinite(data.minimumOrderValue) || data.minimumOrderValue < 0)
    return "Giá trị đơn hàng tối thiểu phải lớn hơn hoặc bằng 0.";
  if (!Number.isFinite(data.freeDistanceKm) || data.freeDistanceKm <= 0)
    return "Số km miễn phí phải lớn hơn 0.";
  if (
    data.maximumShippingDiscount != null &&
    (!Number.isFinite(data.maximumShippingDiscount) ||
      data.maximumShippingDiscount <= 0)
  )
    return "Mức giảm tối đa phải lớn hơn 0.";
  if (data.startsAt && Number.isNaN(data.startsAt.getTime()))
    return "Thời gian bắt đầu không hợp lệ.";
  if (data.endsAt && Number.isNaN(data.endsAt.getTime()))
    return "Thời gian kết thúc không hợp lệ.";
  if (data.startsAt && data.endsAt && data.endsAt <= data.startsAt)
    return "Thời gian kết thúc phải sau thời gian bắt đầu.";
  return null;
};

export async function GET(request: Request) {
  if (!adminOnly(request))
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  const promotions = await prisma.shippingPromotion.findMany({
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(promotions.map(serialize));
}

export async function POST(request: Request) {
  if (!adminOnly(request))
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  const data = parse(await request.json().catch(() => ({})));
  const validationError = validate(data);
  if (validationError)
    return NextResponse.json({ message: validationError }, { status: 422 });
  const userId = Number(request.headers.get("x-user-id")) || null;
  const promotion = await prisma.shippingPromotion.create({
    data: { ...data, createdById: userId, updatedById: userId },
  });
  return NextResponse.json(serialize(promotion), { status: 201 });
}
