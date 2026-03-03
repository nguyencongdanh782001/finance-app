import prisma from "@/lib/db";
import { NextResponse } from "next/server";

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

  const monthly = await prisma.monthlyFinance.findUnique({
    where: { id: monthlyId },
    include: {
      expenses: {
        orderBy: {
          createdAt: "asc",
        },
      },
      days: {
        select: {
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

  return NextResponse.json({
    id: monthly.id,
    year: monthly.year,
    month: monthly.month,
    totalRevenue,
    totalExpense: Number(monthly.totalExpense),
    profit: totalRevenue - Number(monthly.totalExpense),
    expenses: monthly.expenses,
  });
}
