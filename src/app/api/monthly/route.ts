import prisma from "@/lib/db";
import { OrderStatus, PaymentStatus } from "@/app/generated/prisma/client";
import { NextResponse } from "next/server";

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

const vietnamDateKey = (date: Date) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const year = Number(searchParams.get("year"));
  const month = Number(searchParams.get("month"));

  if (!year || !month) {
    return NextResponse.json(
      { message: "year & month are required" },
      { status: 400 },
    );
  }

  // 1️⃣ Find monthly
  let monthly = await prisma.monthlyFinance.findUnique({
    where: {
      year_month: { year, month },
    },
    include: {
      days: true,
      expenses: true,
    },
  });

  // 2️⃣ Create if not exists
  if (!monthly) {
    const daysInMonth = getDaysInMonth(year, month);

    monthly = await prisma.monthlyFinance.create({
      data: {
        year,
        month,
        days: {
          create: Array.from({ length: daysInMonth }, (_, i) => ({
            date: new Date(year, month - 1, i + 1),
          })),
        },
      },
      include: {
        days: true,
        expenses: true,
      },
    });
  }

  // 3️⃣ Re-calculate totals
  const totalDailyProfit = monthly.days.reduce(
    (acc, d) => acc + Number(d.totalProfit || 0),
    0,
  );

  const totalExpense = monthly.expenses.reduce(
    (acc, e) => acc + Number(e.amount || 0),
    0,
  );

  const profit = totalDailyProfit;
  // - totalExpense;

  // 4️⃣ Update monthly (ONLY if changed – optional)
  await prisma.monthlyFinance.update({
    where: { id: monthly.id },
    data: {
      totalDailyProfit,
      totalExpense,
      profit,
    },
  });

  const monthStart = new Date(
    Date.UTC(year, month - 1, 1) - 7 * 60 * 60 * 1000,
  );
  const monthEnd = new Date(Date.UTC(year, month, 1) - 7 * 60 * 60 * 1000);
  const unpaidOrders = await prisma.order.findMany({
    where: {
      placedAt: { gte: monthStart, lt: monthEnd },
      paymentStatus: PaymentStatus.UNPAID,
      status: { not: OrderStatus.CANCELLED },
    },
    select: { placedAt: true },
  });
  const unpaidDateKeys = new Set(
    unpaidOrders.map((order) => vietnamDateKey(order.placedAt)),
  );
  const days = monthly.days.map((day) => ({
    ...day,
    hasUnpaidOrders: unpaidDateKeys.has(vietnamDateKey(day.date)),
  }));

  // 5️⃣ Return fresh data
  return NextResponse.json({
    id: monthly.id,
    year: monthly.year,
    month: monthly.month,
    totalDailyProfit,
    totalExpense,
    profit,
    days,
    expenses: monthly.expenses,
  });
}
