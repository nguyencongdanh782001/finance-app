// app/api/monthly/detail/[id]/expense/route.ts

import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string; expenseId: string }> },
) {
  const { id, expenseId } = await context.params;

  const monthlyFinanceId = Number(id);
  const expenseIdNum = Number(expenseId);

  if (!monthlyFinanceId || !expenseIdNum) {
    return NextResponse.json({ message: "Invalid params" }, { status: 400 });
  }

  const { name, amount } = await req.json();

  const oldExpense = await prisma.monthlyExpense.findUnique({
    where: { id: expenseIdNum },
  });

  if (!oldExpense || oldExpense.monthlyFinanceId !== monthlyFinanceId) {
    return NextResponse.json({ message: "Expense not found" }, { status: 404 });
  }

  const diff = Number(amount) - Number(oldExpense.amount);

  await prisma.monthlyExpense.update({
    where: { id: expenseIdNum },
    data: { name, amount },
  });

  await prisma.monthlyFinance.update({
    where: { id: monthlyFinanceId },
    data: {
      totalExpense: { increment: diff },
      profit: { decrement: diff },
    },
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string; expenseId: string }> },
) {
  const { id, expenseId } = await context.params;

  const monthlyFinanceId = Number(id);
  const expenseIdNum = Number(expenseId);

  if (!monthlyFinanceId || !expenseIdNum) {
    return NextResponse.json({ message: "Invalid params" }, { status: 400 });
  }

  const expense = await prisma.monthlyExpense.findUnique({
    where: { id: expenseIdNum },
  });

  if (!expense || expense.monthlyFinanceId !== monthlyFinanceId) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  await prisma.monthlyExpense.delete({
    where: { id: expenseIdNum },
  });

  await prisma.monthlyFinance.update({
    where: { id: monthlyFinanceId },
    data: {
      totalExpense: { decrement: expense.amount },
      profit: { increment: expense.amount },
    },
  });

  return NextResponse.json({ success: true });
}
