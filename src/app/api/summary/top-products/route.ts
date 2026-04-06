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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const year = Number(searchParams.get("year"));
  const month = Number(searchParams.get("month"));

  if (!year || !month) {
    return NextResponse.json(
      { message: "year & month are required" },
      { status: 400 },
    );
  }

  try {
    const monthly = await prisma.monthlyFinance.findUnique({
      where: {
        year_month: { year, month },
      },
      include: {
        days: {
          include: {
            soldProducts: {
              include: {
                product: {
                  include: {
                    category: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!monthly) {
      return NextResponse.json({
        year,
        month,
        totalQuantity: 0,
        items: [],
      });
    }

    const productMap = new Map<
      number,
      {
        productId: number;
        productTitle: string;
        categoryName: string;
        quantity: number;
        revenue: number;
        profit: number;
      }
    >();

    monthly.days.forEach((day) => {
      day.soldProducts.forEach((item) => {
        const sales = Array.isArray(item.sales)
          ? (item.sales as unknown as SaleSnapshot[]).map((sale) => ({
              quantity: Number(sale.quantity),
              sellPrice: Number(sale.sellPrice),
            }))
          : [];
        const totalQuantity = sales.reduce((sum, sale) => sum + sale.quantity, 0);
        const totalRevenue = sales.reduce(
          (sum, sale) => sum + sale.sellPrice * sale.quantity,
          0,
        );
        const totalProfit = sales.reduce(
          (sum, sale) =>
            sum + (sale.sellPrice - Number(item.importPrice)) * sale.quantity,
          0,
        );
        const current = productMap.get(item.productId) ?? {
          productId: item.productId,
          productTitle: item.product.title,
          categoryName: item.product.category.name,
          quantity: 0,
          revenue: 0,
          profit: 0,
        };

        current.quantity += totalQuantity;
        current.revenue += totalRevenue;
        current.profit += totalProfit;
        productMap.set(item.productId, current);
      });
    });

    const items = Array.from(productMap.values()).sort((a, b) => {
      if (b.quantity !== a.quantity) return b.quantity - a.quantity;
      return b.revenue - a.revenue;
    });
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

    return NextResponse.json({
      year,
      month,
      totalQuantity,
      items,
    });
  } catch (error) {
    if (isDailySoldProductSchemaError(error)) {
      return NextResponse.json({
        year,
        month,
        totalQuantity: 0,
        items: [],
      });
    }

    throw error;
  }
}
