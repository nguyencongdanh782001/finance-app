import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

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
      profit: true,
    },
  });

  const result = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    profit: 0,
  }));

  monthlies.forEach((m) => {
    result[m.month - 1].profit = Number(m.profit ?? 0);
  });

  return NextResponse.json({
    year,
    data: result,
  });
}
