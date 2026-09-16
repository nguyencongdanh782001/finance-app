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
const validation = (data: ReturnType<typeof parse>) =>
  !data.name ||
  !Number.isFinite(data.minimumOrderValue) ||
  data.minimumOrderValue < 0 ||
  !Number.isFinite(data.freeDistanceKm) ||
  data.freeDistanceKm <= 0 ||
  (data.startsAt && data.endsAt && data.endsAt <= data.startsAt);

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!adminOnly(request))
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  const id = Number((await context.params).id);
  const data = parse(await request.json().catch(() => ({})));
  if (!id || validation(data))
    return NextResponse.json(
      { message: "Thông tin ưu đãi không hợp lệ." },
      { status: 422 },
    );
  const promotion = await prisma.shippingPromotion.update({
    where: { id },
    data: {
      ...data,
      updatedById: Number(request.headers.get("x-user-id")) || null,
    },
  });
  return NextResponse.json(serialize(promotion));
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!adminOnly(request))
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  const id = Number((await context.params).id);
  if (!id)
    return NextResponse.json(
      { message: "Ưu đãi không hợp lệ." },
      { status: 422 },
    );
  const used = await prisma.order.count({ where: { shippingPromotionId: id } });
  if (used) {
    const promotion = await prisma.shippingPromotion.update({
      where: { id },
      data: { isActive: false },
    });
    return NextResponse.json({ ...serialize(promotion), deactivated: true });
  }
  await prisma.shippingPromotion.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
