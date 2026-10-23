/* eslint-disable @typescript-eslint/no-non-null-assertion */
import prisma from "@/lib/db";
import { verifyJwt } from "@/lib/auth/crypto";
import { NextResponse } from "next/server";
import { validateDiscount } from "@/lib/discounts";
import { OrderStatus } from "@/app/generated/prisma/client";
import {
  createNewOnlineOrderNotification,
  dispatchNotificationOutboxBestEffort,
} from "@/lib/admin-notifications";
import { createShippingCalculationWithFallback } from "@/lib/shipping";
import {
  createCustomerOrderNotification,
  getCustomerOrderPushPayload,
  sendCustomerPushBestEffort,
} from "@/lib/customer-notifications";
import { getVietQrConfig } from "@/lib/vietqr";

const fail = (message: string, status = 400) =>
  NextResponse.json({ message }, { status });

export async function POST(request: Request) {
  const userId = Number(request.headers.get("x-user-id"));
  if (
    !Number.isInteger(userId) ||
    userId < 1 ||
    request.headers.get("x-user-role") !== "CUSTOMER"
  )
    return fail("Vui lòng đăng nhập để đặt hàng.", 401);
  const body = await request.json().catch(() => ({}));
  const token = String(body.intent || "");
  const payload = await verifyJwt(token).catch(() => null);
  if (
    !payload ||
    !["BUY_NOW", "CART"].includes(payload.intentType || "") ||
    payload.sub !== String(userId)
  )
    return fail("Phiên thanh toán đã hết hạn.", 401);
  let receiverName = String(body.receiverName || "").trim();
  let receiverPhone = String(body.receiverPhone || "").trim();
  let receiverAddress = String(body.receiverAddress || "").trim();
  let destinationLatitude = Number(body.destinationLatitude);
  let destinationLongitude = Number(body.destinationLongitude);
  const addressId = Number(body.addressId);
  if (Number.isInteger(addressId) && addressId > 0) {
    const savedAddress = await prisma.userAddress.findFirst({
      where: { id: addressId, userId },
      select: {
        fullName: true,
        phone: true,
        line1: true,
        ward: true,
        district: true,
        city: true,
        latitude: true,
        longitude: true,
      },
    });
    if (!savedAddress) return fail("Địa chỉ giao hàng không hợp lệ.", 422);
    receiverName = savedAddress.fullName;
    receiverPhone = savedAddress.phone;
    receiverAddress = [
      savedAddress.line1,
      savedAddress.ward,
      savedAddress.district,
      savedAddress.city,
    ]
      .filter(Boolean)
      .join(", ");
    destinationLatitude = Number(savedAddress.latitude);
    destinationLongitude = Number(savedAddress.longitude);
  }
  const requestedOnlinePayment = body.paymentMethod === "BANK_TRANSFER";
  const paymentSettings = await getVietQrConfig();
  if (
    requestedOnlinePayment &&
    !paymentSettings.enabled
  ) {
    return fail("Thanh toán VietQR hiện đang tạm đóng.", 422);
  }
  const paymentMethod = requestedOnlinePayment ? "BANK_TRANSFER" : "COD";
  const couponCode = String(body.couponCode || "").trim();
  const note =
    String(body.note || "")
      .trim()
      .slice(0, 500) || null;
  if (!receiverName || !receiverPhone || !receiverAddress)
    return fail("Vui lòng nhập đủ thông tin nhận hàng.");
  try {
    let shippingCalculation: Awaited<
      ReturnType<typeof createShippingCalculationWithFallback>
    > | null = null;
    let quote: {
      shippingFee: number;
      distanceMeters: number | null;
      distanceKm: number | null;
      roundedDistanceKm: number | null;
      estimatedDurationMinutes: number | null;
    } = {
      shippingFee: 0,
      distanceMeters: 0,
      distanceKm: 0,
      roundedDistanceKm: 0,
      estimatedDurationMinutes: 0,
    };
    const resolveShipping = async (eligibleOrderValue: number) => {
      shippingCalculation = await createShippingCalculationWithFallback({
        destinationLatitude: Number.isFinite(destinationLatitude)
          ? destinationLatitude
          : null,
        destinationLongitude: Number.isFinite(destinationLongitude)
          ? destinationLongitude
          : null,
        eligibleOrderValue,
      });
      quote = {
        shippingFee: shippingCalculation.calculation.finalShippingFee,
        distanceMeters: shippingCalculation.route?.distanceMeters ?? null,
        distanceKm: shippingCalculation.route
          ? shippingCalculation.route.distanceMeters / 1000
          : null,
        roundedDistanceKm: shippingCalculation.calculation.roundedDistanceKm,
        estimatedDurationMinutes:
          shippingCalculation.route?.estimatedDurationMinutes ?? null,
      };
    };
    const result = await prisma.$transaction(
      async (tx) => {
        const existing = await tx.order.findUnique({
          where: { idempotencyKey: token },
          select: { id: true, orderNumber: true },
        });
        if (existing) return { order: existing, eventKey: null };
        if (payload.intentType === "CART") {
          const cart = await tx.cart.findFirst({
            where: { userId, status: "ACTIVE" },
            select: { id: true },
          });
          const cartItems = cart
            ? await tx.cartItem.findMany({
                where: {
                  cartId: cart.id,
                  id: { in: payload.cartItemIds || [] },
                },
                include: {
                  product: {
                    include: {
                      images: {
                        where: { variantId: null },
                        orderBy: [{ isPrimary: "desc" }, { position: "asc" }],
                        take: 1,
                      },
                    },
                  },
                  variant: {
                    include: {
                      images: {
                        orderBy: [{ isPrimary: "desc" }, { position: "asc" }],
                        take: 1,
                      },
                      productImages: {
                        orderBy: [{ isPrimary: "desc" }, { position: "asc" }],
                        take: 1,
                      },
                    },
                  },
                },
              })
            : [];
          if (
            cartItems.length !== (payload.cartItemIds || []).length ||
            cartItems.some(
              (item) =>
                item.product.status !== "PUBLIC" ||
                Boolean(item.variant && !item.variant.isActive) ||
                (item.variant
                  ? item.variant.quantity - item.variant.reservedQuantity
                  : item.product.quantity) < item.quantity,
            )
          )
            throw new Error("Sản phẩm trong giỏ hàng không còn khả dụng.");
          const lines = [] as Array<{
            item: (typeof cartItems)[number];
            price: number;
            cost: number;
            total: number;
          }>;
          for (const item of cartItems) {
            const variant = item.variant;
            const update = variant
              ? await tx.productVariant.updateMany({
                  where: {
                    id: variant.id,
                    isActive: true,
                    quantity: { gte: item.quantity + variant.reservedQuantity },
                  },
                  data: { quantity: { decrement: item.quantity } },
                })
              : await tx.product.updateMany({
                  where: {
                    id: item.productId,
                    status: "PUBLIC",
                    quantity: { gte: item.quantity },
                  },
                  data: { quantity: { decrement: item.quantity } },
                });
            if (!update.count)
              throw new Error("Số lượng sản phẩm không còn đủ.");
            const price = Number(variant?.sellPrice ?? item.product.sellPrice);
            const cost = Number(
              variant?.importPrice ?? item.product.importPrice,
            );
            lines.push({ item, price, cost, total: price * item.quantity });
          }
          const subtotal = lines.reduce((sum, line) => sum + line.total, 0);
          await resolveShipping(subtotal);
          const discount = couponCode
            ? await validateDiscount(
                couponCode,
                lines.map((line) => ({
                  productId: line.item.productId,
                  unitPrice: line.price,
                  quantity: line.item.quantity,
                })),
                tx,
                userId,
              )
            : null;
          if (discount) {
            const reserved = await tx.coupon.updateMany({
              where: {
                id: discount.coupon.id,
                isActive: true,
                OR: [
                  { usageLimit: null },
                  { usageLimit: { gt: discount.coupon.usedCount } },
                ],
              },
              data: { usedCount: { increment: 1 } },
            });
            if (!reserved.count)
              throw new Error("Mã giảm giá đã hết lượt sử dụng.");
          }
          const couponDiscount = discount?.discountAmount || 0;
          const membership = await tx.user.findUnique({
            where: { id: userId },
            select: { membership: { select: { discountRate: true } } },
          });
          const membershipDiscount = membership?.membership
            ? Math.min(
                subtotal,
                Math.floor(
                  (subtotal * Number(membership.membership.discountRate)) / 100,
                ),
              )
            : 0;
          const discountAmount = couponDiscount + membershipDiscount;
          const orderNumber = `QN-${Date.now()}-${Math.floor(
            Math.random() * 1000,
          )
            .toString()
            .padStart(3, "0")}`;
          const payable = Math.max(
            0,
            subtotal - discountAmount + quote.shippingFee,
          );
          const created = await tx.order.create({
            data: {
              orderNumber,
              idempotencyKey: token,
              userId,
              shippingAddressId:
                Number.isInteger(addressId) && addressId > 0
                  ? addressId
                  : undefined,
              source: "ONLINE",
              status: "PENDING",
              subtotal,
              discountAmount,
              couponId: discount?.coupon.id,
              discountCodeSnapshot: discount?.code,
              shippingFee: quote.shippingFee,
              totalAmount: payable,
              remainingAmount: payable,
              receiverName,
              receiverPhone,
              receiverAddress,
              latitude: destinationLatitude,
              longitude: destinationLongitude,
              shippingDistanceMeters: quote.distanceMeters,
              shippingDistanceKm: quote.distanceKm,
              shippingEstimatedMinutes: quote.estimatedDurationMinutes,
              shippingOriginAddress:
                shippingCalculation?.config.formattedAddress || null,
              shippingOriginLatitude:
                shippingCalculation?.config.latitude ?? null,
              shippingOriginLongitude:
                shippingCalculation?.config.longitude ?? null,
              shippingDestinationLatitude: destinationLatitude,
              shippingDestinationLongitude: destinationLongitude,
              shippingRawDistanceMeters: quote.distanceMeters,
              shippingRoundedDistanceKm: quote.roundedDistanceKm,
              shippingDiscountPercent:
                shippingCalculation?.calculation.discountPercent || 0,
              shippingChargeableDistanceKm:
                shippingCalculation?.calculation.chargeableDistanceKm ||
                quote.roundedDistanceKm,
              shippingBaseFee: shippingCalculation?.calculation.baseFee ?? null,
              shippingPricePerKm:
                shippingCalculation?.calculation.pricePerKm ?? null,
              shippingFeeBeforePromotion:
                shippingCalculation?.calculation.shippingFeeBeforePromotion ??
                quote.shippingFee,
              shippingDiscount:
                shippingCalculation?.calculation.shippingDiscount || 0,
              shippingPromotionId:
                shippingCalculation?.calculation.appliedPromotionId || null,
              shippingPromotionName:
                shippingCalculation?.calculation.appliedPromotion?.name || null,
              shippingQuoteProvider: shippingCalculation?.isFallback
                ? "GEOAPIFY_FALLBACK"
                : "GEOAPIFY",
              shippingCalculatedAt: new Date(),
              note,
              statusHistories: {
                create: {
                  currentStatus: OrderStatus.PENDING,
                  note: "Đặt hàng online",
                },
              },
              paymentMethod,
              paymentStatus: paymentMethod === "BANK_TRANSFER" ? "PENDING" : "UNPAID",
              payments:
                paymentMethod === "BANK_TRANSFER"
                  ? {
                      create: {
                        method: "BANK_TRANSFER",
                        status: "PENDING",
                        amount: payable,
                        logs: {
                          create: {
                            type: "CREATED",
                            message: "Tạo yêu cầu thanh toán VietQR",
                          },
                        },
                      },
                    }
                  : undefined,
              discountRedemption: discount
                ? {
                    create: {
                      couponId: discount.coupon.id,
                      codeSnapshot: discount.code,
                      discountTypeSnapshot: discount.coupon.type,
                      discountValueSnapshot: discount.coupon.value,
                      discountAmount,
                      subtotalSnapshot: subtotal,
                    },
                  }
                : undefined,
              items: {
                create: lines.map(({ item, price, cost, total }) => ({
                  productId: item.productId,
                  variantId: item.variantId,
                  productTitle: item.product.title,
                  productImageUrl:
                    item.variant?.images[0]?.url ||
                    item.variant?.productImages[0]?.url ||
                    item.product.images[0]?.url ||
                    item.product.imageUrl,
                  sku: item.variant?.sku || null,
                  size: item.variant?.size || null,
                  color: item.variant?.color || null,
                  quantity: item.quantity,
                  originalUnitPrice: price,
                  unitPrice: price,
                  unitCost: cost,
                  totalPrice: total,
                  lineSubtotal: total,
                  lineCost: cost * item.quantity,
                  lineProfit: (price - cost) * item.quantity,
                })),
              },
            },
            select: {
              id: true,
              orderNumber: true,
              totalAmount: true,
              paymentMethod: true,
              paymentStatus: true,
            },
          });
          for (const { item, price, cost } of lines)
            await tx.inventoryTransaction.create({
              data: {
                productId: item.productId,
                variantId: item.variantId,
                type: "SALE",
                quantity: -item.quantity,
                balanceAfter: Math.max(
                  0,
                  (item.variant?.quantity ?? item.product.quantity) -
                    item.quantity,
                ),
                referenceType: "ORDER",
                referenceId: created.id,
                note: `Đặt hàng ${created.orderNumber}`,
                unitImportPrice: cost,
                unitSellPrice: price,
              },
            });
          await tx.cartItem.deleteMany({
            where: { cartId: cart!.id, id: { in: payload.cartItemIds || [] } },
          });
          await createNewOnlineOrderNotification(tx, created);
          const customerNotification = await createCustomerOrderNotification(
            tx,
            {
              userId,
              orderId: created.id,
              orderNumber: created.orderNumber,
              status: OrderStatus.PENDING,
              eventId: `ORDER_CREATED:${created.id}`,
            },
          );
          return {
            order: created,
            eventKey: `NEW_ONLINE_ORDER:${created.id}`,
            customerNotification,
          };
        }
        if (!payload.variantId || !payload.quantity)
          throw new Error("Phiên mua ngay đã hết hạn.");
        const variantId = payload.variantId;
        const quantity = payload.quantity;
        const variant = await tx.productVariant.findUnique({
          where: { id: variantId },
          include: {
            images: {
              orderBy: [{ isPrimary: "desc" }, { position: "asc" }],
              take: 1,
            },
            productImages: {
              orderBy: [{ isPrimary: "desc" }, { position: "asc" }],
              take: 1,
            },
            product: {
              include: {
                images: {
                  where: { variantId: null },
                  orderBy: [{ isPrimary: "desc" }, { position: "asc" }],
                  take: 1,
                },
              },
            },
          },
        });
        if (
          !variant ||
          !variant.isActive ||
          variant.product.status !== "PUBLIC"
        )
          throw new Error("Sản phẩm không còn khả dụng.");
        const stockUpdate = await tx.productVariant.updateMany({
          where: {
            id: variant.id,
            isActive: true,
            quantity: { gte: quantity + variant.reservedQuantity },
          },
          data: { quantity: { decrement: quantity } },
        });
        if (!stockUpdate.count)
          throw new Error("Số lượng sản phẩm không còn đủ.");
        const price = Number(variant.sellPrice);
        const cost = Number(variant.importPrice);
        const total = price * quantity;
        await resolveShipping(total);
        const discount = couponCode
          ? await validateDiscount(
              couponCode,
              [{ productId: variant.productId, unitPrice: price, quantity }],
              tx,
              userId,
            )
          : null;
        if (discount) {
          const reserved = await tx.coupon.updateMany({
            where: {
              id: discount.coupon.id,
              isActive: true,
              OR: [
                { usageLimit: null },
                { usageLimit: { gt: discount.coupon.usedCount } },
              ],
            },
            data: { usedCount: { increment: 1 } },
          });
          if (!reserved.count)
            throw new Error("Mã giảm giá đã hết lượt sử dụng.");
        }
        const couponDiscount = discount?.discountAmount || 0;
        const membership = await tx.user.findUnique({
          where: { id: userId },
          select: { membership: { select: { discountRate: true } } },
        });
        const membershipDiscount = membership?.membership
          ? Math.min(
              total,
              Math.floor(
                (total * Number(membership.membership.discountRate)) / 100,
              ),
            )
          : 0;
        const discountAmount = couponDiscount + membershipDiscount;
        const payable = Math.max(0, total - discountAmount + quote.shippingFee);
        const orderNumber = `QN-${Date.now()}-${Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, "0")}`;
        const created = await tx.order.create({
          data: {
            orderNumber,
            idempotencyKey: token,
            userId,
            shippingAddressId:
              Number.isInteger(addressId) && addressId > 0
                ? addressId
                : undefined,
            source: "ONLINE",
            status: "PENDING",
            subtotal: total,
            discountAmount,
            couponId: discount?.coupon.id,
            discountCodeSnapshot: discount?.code,
            shippingFee: quote.shippingFee,
            totalAmount: payable,
            remainingAmount: payable,
            receiverName,
            receiverPhone,
            receiverAddress,
            latitude: destinationLatitude,
            longitude: destinationLongitude,
            shippingDistanceMeters: quote.distanceMeters,
            shippingDistanceKm: quote.distanceKm,
            shippingEstimatedMinutes: quote.estimatedDurationMinutes,
            shippingOriginAddress:
              shippingCalculation?.config.formattedAddress || null,
            shippingOriginLatitude:
              shippingCalculation?.config.latitude ?? null,
            shippingOriginLongitude:
              shippingCalculation?.config.longitude ?? null,
            shippingDestinationLatitude: destinationLatitude,
            shippingDestinationLongitude: destinationLongitude,
            shippingRawDistanceMeters: quote.distanceMeters,
            shippingRoundedDistanceKm: quote.roundedDistanceKm,
            shippingDiscountPercent:
              shippingCalculation?.calculation.discountPercent || 0,
            shippingChargeableDistanceKm:
              shippingCalculation?.calculation.chargeableDistanceKm ||
              quote.roundedDistanceKm,
            shippingBaseFee: shippingCalculation?.calculation.baseFee ?? null,
            shippingPricePerKm:
              shippingCalculation?.calculation.pricePerKm ?? null,
            shippingFeeBeforePromotion:
              shippingCalculation?.calculation.shippingFeeBeforePromotion ??
              quote.shippingFee,
            shippingDiscount:
              shippingCalculation?.calculation.shippingDiscount || 0,
            shippingPromotionId:
              shippingCalculation?.calculation.appliedPromotionId || null,
            shippingPromotionName:
              shippingCalculation?.calculation.appliedPromotion?.name || null,
            shippingQuoteProvider: shippingCalculation?.isFallback
              ? "GEOAPIFY_FALLBACK"
              : "GEOAPIFY",
            shippingCalculatedAt: new Date(),
            note,
            statusHistories: {
              create: {
                currentStatus: OrderStatus.PENDING,
                note: "Đặt hàng online",
              },
            },
            paymentMethod,
            paymentStatus: paymentMethod === "BANK_TRANSFER" ? "PENDING" : "UNPAID",
            payments:
              paymentMethod === "BANK_TRANSFER"
                ? {
                    create: {
                      method: "BANK_TRANSFER",
                      status: "PENDING",
                      amount: payable,
                      logs: {
                        create: {
                          type: "CREATED",
                          message: "Tạo yêu cầu thanh toán VietQR",
                        },
                      },
                    },
                  }
                : undefined,
            discountRedemption: discount
              ? {
                  create: {
                    couponId: discount.coupon.id,
                    codeSnapshot: discount.code,
                    discountTypeSnapshot: discount.coupon.type,
                    discountValueSnapshot: discount.coupon.value,
                    discountAmount,
                    subtotalSnapshot: total,
                  },
                }
              : undefined,
            items: {
              create: {
                productId: variant.productId,
                variantId: variant.id,
                productTitle: variant.product.title,
                productImageUrl:
                  variant.images[0]?.url ||
                  variant.productImages[0]?.url ||
                  variant.product.images[0]?.url ||
                  variant.product.imageUrl,
                sku: variant.sku,
                size: variant.size,
                color: variant.color,
                quantity,
                originalUnitPrice: price,
                unitPrice: price,
                unitCost: cost,
                totalPrice: total,
                lineSubtotal: total,
                lineCost: cost * quantity,
                lineProfit: (price - cost) * quantity,
              },
            },
          },
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            paymentMethod: true,
            paymentStatus: true,
          },
        });
        await tx.inventoryTransaction.create({
          data: {
            productId: variant.productId,
            variantId: variant.id,
            type: "SALE",
            quantity: -quantity,
            balanceAfter: Math.max(0, variant.quantity - quantity),
            referenceType: "ORDER",
            referenceId: created.id,
            note: `Đặt hàng ${created.orderNumber}`,
            unitImportPrice: cost,
            unitSellPrice: price,
          },
        });
        await createNewOnlineOrderNotification(tx, created);
        const customerNotification = await createCustomerOrderNotification(tx, {
          userId,
          orderId: created.id,
          orderNumber: created.orderNumber,
          status: OrderStatus.PENDING,
          eventId: `ORDER_CREATED:${created.id}`,
        });
        return {
          order: created,
          eventKey: `NEW_ONLINE_ORDER:${created.id}`,
          customerNotification,
        };
      },
      {
        maxWait: 10_000,
        timeout: 20_000,
      },
    );
    if (result.eventKey) {
      const outbox = await prisma.notificationOutbox.findUnique({
        where: { eventKey: result.eventKey },
        select: { id: true },
      });
      if (outbox) void dispatchNotificationOutboxBestEffort(outbox.id);
    }
    if (result.customerNotification) {
      void sendCustomerPushBestEffort(
        userId,
        getCustomerOrderPushPayload({
          notificationId: result.customerNotification.id,
          orderId: result.order.id,
          orderNumber: result.order.orderNumber,
          status: OrderStatus.PENDING,
          eventId: `ORDER_CREATED:${result.order.id}`,
          createdAt: result.customerNotification.createdAt,
        }),
      );
    }
    return NextResponse.json(result.order, { status: 201 });
  } catch (cause) {
    return fail(
      cause instanceof Error ? cause.message : "Không thể tạo đơn hàng.",
      409,
    );
  }
}
