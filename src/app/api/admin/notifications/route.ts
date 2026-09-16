import { AdminNotificationType } from "@/app/generated/prisma/client";
import prisma from "@/lib/db";
import { getAdminIdentity } from "@/lib/admin-notification-api";
import { NextResponse } from "next/server";

const toDto = (item: {
  id: string;
  type: AdminNotificationType;
  title: string;
  message: string;
  orderId: number | null;
  createdAt: Date;
  recipient: { isRead: boolean; readAt: Date | null };
}) => ({
  id: item.id,
  type: item.type,
  title: item.title,
  message: item.message,
  orderId: item.orderId,
  createdAt: item.createdAt.toISOString(),
  isRead: item.recipient.isRead,
  readAt: item.recipient.readAt?.toISOString() ?? null,
});

export async function GET(request: Request) {
  const identity = getAdminIdentity(request);
  if (identity instanceof NextResponse) return identity;
  const params = new URL(request.url).searchParams;
  const page = Math.max(1, Number(params.get("page") || 1));
  const limit = Math.min(50, Math.max(1, Number(params.get("limit") || 20)));
  const unreadOnly = params.get("unreadOnly") === "true";
  const requestedType = params.get("type");
  const type = Object.values(AdminNotificationType).includes(
    requestedType as AdminNotificationType,
  )
    ? (requestedType as AdminNotificationType)
    : undefined;
  const where = {
    userId: identity.userId,
    ...(unreadOnly ? { isRead: false } : {}),
    notification: type ? { type } : undefined,
  };
  const [rows, total, unreadCount] = await Promise.all([
    prisma.adminNotificationRecipient.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        isRead: true,
        readAt: true,
        notification: {
          select: {
            id: true,
            type: true,
            title: true,
            message: true,
            orderId: true,
            createdAt: true,
          },
        },
      },
    }),
    prisma.adminNotificationRecipient.count({ where }),
    prisma.adminNotificationRecipient.count({
      where: { userId: identity.userId, isRead: false },
    }),
  ]);
  return NextResponse.json({
    data: rows.map((row) => toDto({ ...row.notification, recipient: row })),
    unreadCount,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
