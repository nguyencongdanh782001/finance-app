import { getAdminFromRequest } from "@/lib/orders/daily-orders";
import { generateDiscountCode, generatePublicToken, getDiscountStatus, normalizeDiscountCode } from "@/lib/discounts";
import prisma from "@/lib/db";
import { CouponType } from "@/app/generated/prisma/client";
import { NextResponse } from "next/server";

const errorResponse = (error: unknown) =>
  NextResponse.json({ message: error instanceof Error ? error.message : "Không thể xử lý mã giảm giá." }, { status: 400 });

const parseDate = (value: unknown) => {
  if (!value) return null;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
};

const parsePayload = (body: Record<string, unknown>) => {
  const code = normalizeDiscountCode(String(body.code || ""));
  const name = String(body.name || "").trim();
  const type = body.type === CouponType.PERCENTAGE ? CouponType.PERCENTAGE : CouponType.FIXED_AMOUNT;
  const value = Math.round(Number(body.value));
  if (!name) throw new Error("Vui lòng nhập tên chương trình.");
  if (!code || !/^[A-Z0-9-]+$/.test(code)) throw new Error("Mã giảm giá không hợp lệ.");
  if (type === CouponType.PERCENTAGE && (value < 1 || value > 100)) throw new Error("Phần trăm giảm phải từ 1 đến 100.");
  if (type === CouponType.FIXED_AMOUNT && value <= 0) throw new Error("Giá trị giảm phải lớn hơn 0.");
  const usageLimit = body.usageLimit ? Math.round(Number(body.usageLimit)) : null;
  if (usageLimit !== null && usageLimit < 1) throw new Error("Giới hạn lượt dùng không hợp lệ.");
  const usageLimitPerUser = body.usageLimitPerUser ? Math.round(Number(body.usageLimitPerUser)) : 1;
  if (usageLimitPerUser < 1) throw new Error("Mỗi tài khoản phải được giới hạn ít nhất 1 lượt dùng.");
  const membershipDiscounts = Array.isArray(body.membershipDiscounts)
    ? body.membershipDiscounts.map((item) => {
        const entry = item as Record<string, unknown>;
        const membershipId = Math.round(Number(entry.membershipId));
        const discountRate = Math.round(Number(entry.discountRate));
        if (!membershipId || discountRate < 0 || discountRate > 100) {
          throw new Error("Mức giảm theo hạng thành viên phải từ 0 đến 100%.");
        }
        return { membershipId, discountRate };
      })
    : [];
  return {
    name,
    description: String(body.description || "").trim() || null,
    code,
    normalizedCode: code,
    type,
    value,
    maxDiscountAmount: body.maxDiscountAmount ? Math.round(Number(body.maxDiscountAmount)) : null,
    minOrderAmount: body.minOrderAmount ? Math.round(Number(body.minOrderAmount)) : null,
    startsAt: parseDate(body.startsAt),
    endsAt: parseDate(body.endsAt),
    usageLimit,
    usageLimitPerUser,
    firstOrderOnly: body.firstOrderOnly === true,
    isActive: body.isActive !== false,
    membershipDiscounts,
  };
};

export async function GET(request: Request) {
  try {
    getAdminFromRequest(request);
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" }, include: { recipientUser: { select: { displayName: true, email: true } }, applicableMemberships: { include: { membership: { select: { id: true, name: true } } } } } });
    return NextResponse.json(coupons.map((coupon) => ({ ...coupon, status: getDiscountStatus(coupon), value: Number(coupon.value), minOrderAmount: coupon.minOrderAmount ? Number(coupon.minOrderAmount) : null, maxDiscountAmount: coupon.maxDiscountAmount ? Number(coupon.maxDiscountAmount) : null, membershipDiscounts: coupon.applicableMemberships.map((item) => ({ membershipId: item.membershipId, membershipName: item.membership.name, discountRate: Number(item.discountRate) })), recipientUser: coupon.recipientUser, source: coupon.source, birthdayYear: coupon.birthdayYear })));
  } catch (error) { return errorResponse(error); }
}

export async function POST(request: Request) {
  try {
    getAdminFromRequest(request);
    const body = (await request.json()) as Record<string, unknown>;
    const data = parsePayload(body);
    const { membershipDiscounts, ...couponData } = data;
    const coupon = await prisma.coupon.create({ data: { ...couponData, publicToken: generatePublicToken(), applicableMemberships: membershipDiscounts.length ? { create: membershipDiscounts } : undefined } });
    return NextResponse.json(coupon, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) return NextResponse.json({ message: "Mã giảm giá đã tồn tại." }, { status: 409 });
    return errorResponse(error);
  }
}
