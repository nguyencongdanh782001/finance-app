import prisma from "@/lib/db";
import { NextResponse } from "next/server";
import { getDailySoldProducts } from "@/lib/sold-products/daily-sold-products";

const isDailySoldProductSchemaError = (error: unknown) =>
  error instanceof Error &&
  (error.message.includes("daily_sold_product") ||
    error.message.includes("soldProducts"));

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
  const soldProducts: NonNullable<
    Awaited<ReturnType<typeof getDailySoldProducts>>
  >["items"] = [];

  if (!daily) {
    return NextResponse.json(
      { message: "Daily finance not found" },
      { status: 404 },
    );
  }

  try {
    const soldProductsResult = await getDailySoldProducts(prisma, dailyId);
    soldProducts.push(...(soldProductsResult?.items ?? []));
  } catch (error) {
    if (!isDailySoldProductSchemaError(error)) {
      throw error;
    }
  }

  const [previousDay, nextDay] = await Promise.all([
    prisma.dailyFinance.findFirst({
      where: {
        date: {
          lt: daily.date,
        },
      },
      orderBy: {
        date: "desc",
      },
      select: {
        id: true,
        date: true,
      },
    }),
    prisma.dailyFinance.findFirst({
      where: {
        date: {
          gt: daily.date,
        },
      },
      orderBy: {
        date: "asc",
      },
      select: {
        id: true,
        date: true,
      },
    }),
  ]);

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
    note: daily.note,
    soldProducts,
    previousDay,
    nextDay,
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

  const profitCash = revenueCash === 0 ? 0 : revenueCash - capitalCash;
  const profitBank = revenueBank === 0 ? 0 : revenueBank - capitalBank;
  const totalProfit = profitCash + profitBank;

  const note = body.note;

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
      note,
    },
  });

  return NextResponse.json({
    success: true,
  });
}
