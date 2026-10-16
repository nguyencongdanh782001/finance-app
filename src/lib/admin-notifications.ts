import webpush from "web-push";
import {
  AdminNotificationType,
  NotificationOutboxStatus,
  Prisma,
  UserRole,
} from "@/app/generated/prisma/client";
import prisma from "@/lib/db";

export type AdminPushPayload = {
  eventId: string;
  type: AdminNotificationType;
  notificationId: string;
  orderId?: number;
  orderCode?: string;
  title: string;
  body: string;
  unreadCount: number;
  url: string;
  createdAt: string;
};

type AdminPushPayloadBase = Omit<AdminPushPayload, "unreadCount">;

const isRecord = (value: Prisma.JsonValue): value is Prisma.JsonObject =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isAdminNotificationType = (
  value: unknown,
): value is AdminNotificationType =>
  typeof value === "string" &&
  Object.values(AdminNotificationType).includes(value as AdminNotificationType);

const parseStoredPayload = (
  value: Prisma.JsonValue,
): AdminPushPayloadBase | null => {
  if (!isRecord(value)) return null;
  const payload = value as Record<string, unknown>;
  if (
    typeof payload.eventId !== "string" ||
    !isAdminNotificationType(payload.type) ||
    typeof payload.notificationId !== "string" ||
    typeof payload.title !== "string" ||
    typeof payload.body !== "string" ||
    typeof payload.url !== "string" ||
    !payload.url.startsWith("/") ||
    payload.url.startsWith("//") ||
    typeof payload.createdAt !== "string"
  ) {
    return null;
  }
  return {
    eventId: payload.eventId,
    type: payload.type,
    notificationId: payload.notificationId,
    ...(typeof payload.orderId === "number"
      ? { orderId: payload.orderId }
      : {}),
    ...(typeof payload.orderCode === "string"
      ? { orderCode: payload.orderCode }
      : {}),
    title: payload.title,
    body: payload.body,
    url: payload.url,
    createdAt: payload.createdAt,
  };
};

export function getAdminUnreadNotificationCount(userId: number) {
  return prisma.adminNotificationRecipient.count({
    where: { userId, isRead: false },
  });
}

export const getVapidConfig = () => {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;

  if (!publicKey || !privateKey || !subject) return null;
  return { publicKey, privateKey, subject };
};

