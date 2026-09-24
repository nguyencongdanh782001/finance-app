import { OrderStatus } from "@/app/generated/prisma/client";
import { cancelOfflineOrder } from "@/lib/orders/daily-orders";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

const money = (value: unknown) => Number(value || 0);

const publicCancellationReason = (note: string | null, status: OrderStatus) => {
  if (status !== OrderStatus.CANCELLED || !note) return null;
  return note.replace(/^Hủy đơn (online|tại shop):\s*/i, "").trim() || null;
};

export async function GET(
  request: Request,
  context: { params: Promise<{ orderId: string }> },
) {
  const userId = Number(request.headers.get("x-user-id"));
  const orderId = Number((await context.params).orderId);

  if (
    !userId ||
    !orderId ||
    request.headers.get("x-user-role") !== "CUSTOMER"
  ) {
    return NextResponse.json({ message: "Vui lòng đăng nhập." }, { status: 401 });
  }

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId, source: "ONLINE" },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      source: true,
      createdAt: true,
      placedAt: true,
      deliveredAt: true,
      completedAt: true,
      cancelledAt: true,
      subtotal: true,
      discountAmount: true,
      shippingFee: true,
      taxAmount: true,
      totalAmount: true,
      paidAmount: true,
      remainingAmount: true,
      paymentMethod: true,
      paymentStatus: true,
      paidAt: true,
      note: true,
      receiverName: true,
      receiverPhone: true,
      receiverAddress: true,
      receiverWard: true,
      receiverDistrict: true,
      receiverProvince: true,
      shippingEstimatedMinutes: true,
      shippingDistanceKm: true,
      shippingQuoteProvider: true,
      items: {
        orderBy: { id: "asc" },
        select: {
          id: true,
          productId: true,
          variantId: true,
          productTitle: true,
          productImageUrl: true,
          color: true,
          size: true,
          sku: true,
          quantity: true,
          originalUnitPrice: true,
          unitPrice: true,
          totalPrice: true,
          variantOptionsSnapshot: true,
        },
      },
      discountRedemption: {
        select: {
          codeSnapshot: true,
          discountAmount: true,
        },
      },
      payments: {
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          method: true,
          status: true,
          amount: true,
          transactionId: true,
          paidAt: true,
          createdAt: true,
        },
      },
      shipments: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          carrier: true,
          trackingNumber: true,
          status: true,
          estimatedMinutes: true,
          shippedAt: true,
          deliveredAt: true,
        },
      },
      statusHistories: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          previousStatus: true,
          currentStatus: true,
          note: true,
          createdAt: true,
        },
      },
    },
  });

  if (!order) {
    return NextResponse.json(
      { message: "Không tìm thấy đơn hàng." },
      { status: 404 },
    );
  }

  return NextResponse.json({
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    source: order.source,
    createdAt: order.createdAt.toISOString(),
    placedAt: order.placedAt.toISOString(),
    deliveredAt: order.deliveredAt?.toISOString() || null,
    completedAt: order.completedAt?.toISOString() || null,
    cancelledAt: order.cancelledAt?.toISOString() || null,
    subtotal: money(order.subtotal),
    discountAmount: money(order.discountAmount),
    shippingFee: money(order.shippingFee),
    taxAmount: money(order.taxAmount),
    totalAmount: money(order.totalAmount),
    paidAmount: money(order.paidAmount),
    remainingAmount: money(order.remainingAmount),
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    paidAt: order.paidAt?.toISOString() || null,
    note: order.note,
    receiver: {
      name: order.receiverName,
      phone: order.receiverPhone,
      address: [
        order.receiverAddress,
        order.receiverWard,
        order.receiverDistrict,
        order.receiverProvince,
      ]
        .filter(Boolean)
        .join(", "),
    },
    shipping: {
      estimatedMinutes:
        order.shipments[0]?.estimatedMinutes ??
        order.shippingEstimatedMinutes ??
        null,
      distanceKm: order.shippingDistanceKm
        ? money(order.shippingDistanceKm)
        : null,
      carrier: order.shipments[0]?.carrier || null,
      trackingNumber: order.shipments[0]?.trackingNumber || null,
      status: order.shipments[0]?.status || null,
      shippedAt: order.shipments[0]?.shippedAt?.toISOString() || null,
      deliveredAt: order.shipments[0]?.deliveredAt?.toISOString() || null,
    },
    discount: {
      total: money(order.discountAmount),
      couponCode: order.discountRedemption?.codeSnapshot || null,
    },
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      title: item.productTitle,
      imageUrl: item.productImageUrl,
      color: item.color,
      size: item.size,
      sku: item.sku,
      quantity: item.quantity,
      originalUnitPrice: money(item.originalUnitPrice),
      unitPrice: money(item.unitPrice),
      totalPrice: money(item.totalPrice),
      variantOptionsSnapshot: item.variantOptionsSnapshot,
    })),
    payments: order.payments.map((payment) => ({
      id: payment.id,
      method: payment.method,
      status: payment.status,
      amount: money(payment.amount),
      transactionId: payment.transactionId,
      paidAt: payment.paidAt?.toISOString() || null,
      createdAt: payment.createdAt.toISOString(),
    })),
    history: order.statusHistories.map((history) => ({
      id: history.id,
      previousStatus: history.previousStatus,
      status: history.currentStatus,
      publicNote: publicCancellationReason(history.note, history.currentStatus),
      createdAt: history.createdAt.toISOString(),
    })),
  });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ orderId: string }> },
) {
  const userId = Number(request.headers.get("x-user-id"));
  const orderId = Number((await context.params).orderId);
  if (
    !userId ||
    !orderId ||
    request.headers.get("x-user-role") !== "CUSTOMER"
  ) {
    return NextResponse.json({ message: "Không hợp lệ." }, { status: 400 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const order = await cancelOfflineOrder(
      orderId,
      userId,
      String(body.reason || ""),
      userId,
    );
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Không thể hủy đơn hàng.",
      },
      { status: 400 },
    );
  }
}
