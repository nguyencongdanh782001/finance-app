import prisma from "@/lib/db";
import { getAdminIdentity } from "@/lib/admin-notification-api";
import {
  sendAdminPush,
  type AdminPushPayload,
} from "@/lib/admin-notifications";
import { NextResponse } from "next/server";

const recentTests = new Map<number, number>();

export async function POST(request: Request) {
  const identity = getAdminIdentity(request);
  if (identity instanceof NextResponse) return identity;
  const lastTest = recentTests.get(identity.userId) || 0;
  if (Date.now() - lastTest < 30_000) {
    return NextResponse.json(
      { message: "Vui lòng thử lại sau ít giây." },
      { status: 429 },
    );
  }
  recentTests.set(identity.userId, Date.now());
  const subscription = await prisma.pushSubscription.findFirst({
    where: { userId: identity.userId, isActive: true },
    orderBy: { lastUsedAt: "desc" },
    select: { id: true, endpoint: true, p256dh: true, auth: true },
  });
  if (!subscription) {
    return NextResponse.json(
      { message: "Thiết bị này chưa bật thông báo." },
      { status: 404 },
    );
  }
  const payload: AdminPushPayload = {
    eventId: `TEST:${identity.userId}:${Date.now()}`,
    type: "NEW_ONLINE_ORDER",
    notificationId: "test",
    title: "Thông báo đã được bật",
    body: "Thiết bị này đã sẵn sàng nhận thông báo đơn hàng mới.",
    url: "/admin/settings/notifications",
    createdAt: new Date().toISOString(),
  };
  try {
    await sendAdminPush(subscription, payload);
    await prisma.pushSubscription.update({
      where: { id: subscription.id },
      data: { lastUsedAt: new Date() },
    });
    return NextResponse.json({ success: true });
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
    return NextResponse.json(
      { message: "Không thể gửi thông báo thử." },
      { status: 502 },
    );
  }
}
