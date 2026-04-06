import prisma from "@/lib/db";
import { NextResponse } from "next/server";

type SaleSnapshot = {
  quantity: number;
  sellPrice: number;
};

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

  let daily:
    | Awaited<ReturnType<typeof prisma.dailyFinance.findUnique>>
    | null = null;
  let soldProducts: {
    productId: number;
    productTitle: string;
    productImageUrl: string;
    categoryName: string;
    importPrice: number;
    currentStock: number;
    availableStock: number;
    sales: {
      quantity: number;
      sellPrice: number;
    }[];
  }[] = [];

  try {
    const dailyWithProducts = await prisma.dailyFinance.findUnique({
      where: { id: dailyId },
      include: {
        soldProducts: {
          orderBy: {
            createdAt: "asc",
          },
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    daily = dailyWithProducts;
    dailyWithProducts?.soldProducts.forEach((item) => {
      const parsedSales = Array.isArray(item.sales)
        ? (item.sales as unknown as SaleSnapshot[]).map((sale) => ({
            quantity: Number(sale.quantity),
            sellPrice: Number(sale.sellPrice),
          }))
        : [];
      const totalQuantity = parsedSales.reduce(
        (sum, sale) => sum + sale.quantity,
        0,
      );

      soldProducts.push({
        productId: item.productId,
        productTitle: item.product.title,
        productImageUrl: item.product.imageUrl,
        categoryName: item.product.category.name,
        importPrice: Number(item.importPrice),
        currentStock: item.product.quantity,
        availableStock: item.product.quantity + totalQuantity,
        sales: parsedSales,
      });
    });
  } catch (error) {
    if (!isDailySoldProductSchemaError(error)) {
      throw error;
    }

    daily = await prisma.dailyFinance.findUnique({
      where: { id: dailyId },
    });
  }

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
    note: daily.note,
    soldProducts,
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
