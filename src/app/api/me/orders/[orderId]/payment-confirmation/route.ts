import { PaymentStatus } from "@/app/generated/prisma/client";
import prisma from "@/lib/db";
import {
  createOnlinePaymentSuccessNotification,
  dispatchNotificationOutboxBestEffort,
} from "@/lib/admin-notifications";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  context: { params: Promise<{ orderId: string }> },
) {
  const userId = Number(request.headers.get("x-user-id"));
  const orderId = Number((await context.params).orderId);
  if (
    !Number.isInteger(userId) ||
    userId < 1 ||
    !Number.isInteger(orderId) ||
    orderId < 1 ||
    request.headers.get("x-user-role") !== "CUSTOMER"
  ) {
    return NextResponse.json({ message: "Vui lòng đăng nhập." }, { status: 401 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: { id: orderId, userId, source: "ONLINE" },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          paymentMethod: true,
          paymentStatus: true,
          totalAmount: true,
        },
      });
      if (!order) throw new Error("Không tìm thấy đơn hàng.");
      if (order.paymentMethod !== "BANK_TRANSFER") {
        throw new Error("Đơn hàng này không dùng thanh toán VietQR.");
      }
      if (["CANCELLED", "REFUNDED"].includes(order.status)) {
        throw new Error("Đơn hàng không còn hiệu lực để xác nhận thanh toán.");
      }
      if (order.paymentStatus === PaymentStatus.PAID) return { order, outbox: null };

      const payment = await tx.payment.findFirst({
        where: { orderId, method: "BANK_TRANSFER" },
        orderBy: { createdAt: "desc" },
        select: { id: true, status: true },
      });
      if (!payment) throw new Error("Đơn hàng chưa có yêu cầu thanh toán.");

      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.PROCESSING,
          logs: {
            create: {
              type: "MANUAL_UPDATE",
              message: "Khách hàng báo đã chuyển khoản VietQR",
              payload: { userId },
            },
          },
        },
      });
      const updated = await tx.order.update({
        where: { id: orderId },
        data: { paymentStatus: PaymentStatus.PROCESSING },
        select: { id: true, orderNumber: true, paymentStatus: true },
      });
      const notification = await createOnlinePaymentSuccessNotification(tx, updated);
      return { order: updated, outbox: notification };
    });

    if (result.outbox) {
      const outbox = await prisma.notificationOutbox.findUnique({
        where: {
          eventKey: `ONLINE_PAYMENT_SUCCESS:${result.order.id}`,
        },
        select: { id: true },
      });
      if (outbox) void dispatchNotificationOutboxBestEffort(outbox.id);
    }
    return NextResponse.json(result.order);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Không thể xác nhận thanh toán." },
      { status: 400 },
    );
  }
}
