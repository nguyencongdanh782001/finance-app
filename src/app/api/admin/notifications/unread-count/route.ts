import prisma from "@/lib/db";
import { getAdminIdentity } from "@/lib/admin-notification-api";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const identity = getAdminIdentity(request);
  if (identity instanceof NextResponse) return identity;
  const unreadCount = await prisma.adminNotificationRecipient.count({
    where: { userId: identity.userId, isRead: false },
  });
  return NextResponse.json({ unreadCount });
}
