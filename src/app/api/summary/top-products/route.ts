import prisma from "@/lib/db";
import { getDailySoldProducts } from "@/lib/sold-products/daily-sold-products";
import { NextResponse } from "next/server";

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

  const monthly = await prisma.monthlyFinance.findUnique({
    where: {
      year_month: { year, month },
    },
    include: {
      days: {
        orderBy: {
          date: "asc",
        },
        select: {
          id: true,
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

  const soldProductsByDay = await Promise.all(
    monthly.days.map((day) => getDailySoldProducts(prisma, day.id)),
  );
  const productMap = new Map<
    string,
    {
      productId: number;
      productTitle: string;
      categoryName: string;
      quantity: number;
      revenue: number;
      profit: number;
    }
  >();

  soldProductsByDay.forEach((day) => {
    day?.items.forEach((item) => {
      const productKey = String(item.productId ?? item.productName);
      const current = productMap.get(productKey) ?? {
        productId: item.productId ?? 0,
        productTitle: item.productName,
        categoryName: item.categoryName ?? "Không phân loại",
        quantity: 0,
        revenue: 0,
        profit: 0,
      };

      current.quantity += item.quantity;
      current.revenue += item.totalAmount;
      current.profit += item.profit ?? 0;
      productMap.set(productKey, current);
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
}
