import prisma from "@/lib/db";
import { getDailySoldProducts } from "@/lib/sold-products/daily-sold-products";
import { NextResponse } from "next/server";

type SaleSnapshot = {
  quantity: number;
  sellPrice: number;
};

type NumericLike = number | string | { toString(): string } | null;

type MonthlyDaySummary = {
  id: number;
  date: Date;
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
          id: true,
          date: true,
          profitBank: true,
          profitCash: true,
        },
      },
    },
  });

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
  const dailySoldProductResults = await Promise.all(
    monthly.days.map((day) => getDailySoldProducts(prisma, day.id)),
  );

  soldProductsByDay = monthly.days.map((day, index) => ({
    dailyId: day.id,
    date: day.date,
    soldProducts:
      dailySoldProductResults[index]?.items.map((item) => ({
        productId: item.productId ?? 0,
        productTitle: item.productName,
        categoryName: item.categoryName ?? "Không phân loại",
        importPrice: item.unitCost ?? 0,
        sales: [
          {
            quantity: item.quantity,
            sellPrice: item.unitPrice,
          },
        ],
      })) ?? [],
  }));

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
