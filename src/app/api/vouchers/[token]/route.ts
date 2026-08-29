import prisma from "@/lib/db";
import { getDiscountStatus } from "@/lib/discounts";
import { NextResponse } from "next/server";

export async function GET(_request: Request, context: { params: Promise<{ token: string }> }) {
  const coupon = await prisma.coupon.findUnique({ where: { publicToken: (await context.params).token } });
  if (!coupon) return NextResponse.json({ message: "Không tìm thấy voucher." }, { status: 404 });
  return NextResponse.json({ name: coupon.name, description: coupon.description, code: coupon.code, type: coupon.type, value: Number(coupon.value), minOrderAmount: coupon.minOrderAmount ? Number(coupon.minOrderAmount) : null, endsAt: coupon.endsAt, status: getDiscountStatus(coupon) });
}
