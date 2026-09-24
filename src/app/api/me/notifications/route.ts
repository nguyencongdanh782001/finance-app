import prisma from "@/lib/db";
import { NextResponse } from "next/server";

const customerOnly = (request: Request) =>
  Number(request.headers.get("x-user-id")) > 0 &&
  request.headers.get("x-user-role") === "CUSTOMER";

export async function GET(request: Request) {
  if (!customerOnly(request))
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const userId = Number(request.headers.get("x-user-id"));
  const params = new URL(request.url).searchParams;
  const limit = Math.min(30, Math.max(1, Number(params.get("limit") || 12)));
  const [rows, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);
  return NextResponse.json({
    data: rows.map((item) => ({
      id: item.id,
      type: item.type,
      title: item.title,
      message: item.message,
      data: item.data,
      createdAt: item.createdAt.toISOString(),
      isRead: item.isRead,
      readAt: item.readAt?.toISOString() || null,
    })),
    unreadCount,
  });
}
