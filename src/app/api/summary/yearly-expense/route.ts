import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const year = Number(searchParams.get("year"));

  if (!year) {
    return NextResponse.json({ message: "year required" }, { status: 400 });
  }

  const monthlies = await prisma.monthlyFinance.findMany({
    where: { year },
    select: {
      month: true,
      totalExpense: true,
    },
  });

  const result = Array.from({ length: 12 }, (_, index) => ({
    month: index + 1,
    expense: 0,
  }));

  monthlies.forEach((monthly) => {
    result[monthly.month - 1].expense = Number(monthly.totalExpense ?? 0);
  });

  return NextResponse.json({
    year,
    data: result,
  });
}
