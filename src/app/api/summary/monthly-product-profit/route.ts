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
    monthly?.days.map((day, index) => {
      const sourceProfit = (soldProductsByDay[index]?.items ?? []).reduce(
        (summary, item) => {
          const profit = item.profit ?? 0;

          if (item.orderSource === "ONLINE") {
            summary.onlineProfit += profit;
          } else {
            summary.offlineProfit += profit;
          }

          return summary;
        },
        { offlineProfit: 0, onlineProfit: 0 },
      );

      return [new Date(day.date).getDate(), sourceProfit] as const;
    }) ?? [],
  );
  const data = Array.from({ length: daysInMonth }, (_, index) => {
    const dayNumber = index + 1;
    const sourceProfit = profitByDay.get(dayNumber) ?? {
      offlineProfit: 0,
      onlineProfit: 0,
    };

    return {
      day: dayNumber,
      date: new Date(year, month - 1, dayNumber),
      ...sourceProfit,
      profit: sourceProfit.offlineProfit + sourceProfit.onlineProfit,
    };
  });

  return NextResponse.json({
    year,
    month,
    totalProfit: data.reduce((sum, item) => sum + item.profit, 0),
    data,
  });
}
