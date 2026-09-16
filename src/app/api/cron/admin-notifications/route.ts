import prisma from "@/lib/db";
import { dispatchNotificationOutboxBestEffort } from "@/lib/admin-notifications";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const events = await prisma.notificationOutbox.findMany({
    where: {
      status: { in: ["PENDING", "PARTIALLY_SENT", "FAILED"] },
      OR: [{ nextRetryAt: null }, { nextRetryAt: { lte: new Date() } }],
      attempts: { lt: 5 },
    },
    orderBy: { createdAt: "asc" },
    take: 20,
    select: { id: true },
  });
  await Promise.all(
    events.map((event) => dispatchNotificationOutboxBestEffort(event.id)),
  );
  return NextResponse.json({ processed: events.length });
}
