import crypto from "node:crypto";
import prisma from "@/lib/db";
import { CouponType, Prisma } from "@/app/generated/prisma/client";

export type DiscountOrderItem = {
  productId: number;
  unitPrice: number;
  quantity: number;
};

export type DiscountValidationContext = {
  paymentMethod?: "COD" | "MOMO";
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
  const suffix = Array.from(
    bytes,
    (byte) => alphabet[byte % alphabet.length],
  ).join("");
  return `QN-${suffix}`;
};

export const generatePublicToken = () =>
  crypto.randomBytes(24).toString("base64url");

export const getDiscountStatus = (
  coupon: {
    isActive: boolean;
    startsAt: Date | null;
    endsAt: Date | null;
    usageLimit: number | null;
    usedCount: number;
  },
  now = new Date(),
) => {
  if (!coupon.isActive) return "PAUSED" as const;
  if (coupon.startsAt && coupon.startsAt > now) return "UPCOMING" as const;
  if (coupon.endsAt && coupon.endsAt < now) return "EXPIRED" as const;
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    return "EXHAUSTED" as const;
  }
  return "ACTIVE" as const;
};

export const calculateOrderSubtotal = (items: DiscountOrderItem[]) =>
  items.reduce(
    (total, item) => total + Math.round(item.unitPrice) * item.quantity,
    0,
  );

export const calculateDiscountAmount = (
  coupon: {
    type: CouponType;
    value: Prisma.Decimal | number;
    maxDiscountAmount: Prisma.Decimal | number | null;
  },
  subtotal: number,
) => {
  if (subtotal <= 0) return 0;
  const value = Number(coupon.value);
  if (coupon.type === CouponType.PERCENTAGE) {
    const amount = Math.floor((subtotal * value) / 100);
    return Math.min(
      amount,
      coupon.maxDiscountAmount
        ? Math.round(Number(coupon.maxDiscountAmount))
        : amount,
      subtotal,
    );
  }
  if (coupon.type === CouponType.FIXED_AMOUNT) {
    return Math.min(Math.round(value), subtotal);
  }
  return 0;
};

export const getDiscountError = (
  status: ReturnType<typeof getDiscountStatus>,
) =>
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
  _context?: DiscountValidationContext,
) => {
  const normalizedCode = normalizeDiscountCode(code);
  const coupon = await client.coupon.findUnique({
    where: { normalizedCode },
    include: {
      products: { select: { productId: true } },
      categories: { select: { categoryId: true } },
      excludedProducts: { select: { productId: true } },
      excludedCategories: { select: { categoryId: true } },
      applicableMemberships: { select: { membershipId: true } },
    },
  });
  if (!coupon) throw new Error("Mã giảm giá không tồn tại.");

  if (coupon.recipientUserId && coupon.recipientUserId !== userId) {
    throw new Error("Mã giảm giá không thuộc tài khoản này.");
  }

  const status = getDiscountStatus(coupon);
  if (status !== "ACTIVE") throw new Error(getDiscountError(status));

  if (userId && coupon.usageLimitPerUser !== null) {
    const redemptionCount = await client.discountRedemption.count({
      where: { couponId: coupon.id, order: { userId } },
    });
    if (redemptionCount >= coupon.usageLimitPerUser) {
      throw new Error("Tài khoản này đã sử dụng mã giảm giá.");
    }
  }

  if (coupon.firstOrderOnly && userId) {
    const order = await client.order.findFirst({
      where: { userId, source: "ONLINE" },
      select: { id: true },
    });
    if (order) throw new Error("Mã này chỉ áp dụng cho đơn hàng đầu tiên.");
  }

  const productIds = [...new Set(items.map((item) => item.productId))];
  const products = productIds.length
    ? await client.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, categoryId: true },
      })
    : [];
  const categoryIds = new Set(products.map((product) => product.categoryId));
  const includedProductIds = new Set(
    coupon.products.map((item) => item.productId),
  );
  const includedCategoryIds = new Set(
    coupon.categories.map((item) => item.categoryId),
  );
  const excludedProductIds = new Set(
    coupon.excludedProducts.map((item) => item.productId),
  );
  const excludedCategoryIds = new Set(
    coupon.excludedCategories.map((item) => item.categoryId),
  );
  const hasIncludedScope =
    includedProductIds.size > 0 || includedCategoryIds.size > 0;
  const hasEligibleItem = products.some(
    (product) =>
      !excludedProductIds.has(product.id) &&
      !excludedCategoryIds.has(product.categoryId) &&
      (!hasIncludedScope ||
        includedProductIds.has(product.id) ||
        includedCategoryIds.has(product.categoryId)),
  );
  if (!hasEligibleItem)
    throw new Error("Mã không áp dụng cho sản phẩm trong đơn.");

  if (coupon.applicableMemberships.length) {
    const user = userId
      ? await client.user.findUnique({
          where: { id: userId },
          select: { membershipId: true },
        })
      : null;
    if (
      !user?.membershipId ||
      !coupon.applicableMemberships.some(
        (item) => item.membershipId === user.membershipId,
      )
    ) {
      throw new Error("Mã này không áp dụng cho hạng thành viên của bạn.");
    }
  }

  const subtotal = calculateOrderSubtotal(items);
  const minimum = coupon.minOrderAmount
    ? Math.round(Number(coupon.minOrderAmount))
    : 0;
  if (subtotal < minimum) {
    throw new Error(
      `Đơn hàng cần đạt tối thiểu ${minimum.toLocaleString("vi-VN")}đ.`,
    );
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
