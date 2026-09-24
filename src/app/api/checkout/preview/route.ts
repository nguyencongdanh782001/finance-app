import prisma from "@/lib/db";
import { validateDiscount } from "@/lib/discounts";
import { verifyJwt } from "@/lib/auth/crypto";
import { createShippingCalculationWithFallback } from "@/lib/shipping";
import { NextResponse } from "next/server";

const money = (value: number) => Math.max(0, Math.round(value));

export async function POST(request: Request) {
  const userId = Number(request.headers.get("x-user-id"));
  if (
    !Number.isInteger(userId) ||
    userId < 1 ||
    request.headers.get("x-user-role") !== "CUSTOMER"
  ) {
    return NextResponse.json(
      { message: "Vui lòng đăng nhập để thanh toán." },
      { status: 401 },
    );
  }
  const body = await request.json().catch(() => ({}));
  const payload = await verifyJwt(String(body.intent || "")).catch(() => null);
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

  const items =
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
                    select: {
                      id: true,
                      title: true,
                      imageUrl: true,
                      status: true,
                      sellPrice: true,
                      quantity: true,
                    },
                  },
                  variant: {
                    include: {
                      images: { orderBy: { position: "asc" }, take: 1 },
                    },
                  },
                },
              })
            : [];
        })()
      : await prisma.productVariant.findMany({
          where: { id: payload.variantId },
          include: {
            product: {
              select: {
                id: true,
                title: true,
                imageUrl: true,
                status: true,
                sellPrice: true,
                quantity: true,
              },
            },
            images: { orderBy: { position: "asc" }, take: 1 },
          },
        });

  const normalized = items.map((item) => {
    const variant = "variant" in item ? item.variant : item;
    const quantity =
      "quantity" in item && payload.intentType === "CART"
        ? item.quantity
        : Number(payload.quantity);
    return {
      variantId: variant?.id,
      productId: variant?.productId ?? item.product.id,
      title: item.product.title,
      imageUrl: variant?.images?.[0]?.url || item.product.imageUrl,
      variantLabel: [variant?.color, variant?.size].filter(Boolean).join(" · "),
      sku: variant?.sku || null,
      quantity,
      price: Number(variant?.sellPrice ?? item.product.sellPrice ?? 0),
      available: Math.max(
        0,
        variant
          ? Number(variant.quantity) - Number(variant.reservedQuantity || 0)
          : Number(item.product.quantity),
      ),
      valid:
        item.product.status === "PUBLIC" && (variant ? variant.isActive : true),
    };
  });
  if (
    !normalized.length ||
    normalized.some((item) => !item.valid || item.available < item.quantity)
  ) {
    return NextResponse.json(
      {
        message:
          "Một hoặc nhiều sản phẩm vừa hết hàng hoặc không còn khả dụng.",
      },
      { status: 409 },
    );
  }

  const subtotal = normalized.reduce(
    (sum, item) => sum + money(item.price) * item.quantity,
    0,
  );
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { membership: { select: { name: true, discountRate: true } } },
  });
  const membershipDiscount = user?.membership
    ? Math.min(
        subtotal,
        Math.floor((subtotal * Number(user.membership.discountRate)) / 100),
      )
    : 0;
  let couponDiscount = 0;
  let appliedCoupon: {
    code: string;
    name: string;
    discountAmount: number;
  } | null = null;
  const couponCode = String(body.couponCode || "").trim();
  if (couponCode) {
    const discount = await validateDiscount(
      couponCode,
      normalized.map((item) => ({
        productId: item.productId || 0,
        unitPrice: item.price,
        quantity: item.quantity,
      })),
      prisma,
      userId,
    );
    couponDiscount = discount.discountAmount;
    appliedCoupon = {
      code: discount.code,
      name: discount.coupon.name,
      discountAmount: couponDiscount,
    };
  }

  const addressId = Number(body.addressId);
  let destinationLatitude: number | null = null;
  let destinationLongitude: number | null = null;
  if (Number.isInteger(addressId) && addressId > 0) {
    const address = await prisma.userAddress.findFirst({
      where: { id: addressId, userId },
      select: { latitude: true, longitude: true },
    });
    if (!address) {
      return NextResponse.json(
        { message: "Địa chỉ giao hàng không tồn tại." },
        { status: 404 },
      );
    }
    destinationLatitude =
      address.latitude == null ? null : Number(address.latitude);
    destinationLongitude =
      address.longitude == null ? null : Number(address.longitude);
  }
  let shippingCalculation;
  try {
    shippingCalculation = await createShippingCalculationWithFallback({
      destinationLatitude,
      destinationLongitude,
      eligibleOrderValue: subtotal,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Không thể tính phí giao hàng.",
      },
      { status: 503 },
    );
  }
  const shippingFee = shippingCalculation.calculation.finalShippingFee;
  const shipping = {
    available: true,
    isFallback: shippingCalculation.isFallback,
    unavailableReason: shippingCalculation.isFallback
      ? shippingCalculation.fallbackReason
      : undefined,
  };
  const totalDiscount = membershipDiscount + couponDiscount;
  return NextResponse.json({
    items: normalized,
    subtotal,
    productDiscount: 0,
    membershipDiscount,
    couponDiscount,
    shippingFee,
    totalDiscount,
    payableTotal: Math.max(0, subtotal - totalDiscount + shippingFee),
    appliedCoupon,
    membership: user?.membership
      ? {
          name: user.membership.name,
          discountRate: Number(user.membership.discountRate),
        }
      : null,
    shipping,
    shippingBreakdown: shippingCalculation.calculation,
    warnings: shippingCalculation.isFallback
      ? ["Không thể xác định khoảng cách, đã áp dụng phí giao hàng dự phòng."]
      : [],
  });
}
