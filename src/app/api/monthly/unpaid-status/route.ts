import { OrderStatus, PaymentStatus } from "@/app/generated/prisma/client";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

const getVietnamMonth = (date: Date) =>
  Number(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Ho_Chi_Minh",
      month: "2-digit",
    }).format(date),
  );

export async function GET(req: Request) {
  const year = Number(new URL(req.url).searchParams.get("year"));

  if (!year) {
    return NextResponse.json({ message: "year is required" }, { status: 400 });
  }

  const start = new Date(Date.UTC(year, 0, 1) - 7 * 60 * 60 * 1000);
  const end = new Date(Date.UTC(year + 1, 0, 1) - 7 * 60 * 60 * 1000);
  const orders = await prisma.order.findMany({
    where: {
      placedAt: { gte: start, lt: end },
      paymentStatus: PaymentStatus.UNPAID,
      status: { not: OrderStatus.CANCELLED },
    },
    select: { placedAt: true },
  });

  return NextResponse.json({
    year,
    months: [
      ...new Set(orders.map((order) => getVietnamMonth(order.placedAt))),
    ].sort((left, right) => left - right),
  });
}
