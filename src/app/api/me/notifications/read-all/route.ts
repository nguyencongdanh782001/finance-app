import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  const userId = Number(request.headers.get("x-user-id"));
  if (!userId || request.headers.get("x-user-role") !== "CUSTOMER")
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const result = await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });
  return NextResponse.json({ success: true, updated: result.count });
}
