import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const dailyId = Number(id);

  if (!dailyId || isNaN(dailyId)) {
    return NextResponse.json({ message: "Invalid daily id" }, { status: 400 });
  }

  const daily = await prisma.dailyFinance.findUnique({
    where: { id: dailyId },
  });

  if (!daily) {
    return NextResponse.json(
      { message: "Daily finance not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    id: daily.id,
    date: daily.date,
    capitalCash: Number(daily.capitalCash),
    capitalBank: Number(daily.capitalBank),
    revenueCash: Number(daily.revenueCash),
    revenueBank: Number(daily.revenueBank),
    profitCash: Number(daily.profitCash),
    profitBank: Number(daily.profitBank),
    totalProfit: Number(daily.totalProfit),
  });
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const dailyId = Number(id);

  if (!dailyId || isNaN(dailyId)) {
    return NextResponse.json({ message: "Invalid daily id" }, { status: 400 });
  }

  const body = await req.json();

  const daily = await prisma.dailyFinance.findUnique({
    where: { id: dailyId },
  });

  if (!daily) {
    return NextResponse.json(
      { message: "Daily finance not found" },
      { status: 404 },
    );
  }

  const capitalCash = Number(body.capitalCash ?? daily.capitalCash);
  const capitalBank = Number(body.capitalBank ?? daily.capitalBank);
  const revenueCash = Number(body.revenueCash ?? daily.revenueCash);
  const revenueBank = Number(body.revenueBank ?? daily.revenueBank);

  const profitCash = revenueCash - capitalCash;
  const profitBank = revenueBank - capitalBank;
  const totalProfit = profitCash + profitBank;

  await prisma.dailyFinance.update({
    where: { id: dailyId },
    data: {
      capitalCash,
      capitalBank,
      revenueCash,
      revenueBank,
      profitCash,
      profitBank,
      totalProfit,
    },
  });

  return NextResponse.json({
    success: true,
  });
}
