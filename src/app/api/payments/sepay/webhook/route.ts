import crypto from "node:crypto";
import { PaymentStatus } from "@/app/generated/prisma/client";
import {
  createOnlinePaymentSuccessNotification,
  dispatchNotificationOutboxBestEffort,
} from "@/lib/admin-notifications";
import { extractOrderNumber, getSepayTransactionId, type SepayTransaction } from "@/lib/sepay";
import prisma from "@/lib/db";
import { getVietQrConfig } from "@/lib/vietqr";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function unauthorized(message = "Unauthorized") {
  return NextResponse.json({ success: false, message }, { status: 401 });
}

function validSignature(rawBody: string, request: Request) {
  const secret = process.env.SEPAY_WEBHOOK_SECRET?.trim();
  const signature = request.headers.get("x-sepay-signature") || "";
  const timestamp = Number(request.headers.get("x-sepay-timestamp"));
  if (!secret || !signature || !Number.isFinite(timestamp)) return false;
  if (Math.abs(Math.floor(Date.now() / 1000) - timestamp) > 300) return false;
  const expected = `sha256=${crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex")}`;
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(signature);
  return expectedBuffer.length === receivedBuffer.length && crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  if (!validSignature(rawBody, request)) return unauthorized("Invalid webhook signature");

  let payload: SepayTransaction;
  try {
    payload = JSON.parse(rawBody) as SepayTransaction;
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON" }, { status: 400 });
  }

  const transactionId = getSepayTransactionId(payload);
  const amount = Number(payload.transferAmount);
  const orderNumber = extractOrderNumber(payload);
  const configuredAccount = (await getVietQrConfig()).config?.accountNumber;

  if (
    !transactionId || payload.transferType !== "in" || !Number.isFinite(amount) || amount <= 0 || !orderNumber ||
    (configuredAccount && payload.accountNumber && payload.accountNumber !== configuredAccount)
  ) {
    return NextResponse.json({ success: true, processed: false });
  }

  const result = await prisma.$transaction(async (tx) => {
    const duplicate = await tx.payment.findFirst({
      where: { OR: [{ providerTransactionId: transactionId }, { transactionId }] },
      select: { id: true },
    });
    if (duplicate) return { status: "duplicate", notificationId: null };

    const order = await tx.order.findFirst({
      where: { orderNumber, source: "ONLINE" },
      select: { id: true, orderNumber: true, totalAmount: true, paymentMethod: true, paymentStatus: true },
    });
    if (!order || order.paymentMethod !== "BANK_TRANSFER") return { status: "order_not_found", notificationId: null };
    if (Number(order.totalAmount) !== Math.round(amount)) return { status: "amount_mismatch", notificationId: null };
    if (order.paymentStatus === PaymentStatus.PAID) return { status: "already_paid", notificationId: null };

    const payment = await tx.payment.findFirst({
      where: { orderId: order.id, method: "BANK_TRANSFER" },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });
    if (!payment) return { status: "payment_not_found", notificationId: null };

    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.PAID,
        providerTransactionId: transactionId,
        transactionId,
        providerPayload: payload as object,
        webhookPayload: payload as object,
        paidAt: new Date(),
        logs: { create: { type: "SUCCEEDED", message: "SePay xác nhận giao dịch chuyển khoản", payload: payload as object } },
      },
    });
    const updated = await tx.order.update({
      where: { id: order.id },
      data: { paymentStatus: PaymentStatus.PAID, isPaid: true, paidAmount: order.totalAmount, remainingAmount: 0, paidAt: new Date() },
      select: { id: true, orderNumber: true },
    });
    const notification = await createOnlinePaymentSuccessNotification(tx, updated);
    return { status: "paid", notificationId: notification.id };
  });

  if (result.notificationId) {
    const outbox = await prisma.notificationOutbox.findFirst({ where: { notificationId: result.notificationId }, select: { id: true } });
    if (outbox) void dispatchNotificationOutboxBestEffort(outbox.id);
  }
  return NextResponse.json({ success: true, processed: true, status: result.status });
}
