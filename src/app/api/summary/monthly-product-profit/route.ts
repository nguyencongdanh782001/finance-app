import prisma from "@/lib/db";
import { NextResponse } from "next/server";

type SaleSnapshot = {
  quantity: number;
  sellPrice: number;
};

const isDailySoldProductSchemaError = (error: unknown) =>
  error instanceof Error &&
  (error.message.includes("daily_sold_product") ||
    error.message.includes("soldProducts"));

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

  try {
    const monthly = await prisma.monthlyFinance.findUnique({
      where: {
        year_month: { year, month },
      },
      include: {
        days: {
          orderBy: {
            date: "asc",
          },
          include: {
            soldProducts: true,
          },
        },
      },
    });

    const data = Array.from({ length: daysInMonth }, (_, index) => {
      const dayNumber = index + 1;
      const date = new Date(year, month - 1, dayNumber);
      const matchingDay = monthly?.days.find(
        (day) => new Date(day.date).getDate() === dayNumber,
      );

      const profit =
        matchingDay?.soldProducts.reduce((sum, item) => {
          const sales = Array.isArray(item.sales)
            ? (item.sales as unknown as SaleSnapshot[]).map((sale) => ({
                quantity: Number(sale.quantity),
                sellPrice: Number(sale.sellPrice),
              }))
            : [];

          return (
            sum +
            sales.reduce(
              (salesSum, sale) =>
                salesSum +
                (sale.sellPrice - Number(item.importPrice)) * sale.quantity,
              0,
            )
          );
        }, 0) ?? 0;

      return {
        day: dayNumber,
        date,
        profit,
      };
    });

    return NextResponse.json({
      year,
      month,
      totalProfit: data.reduce((sum, item) => sum + item.profit, 0),
      data,
    });
  } catch (error) {
    if (isDailySoldProductSchemaError(error)) {
      return NextResponse.json({
        year,
        month,
        totalProfit: 0,
        data: Array.from({ length: daysInMonth }, (_, index) => ({
          day: index + 1,
          date: new Date(year, month - 1, index + 1),
          profit: 0,
        })),
      });
    }

    throw error;
  }
}
