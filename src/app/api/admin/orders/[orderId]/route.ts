import { OrderSource, OrderStatus } from "@/app/generated/prisma/client";
import prisma from "@/lib/db";
import {
  cancelOfflineOrder,
  getAdminFromRequest,
  markOnlineOrderPaid,
  updateOnlineOrderStatus,
} from "@/lib/orders/daily-orders";
import { NextResponse } from "next/server";

const money = (value: unknown) => Number(value || 0);

const errorResponse = (error: unknown) => {
  if (error instanceof Response) return error;
  return NextResponse.json(
    {
      message:
        error instanceof Error ? error.message : "Không thể xử lý đơn hàng.",
    },
    { status: 400 },
  );
};

export async function GET(
  request: Request,
  context: { params: Promise<{ orderId: string }> },
) {
  try {
    getAdminFromRequest(request);
    const orderId = Number((await context.params).orderId);
    if (!Number.isInteger(orderId) || orderId < 1) {
      return NextResponse.json(
        { message: "Mã đơn không hợp lệ." },
        { status: 400 },
      );
    }
    const order = await prisma.order.findFirst({
      where: { id: orderId, source: OrderSource.ONLINE },
      select: {
        id: true,
        orderNumber: true,
        source: true,
        status: true,
        paymentMethod: true,
        paymentStatus: true,
        isPaid: true,
        subtotal: true,
        discountAmount: true,
        shippingFee: true,
        taxAmount: true,
        totalAmount: true,
        paidAmount: true,
        remainingAmount: true,
        receiverName: true,
        receiverPhone: true,
        receiverAddress: true,
        receiverWard: true,
        receiverDistrict: true,
        receiverProvince: true,
        shippingDistanceKm: true,
        shippingEstimatedMinutes: true,
        shippingQuoteProvider: true,
        note: true,
        placedAt: true,
        updatedAt: true,
        deliveredAt: true,
        cancelledAt: true,
        user: {
          select: { id: true, displayName: true, email: true, phone: true },
        },
        items: {
          orderBy: { id: "asc" },
          select: {
            id: true,
            productTitle: true,
            productImageUrl: true,
            sku: true,
            color: true,
            size: true,
            quantity: true,
            originalUnitPrice: true,
            unitPrice: true,
            totalPrice: true,
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
            changedBy: { select: { displayName: true, email: true } },
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
      },
    });
    if (!order)
      return NextResponse.json(
        { message: "Không tìm thấy đơn online." },
        { status: 404 },
      );

    return NextResponse.json({
      ...order,
      subtotal: money(order.subtotal),
      discountAmount: money(order.discountAmount),
      shippingFee: money(order.shippingFee),
      taxAmount: money(order.taxAmount),
      totalAmount: money(order.totalAmount),
      paidAmount: money(order.paidAmount),
      remainingAmount: money(order.remainingAmount),
      shippingDistanceKm: order.shippingDistanceKm
        ? money(order.shippingDistanceKm)
        : null,
      items: order.items.map((item) => ({
        ...item,
        originalUnitPrice: money(item.originalUnitPrice),
        unitPrice: money(item.unitPrice),
        totalPrice: money(item.totalPrice),
      })),
      payments: order.payments.map((payment) => ({
        ...payment,
        amount: money(payment.amount),
      })),
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ orderId: string }> },
) {
  try {
    const admin = getAdminFromRequest(request);
    const orderId = Number((await context.params).orderId);
    if (!Number.isInteger(orderId) || orderId < 1) {
      return NextResponse.json(
        { message: "Mã đơn không hợp lệ." },
        { status: 400 },
      );
    }
    const body = await request.json();
    if (body.action === "cancel") {
      return NextResponse.json(
        await cancelOfflineOrder(
          orderId,
          admin.userId,
          String(body.reason || ""),
        ),
      );
    }
    if (body.action === "mark_paid") {
      return NextResponse.json(
        await markOnlineOrderPaid(orderId, admin.userId),
      );
    }
    if (!Object.values(OrderStatus).includes(body.status)) {
      return NextResponse.json(
        { message: "Trạng thái không hợp lệ." },
        { status: 400 },
      );
    }
    return NextResponse.json(
      await updateOnlineOrderStatus(orderId, body.status, admin.userId),
    );
  } catch (error) {
    return errorResponse(error);
  }
}
