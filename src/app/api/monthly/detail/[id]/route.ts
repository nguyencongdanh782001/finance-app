import prisma from "@/lib/db";
import { NextResponse } from "next/server";

type SaleSnapshot = {
  quantity: number;
  sellPrice: number;
};

type NumericLike = number | string | { toString(): string } | null;

type MonthlyDaySummary = {
  profitBank: NumericLike;
  profitCash: NumericLike;
};

type MonthlyExpenseItem = {
  id: number;
  name: string;
  amount: NumericLike;
  createdAt: Date;
};

type MonthlyDetailRecord = {
  id: number;
  year: number;
  month: number;
  totalExpense: NumericLike;
  expenses: MonthlyExpenseItem[];
  days: MonthlyDaySummary[];
};

const isDailySoldProductSchemaError = (error: unknown) =>
  error instanceof Error &&
  (error.message.includes("daily_sold_product") ||
    error.message.includes("soldProducts"));

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  const monthlyId = Number(id);

  if (!monthlyId || isNaN(monthlyId)) {
    return NextResponse.json(
      { message: "Invalid monthlyFinanceId" },
      { status: 400 },
    );
  }

  let monthly: MonthlyDetailRecord | null = null;
  let soldProductsByDay: {
    dailyId: number;
    date: Date;
    soldProducts: {
      productId: number;
      productTitle: string;
      categoryName: string;
      importPrice: number;
      sales: SaleSnapshot[];
    }[];
  }[] = [];

  try {
    const monthlyWithSoldProducts = await prisma.monthlyFinance.findUnique({
      where: { id: monthlyId },
      include: {
        expenses: {
          orderBy: {
            createdAt: "desc",
          },
        },
        days: {
          orderBy: {
            date: "asc",
          },
          include: {
            soldProducts: {
              orderBy: {
                createdAt: "asc",
              },
              include: {
                product: {
                  include: {
                    category: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    monthly = monthlyWithSoldProducts;
    soldProductsByDay =
      monthlyWithSoldProducts?.days.map((day) => ({
        dailyId: day.id,
        date: day.date,
        soldProducts: day.soldProducts.map((item) => ({
          productId: item.productId,
          productTitle: item.product.title,
          categoryName: item.product.category.name,
          importPrice: Number(item.importPrice),
          sales: Array.isArray(item.sales)
            ? (item.sales as unknown as SaleSnapshot[]).map((sale) => ({
                quantity: Number(sale.quantity),
                sellPrice: Number(sale.sellPrice),
              }))
            : [],
        })),
      })) ?? [];
  } catch (error) {
    if (!isDailySoldProductSchemaError(error)) {
      throw error;
    }

    monthly = await prisma.monthlyFinance.findUnique({
      where: { id: monthlyId },
      include: {
        expenses: {
          orderBy: {
            createdAt: "desc",
          },
        },
        days: {
          orderBy: {
            date: "asc",
          },
          select: {
            profitBank: true,
            profitCash: true,
          },
        },
      },
    });
  }

  if (!monthly) {
    return NextResponse.json(
      { message: "Monthly finance not found" },
      { status: 404 },
    );
  }

  const totalRevenue = monthly.days.reduce(
    (acc, d) => acc + Number(d.profitBank || 0) + Number(d.profitCash || 0),
    0,
  );

  return NextResponse.json({
    id: monthly.id,
    year: monthly.year,
    month: monthly.month,
    totalRevenue,
    totalExpense: Number(monthly.totalExpense),
    profit: totalRevenue,
    expenses: monthly.expenses,
    soldProductsByDay: soldProductsByDay.map((day) => ({
      dailyId: day.dailyId,
      date: day.date,
      soldProducts: day.soldProducts,
    })),
  });
}
