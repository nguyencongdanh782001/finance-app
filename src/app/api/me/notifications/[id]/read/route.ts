import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const userId = Number(request.headers.get("x-user-id"));
  const id = Number((await context.params).id);
  if (!userId || request.headers.get("x-user-role") !== "CUSTOMER")
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const result = await prisma.notification.updateMany({
    where: { id, userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });
  if (!result.count)
    return NextResponse.json(
      { message: "Không tìm thấy thông báo." },
      { status: 404 },
    );
  return NextResponse.json({ success: true });
}
