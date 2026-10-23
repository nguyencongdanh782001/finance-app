import { PaymentStatus } from "@/app/generated/prisma/client";
import { createOnlinePaymentSuccessNotification, dispatchNotificationOutboxBestEffort } from "@/lib/admin-notifications";
import prisma from "@/lib/db";
import { getVnpayConfig, verifyVnpayResponse } from "@/lib/vnpay";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const config = getVnpayConfig(url.origin);
  const params = url.searchParams;
  if (!config || !verifyVnpayResponse(params, config.hashSecret))
    return NextResponse.json({ RspCode: "97", Message: "Invalid signature" });

  const orderNumber = params.get("vnp_TxnRef") || "";
  const responseCode = params.get("vnp_ResponseCode");
  const transactionStatus = params.get("vnp_TransactionStatus");
  const amount = Number(params.get("vnp_Amount")) / 100;
  const transactionId = params.get("vnp_TransactionNo") || params.get("vnp_BankTranNo") || "";
  if (!orderNumber || !Number.isFinite(amount) || amount <= 0)
    return NextResponse.json({ RspCode: "04", Message: "Invalid request" });

  const result = await prisma.$transaction(async (tx) => {
    const order = await tx.order.findFirst({
      where: { orderNumber, source: "ONLINE" },
      select: { id: true, orderNumber: true, totalAmount: true, paymentMethod: true, paymentStatus: true },
    });
    if (!order || order.paymentMethod !== "BANK_TRANSFER") return "01";
    if (order.paymentStatus === PaymentStatus.PAID) return "00";
    if (Math.round(Number(order.totalAmount)) !== Math.round(amount)) return "04";
    const payment = await tx.payment.findFirst({ where: { orderId: order.id, method: "BANK_TRANSFER" }, orderBy: { createdAt: "desc" } });
    if (!payment) return "01";
    if (responseCode !== "00" || transactionStatus !== "00") {
      await tx.payment.update({ where: { id: payment.id }, data: { failureReason: `VNPAY response ${responseCode || ""}/${transactionStatus || ""}`, providerPayload: Object.fromEntries(params.entries()) } });
      return "00";
    }
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.PAID,
        transactionId,
        providerTransactionId: transactionId || params.get("vnp_TransactionNo"),
        providerPayload: Object.fromEntries(params.entries()),
        webhookPayload: Object.fromEntries(params.entries()),
        paidAt: new Date(),
        logs: { create: { type: "SUCCEEDED", message: "VNPAY xác nhận thanh toán", payload: Object.fromEntries(params.entries()) } },
      },
    });
    const updated = await tx.order.update({ where: { id: order.id }, data: { paymentStatus: PaymentStatus.PAID, isPaid: true, paidAmount: order.totalAmount, remainingAmount: 0, paidAt: new Date() }, select: { id: true, orderNumber: true } });
    const notification = await createOnlinePaymentSuccessNotification(tx, updated);
    return notification.id;
  });

  if (typeof result === "number") {
    const outbox = await prisma.notificationOutbox.findFirst({ where: { notificationId: result }, select: { id: true } });
    if (outbox) void dispatchNotificationOutboxBestEffort(outbox.id);
  }
  return NextResponse.json({ RspCode: "00", Message: "Confirm Success" });
}
