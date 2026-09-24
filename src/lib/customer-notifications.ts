import webpush from "web-push";
import {
  NotificationPriority,
  NotificationType,
  OrderStatus,
  Prisma,
} from "@/app/generated/prisma/client";
import prisma from "@/lib/db";
import { getVapidConfig } from "@/lib/admin-notifications";

const statusCopy: Record<
  OrderStatus,
  { title: string; message: (orderNumber: string) => string }
> = {
  PENDING: {
    title: "Đặt hàng thành công",
    message: (orderNumber) => `Đơn ${orderNumber} đã được ghi nhận.`,
  },
  CONFIRMED: {
    title: "Đơn hàng đã được xác nhận",
    message: (orderNumber) => `Đơn ${orderNumber} đã được cửa hàng xác nhận.`,
  },
  PREPARING: {
    title: "Đơn hàng đang được chuẩn bị",
    message: (orderNumber) => `Cửa hàng đang chuẩn bị đơn ${orderNumber}.`,
  },
  READY_TO_SHIP: {
    title: "Đơn hàng sắp được giao",
    message: (orderNumber) => `Đơn ${orderNumber} đã sẵn sàng để bàn giao.`,
  },
  SHIPPING: {
    title: "Đơn hàng đang được giao",
    message: (orderNumber) => `Đơn ${orderNumber} đang trên đường đến bạn.`,
  },
  PROCESSING: {
    title: "Đơn hàng đang được xử lý",
    message: (orderNumber) => `Đơn ${orderNumber} đang được xử lý.`,
  },
  SHIPPED: {
    title: "Đơn hàng đã được gửi đi",
    message: (orderNumber) => `Đơn ${orderNumber} đã được gửi đi.`,
  },
  DELIVERED: {
    title: "Đơn hàng đã giao thành công",
    message: (orderNumber) => `Đơn ${orderNumber} đã được giao đến bạn.`,
  },
  COMPLETED: {
    title: "Đơn hàng đã hoàn tất",
    message: (orderNumber) => `Cảm ơn bạn đã mua hàng với đơn ${orderNumber}.`,
  },
  CANCELLED: {
    title: "Đơn hàng đã bị hủy",
    message: (orderNumber) => `Đơn ${orderNumber} đã được hủy.`,
  },
  REFUNDED: {
    title: "Đơn hàng đã được hoàn tiền",
    message: (orderNumber) => `Đơn ${orderNumber} đã được hoàn tiền.`,
  },
};

export type CustomerPushPayload = {
  eventId: string;
  type: "CUSTOMER_ORDER_STATUS";
  notificationId: number;
  orderId: number;
  title: string;
  body: string;
  url: string;
  createdAt: string;
};

export async function createCustomerOrderNotification(
  tx: Prisma.TransactionClient,
  input: {
    userId: number | null;
    orderId: number;
    orderNumber: string;
    status: OrderStatus;
    eventId: string;
  },
) {
  if (!input.userId) return null;
  const copy = statusCopy[input.status];
  return tx.notification.create({
    data: {
      userId: input.userId,
      type: NotificationType.ORDER,
      title: copy.title,
      message: copy.message(input.orderNumber),
      priority:
        input.status === OrderStatus.CANCELLED
          ? NotificationPriority.HIGH
          : NotificationPriority.NORMAL,
      data: {
        eventId: input.eventId,
        orderId: input.orderId,
        orderNumber: input.orderNumber,
        status: input.status,
        url: `/account/orders/${input.orderId}`,
      },
    },
    select: { id: true, createdAt: true },
  });
}

export function getCustomerOrderPushPayload(input: {
  notificationId: number;
  orderId: number;
  orderNumber: string;
  status: OrderStatus;
  eventId: string;
  createdAt?: Date;
}): CustomerPushPayload {
  const copy = statusCopy[input.status];
  return {
    eventId: input.eventId,
    type: "CUSTOMER_ORDER_STATUS",
    notificationId: input.notificationId,
    orderId: input.orderId,
    title: copy.title,
    body: copy.message(input.orderNumber),
    url: `/account/orders/${input.orderId}`,
    createdAt: (input.createdAt || new Date()).toISOString(),
  };
}

export async function sendCustomerPush(
  userId: number,
  payload: CustomerPushPayload,
) {
  const config = getVapidConfig();
  if (!config) return;
  webpush.setVapidDetails(config.subject, config.publicKey, config.privateKey);
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId, isActive: true },
    select: { id: true, endpoint: true, p256dh: true, auth: true },
  });
  await Promise.allSettled(
    subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: { p256dh: subscription.p256dh, auth: subscription.auth },
          },
          JSON.stringify(payload),
        );
        await prisma.pushSubscription.update({
          where: { id: subscription.id },
          data: { lastUsedAt: new Date(), isActive: true },
        });
      } catch (error) {
        const statusCode =
          typeof error === "object" && error !== null && "statusCode" in error
            ? Number((error as { statusCode?: number }).statusCode)
            : 0;
        if (statusCode === 404 || statusCode === 410) {
          await prisma.pushSubscription.update({
            where: { id: subscription.id },
            data: { isActive: false },
          });
        }
      }
    }),
  );
}

export async function sendCustomerPushBestEffort(
  userId: number,
  payload: CustomerPushPayload,
) {
  try {
    await sendCustomerPush(userId, payload);
  } catch (error) {
    console.error("Customer notification delivery failed", {
      userId,
      eventId: payload.eventId,
      error: error instanceof Error ? error.message : "unknown error",
    });
  }
}
