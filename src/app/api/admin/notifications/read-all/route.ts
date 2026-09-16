import prisma from "@/lib/db";
import { getAdminIdentity } from "@/lib/admin-notification-api";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  const identity = getAdminIdentity(request);
  if (identity instanceof NextResponse) return identity;
  const result = await prisma.adminNotificationRecipient.updateMany({
    where: { userId: identity.userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });
  return NextResponse.json({ success: true, updated: result.count });
}
