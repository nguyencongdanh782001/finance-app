// app/api/monthly/detail/[id]/expense/route.ts

import { CreateMonthlyExpenseRequest } from "@/interface/financeAPI";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const monthlyFinanceId = Number(id);

  const body = (await req.json()) as CreateMonthlyExpenseRequest;
  const { name, amount } = body;

  if (!name || !amount) {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }

  await prisma.monthlyExpense.create({
    data: {
      monthlyFinanceId,
      name,
      amount,
    },
  });

  // Recalculate totalExpense
  const expenseAgg = await prisma.monthlyExpense.aggregate({
    where: { monthlyFinanceId },
    _sum: { amount: true },
  });

  await prisma.monthlyFinance.update({
    where: { id: monthlyFinanceId },
    data: {
      totalExpense: expenseAgg._sum.amount ?? 0,
    },
  });

  return NextResponse.json({
    success: true,
  });
}
