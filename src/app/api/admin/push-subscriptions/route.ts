import prisma from "@/lib/db";
import { getAdminIdentity } from "@/lib/admin-notification-api";
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

const deviceDto = (device: {
  id: string;
  deviceName: string | null;
  userAgent: string | null;
  platform: string | null;
  isActive: boolean;
  lastUsedAt: Date | null;
  createdAt: Date;
}) => ({
  id: device.id,
  deviceName: device.deviceName,
  userAgent: device.userAgent,
  platform: device.platform,
  isActive: device.isActive,
  lastUsedAt: device.lastUsedAt?.toISOString() ?? null,
  createdAt: device.createdAt.toISOString(),
});

export async function GET(request: Request) {
  const identity = getAdminIdentity(request);
  if (identity instanceof NextResponse) return identity;
  const devices = await prisma.pushSubscription.findMany({
    where: { userId: identity.userId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      deviceName: true,
      userAgent: true,
      platform: true,
      isActive: true,
      lastUsedAt: true,
      createdAt: true,
    },
  });
  return NextResponse.json({ data: devices.map(deviceDto) });
}

export async function POST(request: Request) {
  const identity = getAdminIdentity(request);
  if (identity instanceof NextResponse) return identity;
  const body = subscriptionSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!body.success) {
    return NextResponse.json(
      { message: "Push subscription không hợp lệ." },
      { status: 400 },
    );
  }
  const existing = await prisma.pushSubscription.findUnique({
    where: { endpoint: body.data.endpoint },
    select: { userId: true },
  });
  if (existing && existing.userId !== identity.userId) {
    return NextResponse.json(
      { message: "Thiết bị Push đã thuộc tài khoản khác." },
      { status: 403 },
    );
  }
  const subscription = await prisma.pushSubscription.upsert({
    where: { endpoint: body.data.endpoint },
    create: {
      userId: identity.userId,
      endpoint: body.data.endpoint,
      p256dh: body.data.keys.p256dh,
      auth: body.data.keys.auth,
      deviceName: body.data.deviceName || null,
      userAgent: request.headers.get("user-agent"),
      platform: request.headers.get("sec-ch-ua-platform"),
      lastUsedAt: new Date(),
    },
    update: {
      p256dh: body.data.keys.p256dh,
      auth: body.data.keys.auth,
      deviceName: body.data.deviceName || null,
      userAgent: request.headers.get("user-agent"),
      platform: request.headers.get("sec-ch-ua-platform"),
      isActive: true,
      lastUsedAt: new Date(),
    },
    select: {
      id: true,
      deviceName: true,
      userAgent: true,
      platform: true,
      isActive: true,
      lastUsedAt: true,
      createdAt: true,
    },
  });
  return NextResponse.json(deviceDto(subscription), { status: 201 });
}
