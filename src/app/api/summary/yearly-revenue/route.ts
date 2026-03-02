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
    include: {
      days: {
        select: {
          revenueCash: true,
          revenueBank: true,
        },
      },
    },
  });

  const result = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    totalRevenue: 0,
  }));

  monthlies.forEach((m) => {
    const sum = m.days.reduce(
      (acc, d) => acc + Number(d.revenueCash || 0) + Number(d.revenueBank || 0),
      0,
    );
    result[m.month - 1].totalRevenue = sum;
  });

  return NextResponse.json({ year, data: result });
}