export async function createNewOnlineOrderNotification(
  tx: Prisma.TransactionClient,
  order: { id: number; orderNumber: string },
) {
  const eventKey = `${AdminNotificationType.NEW_ONLINE_ORDER}:${order.id}`;
  const existing = await tx.adminNotification.findUnique({
    where: { eventKey },
    select: { id: true, eventKey: true },
  });
  if (existing) return existing;

  const admins = await tx.user.findMany({
    where: {
      status: "ACTIVE",
      role: { in: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
    },
    select: { id: true },
  });
  const createdAt = new Date();
  const notification = await tx.adminNotification.create({
    data: {
      type: AdminNotificationType.NEW_ONLINE_ORDER,
      title: "Đơn hàng mới",
      message: `Đơn ${order.orderNumber} vừa được tạo.`,
      orderId: order.id,
      eventKey,
      recipients: {
        createMany: {
          data: admins.map((admin) => ({ userId: admin.id })),
        },
      },
    },
    select: { id: true, createdAt: true },
  });
  const payload: AdminPushPayloadBase = {
    eventId: eventKey,
    type: AdminNotificationType.NEW_ONLINE_ORDER,
    notificationId: notification.id,
    orderId: order.id,
    orderCode: order.orderNumber,
    title: "Đơn hàng mới",
    body: `Đơn ${order.orderNumber} vừa được tạo.`,
    url: `/admin/orders/${order.id}`,
    createdAt: createdAt.toISOString(),
  };
  await tx.notificationOutbox.create({
    data: {
      eventKey,
      eventType: AdminNotificationType.NEW_ONLINE_ORDER,
      aggregateId: order.id,
      notificationId: notification.id,
      payload: payload as unknown as Prisma.InputJsonValue,
    },
  });
  return notification;
}

export async function createOnlinePaymentSuccessNotification(
  tx: Prisma.TransactionClient,
  order: { id: number; orderNumber: string },
) {
  const eventKey = `${AdminNotificationType.ONLINE_PAYMENT_SUCCESS}:${order.id}`;
  const existing = await tx.adminNotification.findUnique({
    where: { eventKey },
    select: { id: true, eventKey: true },
  });
  if (existing) return existing;

  const admins = await tx.user.findMany({
    where: {
      status: "ACTIVE",
      role: { in: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
    },
    select: { id: true },
  });
  const createdAt = new Date();
  const title = "Khách đã báo chuyển khoản";
  const message = `Đơn ${order.orderNumber} đang chờ Admin kiểm tra giao dịch VietQR.`;
  const notification = await tx.adminNotification.create({
    data: {
      type: AdminNotificationType.ONLINE_PAYMENT_SUCCESS,
      title,
      message,
      orderId: order.id,
      eventKey,
      recipients: {
        createMany: { data: admins.map((admin) => ({ userId: admin.id })) },
      },
    },
    select: { id: true, createdAt: true },
  });
  const payload: AdminPushPayloadBase = {
    eventId: eventKey,
    type: AdminNotificationType.ONLINE_PAYMENT_SUCCESS,
    notificationId: notification.id,
    orderId: order.id,
    orderCode: order.orderNumber,
    title,
    body: message,
    url: `/admin/orders/${order.id}`,
    createdAt: createdAt.toISOString(),
  };
  await tx.notificationOutbox.create({
    data: {
      eventKey,
      eventType: AdminNotificationType.ONLINE_PAYMENT_SUCCESS,
      aggregateId: order.id,
      notificationId: notification.id,
      payload: payload as unknown as Prisma.InputJsonValue,
    },
  });
  return notification;
}

export async function dispatchNotificationOutbox(outboxId: string) {
  const claimed = await prisma.notificationOutbox.updateMany({
    where: {
      id: outboxId,
      status: {
        in: [
          NotificationOutboxStatus.PENDING,
          NotificationOutboxStatus.PARTIALLY_SENT,
          NotificationOutboxStatus.FAILED,
        ],
      },
    },
    data: { status: NotificationOutboxStatus.PROCESSING },
  });
  if (!claimed.count) return { sent: 0, failed: 0 };
  const config = getVapidConfig();
  if (!config) {
    await prisma.notificationOutbox.update({
      where: { id: outboxId },
      data: {
        status: NotificationOutboxStatus.FAILED,
        attempts: { increment: 1 },
        nextRetryAt: new Date(Date.now() + 5 * 60_000),
        lastError: "Thiếu cấu hình Web Push VAPID.",
      },
    });
    return { sent: 0, failed: 0 };
  }

  const outbox = await prisma.notificationOutbox.findUnique({
    where: { id: outboxId },
    select: {
      id: true,
      payload: true,
      status: true,
      attempts: true,
      notificationId: true,
    },
  });
  if (!outbox || outbox.status === NotificationOutboxStatus.SENT) {
    return { sent: 0, failed: 0 };
  }

  const basePayload = parseStoredPayload(outbox.payload);
  if (!basePayload) {
    await prisma.notificationOutbox.update({
      where: { id: outboxId },
      data: {
        status: NotificationOutboxStatus.FAILED,
        attempts: { increment: 1 },
        lastError: "Payload thông báo Push không hợp lệ.",
      },
    });
    return { sent: 0, failed: 0 };
  }

  webpush.setVapidDetails(config.subject, config.publicKey, config.privateKey);
  const recipients = await prisma.adminNotificationRecipient.findMany({
    where: { notificationId: outbox.notificationId },
    select: { userId: true },
  });
  const recipientUserIds = [
    ...new Set(recipients.map((recipient) => recipient.userId)),
  ];
  const subscriptions = await prisma.pushSubscription.findMany({
    where: {
      isActive: true,
      userId: { in: recipientUserIds },
      user: {
        role: { in: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
        status: "ACTIVE",
      },
    },
    select: {
      id: true,
      userId: true,
      endpoint: true,
      p256dh: true,
      auth: true,
    },
  });
  if (!subscriptions.length) {
    await prisma.notificationOutbox.update({
      where: { id: outbox.id },
      data: {
        status: NotificationOutboxStatus.FAILED,
        attempts: { increment: 1 },
        nextRetryAt: new Date(Date.now() + 5 * 60_000),
        lastError: "Không có thiết bị Admin đang đăng ký Push.",
      },
    });
    return { sent: 0, failed: 0 };
  }

  const unreadRows = await prisma.adminNotificationRecipient.groupBy({
    by: ["userId"],
    where: { userId: { in: recipientUserIds }, isRead: false },
    _count: { _all: true },
  });
  const unreadCounts = new Map(
    unreadRows.map((row) => [row.userId, row._count._all]),
  );

  const results = await Promise.allSettled(
    subscriptions.map(async (subscription) => {
      const payload = JSON.stringify({
        ...basePayload,
        unreadCount: unreadCounts.get(subscription.userId) || 0,
      } satisfies AdminPushPayload);
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: { p256dh: subscription.p256dh, auth: subscription.auth },
          },
          payload,
        );
        await prisma.pushSubscription.update({
          where: { id: subscription.id },
          data: { lastUsedAt: new Date(), isActive: true },
        });
        return true;
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
        throw error;
      }
    }),
  );
  const sent = results.filter((result) => result.status === "fulfilled").length;
  const failed = results.length - sent;
  await prisma.notificationOutbox.update({
    where: { id: outbox.id },
    data: {
      status:
        failed === 0
          ? NotificationOutboxStatus.SENT
          : sent > 0
            ? NotificationOutboxStatus.PARTIALLY_SENT
            : NotificationOutboxStatus.FAILED,
      attempts: { increment: 1 },
      nextRetryAt:
        failed && outbox.attempts + 1 < 5
          ? new Date(Date.now() + Math.min(60, 2 ** outbox.attempts) * 60_000)
          : null,
      processedAt: failed === 0 ? new Date() : null,
      lastError: failed ? `${failed} thiết bị không nhận được Push.` : null,
    },
  });
  return { sent, failed };
}

export async function dispatchNotificationOutboxBestEffort(outboxId: string) {
  try {
    await dispatchNotificationOutbox(outboxId);
  } catch (error) {
    console.error("Admin notification delivery failed", {
      outboxId,
      error: error instanceof Error ? error.message : "unknown error",
    });
  }
}

export async function sendAdminPush(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: AdminPushPayload,
) {
  const config = getVapidConfig();
  if (!config) throw new Error("Thiếu cấu hình Web Push VAPID.");
  webpush.setVapidDetails(config.subject, config.publicKey, config.privateKey);
  await webpush.sendNotification(
    {
      endpoint: subscription.endpoint,
      keys: { p256dh: subscription.p256dh, auth: subscription.auth },
    },
    JSON.stringify(payload),
  );
}
