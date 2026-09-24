import prisma from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const subscriptionSchema = z.object({
  endpoint: z.string().url().max(2048),
  keys: z.object({
    p256dh: z.string().min(1).max(512),
    auth: z.string().min(1).max(512),
  }),
  deviceName: z.string().trim().max(120).optional(),
});

export async function POST(request: Request) {
  const userId = Number(request.headers.get("x-user-id"));
  if (!userId || request.headers.get("x-user-role") !== "CUSTOMER")
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const body = subscriptionSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!body.success)
    return NextResponse.json(
      { message: "Push subscription không hợp lệ." },
      { status: 400 },
    );
  const existing = await prisma.pushSubscription.findUnique({
    where: { endpoint: body.data.endpoint },
    select: { userId: true },
  });
  if (existing && existing.userId !== userId)
    return NextResponse.json(
      { message: "Thiết bị Push đã thuộc tài khoản khác." },
      { status: 403 },
    );
  const subscription = await prisma.pushSubscription.upsert({
    where: { endpoint: body.data.endpoint },
    create: {
      userId,
      endpoint: body.data.endpoint,
      p256dh: body.data.keys.p256dh,
      auth: body.data.keys.auth,
      deviceName: body.data.deviceName || "Thiết bị khách hàng",
      userAgent: request.headers.get("user-agent"),
      platform: request.headers.get("sec-ch-ua-platform"),
      lastUsedAt: new Date(),
    },
    update: {
      p256dh: body.data.keys.p256dh,
      auth: body.data.keys.auth,
      deviceName: body.data.deviceName || "Thiết bị khách hàng",
      userAgent: request.headers.get("user-agent"),
      platform: request.headers.get("sec-ch-ua-platform"),
      isActive: true,
      lastUsedAt: new Date(),
    },
    select: { id: true, isActive: true },
  });
  return NextResponse.json(subscription, { status: 201 });
}
