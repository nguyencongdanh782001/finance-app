import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const year = new Date().getFullYear();

  // 1️⃣ Sum profit từ daily
  const dailyProfit = await prisma.dailyFinance.aggregate({
    _sum: {
      totalProfit: true,
    },
    where: {
      date: {
        gte: new Date(`${year}-01-01`),
        lt: new Date(`${year + 1}-01-01`),
      },
    },
  });

  // 2️⃣ Sum expense từ monthly
  const expense = await prisma.monthlyExpense.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      monthlyFinance: {
        year,
      },
    },
  });

  const totalProfit =
    Number(dailyProfit._sum.totalProfit ?? 0) -
    Number(expense._sum.amount ?? 0);

  return NextResponse.json({
    year,
    totalProfit,
  });
}
