import prisma from "@/lib/db";
import { getAdminIdentity } from "@/lib/admin-notification-api";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const identity = getAdminIdentity(request);
  if (identity instanceof NextResponse) return identity;
  const id = (await context.params).id;
  const updated = await prisma.adminNotificationRecipient.updateMany({
    where: { notificationId: id, userId: identity.userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });
  if (!updated.count)
    return NextResponse.json(
      { message: "Không tìm thấy thông báo." },
      { status: 404 },
    );
  return NextResponse.json({ success: true });
}
