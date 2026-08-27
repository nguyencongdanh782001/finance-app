import prisma from "@/lib/db";
import { getDailySoldProducts } from "@/lib/sold-products/daily-sold-products";
import { NextResponse } from "next/server";

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

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

  const daysInMonth = getDaysInMonth(year, month);
  const monthly = await prisma.monthlyFinance.findUnique({
    where: {
      year_month: { year, month },
    },
    include: {
      days: {
        orderBy: {
          date: "asc",
        },
        select: {
          id: true,
          date: true,
        },
      },
    },
  });
  const soldProductsByDay = monthly
    ? await Promise.all(
        monthly.days.map((day) => getDailySoldProducts(prisma, day.id)),
      )
    : [];

  const profitByDay = new Map(
    monthly?.days.map((day, index) => [
      new Date(day.date).getDate(),
      soldProductsByDay[index]?.items.reduce(
        (sum, item) => sum + (item.profit ?? 0),
        0,
      ) ?? 0,
    ]) ?? [],
  );
  const data = Array.from({ length: daysInMonth }, (_, index) => {
    const dayNumber = index + 1;

    return {
      day: dayNumber,
      date: new Date(year, month - 1, dayNumber),
      profit: profitByDay.get(dayNumber) ?? 0,
    };
  });

  return NextResponse.json({
    year,
    month,
    totalProfit: data.reduce((sum, item) => sum + item.profit, 0),
    data,
  });
}
