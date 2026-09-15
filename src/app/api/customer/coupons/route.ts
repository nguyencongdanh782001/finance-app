import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyJwt } from "@/lib/auth/crypto";
import { getDiscountStatus, validateDiscount } from "@/lib/discounts";

const money = (value: number) => Math.max(0, Math.round(value));

const reason = (message: string) => {
  if (message.includes("tối thiểu"))
    return ["MINIMUM_ORDER_NOT_MET", message] as const;
  if (message.includes("hết hạn")) return ["EXPIRED", message] as const;
  if (message.includes("hết lượt")) return ["EXHAUSTED", message] as const;
  if (message.includes("đã sử dụng")) return ["ALREADY_USED", message] as const;
  if (message.includes("thành viên"))
    return ["MEMBERSHIP_REQUIRED", message] as const;
  if (message.includes("không áp dụng"))
    return ["PRODUCT_NOT_ELIGIBLE", message] as const;
  return ["NOT_ELIGIBLE", message] as const;
};

export async function GET(request: Request) {
  const userId = Number(request.headers.get("x-user-id"));
  if (
    !Number.isInteger(userId) ||
    userId < 1 ||
    request.headers.get("x-user-role") !== "CUSTOMER"
  ) {
    return NextResponse.json(
      { message: "Vui lòng đăng nhập để xem mã giảm giá." },
      { status: 401 },
    );
  }

  const url = new URL(request.url);
  const token =
    url.searchParams.get("checkoutSessionId") ||
    url.searchParams.get("intent") ||
    "";
  const payload = await verifyJwt(token).catch(() => null);
  if (
    !payload ||
    !["CART", "BUY_NOW"].includes(payload.intentType || "") ||
    payload.sub !== String(userId)
  ) {
    return NextResponse.json(
      { message: "Phiên thanh toán đã hết hạn." },
      { status: 401 },
    );
  }

  const rawItems =
    payload.intentType === "CART"
      ? await (async () => {
          const cart = await prisma.cart.findFirst({
            where: { userId, status: "ACTIVE" },
            select: { id: true },
          });
          return cart
            ? prisma.cartItem.findMany({
                where: {
                  cartId: cart.id,
                  id: { in: payload.cartItemIds || [] },
                },
                include: {
                  product: {
                    select: { id: true, categoryId: true, status: true },
                  },
                  variant: {
                    select: {
                      productId: true,
                      sellPrice: true,
                      isActive: true,
                    },
                  },
                },
              })
            : [];
        })()
      : await prisma.productVariant.findMany({
          where: { id: payload.variantId },
          include: {
            product: { select: { id: true, categoryId: true, status: true } },
          },
        });

  const items = rawItems.map((item) => {
    const variant = "variant" in item ? item.variant : item;
    return {
      productId: variant?.productId || item.product.id,
      unitPrice: Number(variant?.sellPrice || 0),
      quantity:
        "quantity" in item && payload.intentType === "CART"
          ? item.quantity
          : Number(payload.quantity),
    };
  });
  if (!items.length)
    return NextResponse.json({
      available: [],
      unavailable: [],
      selectedCouponId: null,
      bestCouponId: null,
    });

  const subtotal = items.reduce(
    (sum, item) => sum + money(item.unitPrice) * item.quantity,
    0,
  );
  const selectedCode = (url.searchParams.get("couponCode") || "")
    .trim()
    .toUpperCase();
  const coupons = await prisma.coupon.findMany({
    where: { OR: [{ recipientUserId: null }, { recipientUserId: userId }] },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      redemptions: {
        where: { order: { userId } },
        select: { id: true },
      },
    },
  });

  const mapped = await Promise.all(
    coupons.map(async (coupon) => {
      let applicable = false;
      let estimatedDiscount = 0;
      let unavailableReasonCode: string | undefined;
      let unavailableReasonText: string | undefined;
      const status = getDiscountStatus(coupon);
      if (status !== "ACTIVE") {
        const messages: Record<string, string> = {
          EXPIRED: "Mã đã hết hạn.",
          EXHAUSTED: "Mã đã hết lượt sử dụng.",
          UPCOMING: "Mã chưa đến thời gian sử dụng.",
          PAUSED: "Mã đang tạm dừng.",
        };
        unavailableReasonCode = status;
        unavailableReasonText = messages[status];
      } else if (
        coupon.usageLimitPerUser !== null &&
        coupon.redemptions.length >= coupon.usageLimitPerUser
      ) {
        unavailableReasonCode = "ALREADY_USED";
        unavailableReasonText = "Bạn đã sử dụng mã này.";
      } else {
        try {
          const discount = await validateDiscount(
            coupon.code,
            items,
            prisma,
            userId,
          );
          applicable = true;
          estimatedDiscount = discount.discountAmount;
        } catch (error) {
          const [code, text] = reason(
            error instanceof Error
              ? error.message
              : "Mã không phù hợp với đơn hàng.",
          );
          unavailableReasonCode = code;
          unavailableReasonText = text;
        }
      }
      return {
        id: String(coupon.id),
        code: coupon.code,
        title: coupon.name,
        description: coupon.description || undefined,
        discountType: coupon.type,
        discountValue: Number(coupon.value),
        maximumDiscount: coupon.maxDiscountAmount
          ? Number(coupon.maxDiscountAmount)
          : undefined,
        minimumOrderValue: coupon.minOrderAmount
          ? Number(coupon.minOrderAmount)
          : undefined,
        estimatedDiscount,
        expiresAt: coupon.endsAt?.toISOString(),
        applicable,
        unavailableReasonCode,
        unavailableReasonText,
        remainingUsage:
          coupon.usageLimit === null
            ? undefined
            : Math.max(0, coupon.usageLimit - coupon.usedCount),
        isBestChoice: false,
        isSelected: coupon.code.toUpperCase() === selectedCode,
        subtotal,
        source: coupon.source,
      };
    }),
  );

  const available = mapped
    .filter((coupon) => coupon.applicable)
    .sort(
      (a, b) =>
        b.estimatedDiscount - a.estimatedDiscount ||
        String(a.expiresAt || "9999").localeCompare(
          String(b.expiresAt || "9999"),
        ),
    );
  const best = available[0];
  if (best) best.isBestChoice = true;
  return NextResponse.json({
    available,
    unavailable: mapped.filter((coupon) => !coupon.applicable),
    selectedCouponId: mapped.find((coupon) => coupon.isSelected)?.id || null,
    bestCouponId: best?.id || null,
  });
}
