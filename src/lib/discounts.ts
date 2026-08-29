import crypto from "node:crypto";
import prisma from "@/lib/db";
import { CouponType, Prisma } from "@/app/generated/prisma/client";

export type DiscountOrderItem = {
  productId: number;
  unitPrice: number;
  quantity: number;
};

export const normalizeDiscountCode = (value: string) =>
  value
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/[^A-Z0-9-]/g, "")
    .trim();

export const generateDiscountCode = () => {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.randomBytes(6);
  const suffix = Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
  return `QN-${suffix}`;
};

export const generatePublicToken = () => crypto.randomBytes(24).toString("base64url");

export const getDiscountStatus = (coupon: {
  isActive: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
  usageLimit: number | null;
  usedCount: number;
}, now = new Date()) => {
  if (!coupon.isActive) return "PAUSED" as const;
  if (coupon.startsAt && coupon.startsAt > now) return "UPCOMING" as const;
  if (coupon.endsAt && coupon.endsAt < now) return "EXPIRED" as const;
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    return "EXHAUSTED" as const;
  }
  return "ACTIVE" as const;
};

export const calculateOrderSubtotal = (items: DiscountOrderItem[]) =>
  items.reduce((total, item) => total + Math.round(item.unitPrice) * item.quantity, 0);

export const calculateDiscountAmount = (
  coupon: { type: CouponType; value: Prisma.Decimal | number; maxDiscountAmount: Prisma.Decimal | number | null },
  subtotal: number,
) => {
  if (subtotal <= 0) return 0;
  const value = Number(coupon.value);
  if (coupon.type === CouponType.PERCENTAGE) {
    const amount = Math.floor((subtotal * value) / 100);
    return Math.min(amount, coupon.maxDiscountAmount ? Math.round(Number(coupon.maxDiscountAmount)) : amount, subtotal);
  }
  if (coupon.type === CouponType.FIXED_AMOUNT) {
    return Math.min(Math.round(value), subtotal);
  }
  return 0;
};

export const getDiscountError = (status: ReturnType<typeof getDiscountStatus>) =>
  ({
    ACTIVE: "",
    UPCOMING: "Mã giảm giá chưa đến thời gian sử dụng.",
    EXPIRED: "Mã giảm giá đã hết hạn.",
    EXHAUSTED: "Mã giảm giá đã hết lượt sử dụng.",
    PAUSED: "Mã giảm giá hiện đang tạm dừng.",
  })[status];

export const validateDiscount = async (
  code: string,
  items: DiscountOrderItem[],
  client: Prisma.TransactionClient | typeof prisma = prisma,
  userId?: number | null,
) => {
  const normalizedCode = normalizeDiscountCode(code);
  const coupon = await client.coupon.findUnique({ where: { normalizedCode } });
  if (!coupon) throw new Error("Mã giảm giá không tồn tại.");

  const status = getDiscountStatus(coupon);
  if (status !== "ACTIVE") throw new Error(getDiscountError(status));

  if (userId && coupon.usageLimitPerUser !== null) {
    const redemption = await client.discountRedemption.findFirst({
      where: { couponId: coupon.id, order: { userId } },
      select: { id: true },
    });
    if (redemption) throw new Error("Tài khoản này đã sử dụng mã giảm giá.");
  }

  const subtotal = calculateOrderSubtotal(items);
  const minimum = coupon.minOrderAmount ? Math.round(Number(coupon.minOrderAmount)) : 0;
  if (subtotal < minimum) {
    throw new Error(`Đơn hàng cần đạt tối thiểu ${minimum.toLocaleString("vi-VN")}đ.`);
  }

  const discountAmount = calculateDiscountAmount(coupon, subtotal);
  return {
    coupon,
    code: coupon.code,
    subtotal,
    discountAmount,
    total: Math.max(0, subtotal - discountAmount),
  };
};

export type DiscountCalculation = Awaited<ReturnType<typeof validateDiscount>>;
