import prisma from "@/lib/db";
import { NextResponse } from "next/server";

type SoldProductPayload = {
  productId: number;
  quantity: number;
};

const isDailySoldProductSchemaError = (error: unknown) =>
  error instanceof Error &&
  (error.message.includes("daily_sold_product") ||
    error.message.includes("soldProducts"));

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const dailyId = Number(id);

    if (!dailyId || Number.isNaN(dailyId)) {
      return NextResponse.json({ message: "Invalid daily id" }, { status: 400 });
    }

    const body = (await req.json()) as {
      soldProducts?: SoldProductPayload[];
    };
    const soldProducts: SoldProductPayload[] = Array.isArray(body?.soldProducts)
      ? body.soldProducts
      : [];

    const normalizedSoldProducts = soldProducts.map((item) => ({
      productId: Number(item.productId),
      quantity: Number(item.quantity),
    }));

    if (
      normalizedSoldProducts.some(
        (item) =>
          !item.productId ||
          Number.isNaN(item.productId) ||
          !item.quantity ||
          Number.isNaN(item.quantity) ||
          item.quantity < 1,
      )
    ) {
      return NextResponse.json(
        { message: "Danh sách sản phẩm bán không hợp lệ" },
        { status: 400 },
      );
    }

    const duplicateProductIds = normalizedSoldProducts.map(
      (item) => item.productId,
    );
    const uniqueProductIds = new Set(duplicateProductIds);

    if (duplicateProductIds.length !== uniqueProductIds.size) {
      return NextResponse.json(
        { message: "Một sản phẩm chỉ nên xuất hiện một lần trong ngày" },
        { status: 400 },
      );
    }

    const daily = await prisma.dailyFinance.findUnique({
      where: { id: dailyId },
      include: {
        soldProducts: true,
      },
    });

    if (!daily) {
      return NextResponse.json(
        { message: "Daily finance not found" },
        { status: 404 },
      );
    }

    const productIds = Array.from(uniqueProductIds);
    const products =
      productIds.length > 0
        ? await prisma.product.findMany({
            where: {
              id: {
                in: productIds,
              },
            },
          })
        : [];

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { message: "Có sản phẩm không còn tồn tại trong hệ thống" },
        { status: 404 },
      );
    }

    const productMap = new Map<number, (typeof products)[number]>(
      products.map((product) => [product.id, product]),
    );
    const existingMap = new Map<number, number>(
      daily.soldProducts.map((item) => [item.productId, item.quantity]),
    );

    for (const item of normalizedSoldProducts) {
      const product = productMap.get(item.productId);
      const oldQuantity = existingMap.get(item.productId) ?? 0;
      const maxAvailable = (product?.quantity ?? 0) + oldQuantity;

      if (!product) {
        return NextResponse.json(
          { message: "Có sản phẩm không còn tồn tại trong hệ thống" },
          { status: 404 },
        );
      }

      if (item.quantity > maxAvailable) {
        return NextResponse.json(
          {
            message: `Sản phẩm "${product.title}" chỉ còn ${maxAvailable} sản phẩm khả dụng`,
          },
          { status: 400 },
        );
      }
    }

    let totalCost = 0;
    let totalRevenue = 0;

    for (const item of normalizedSoldProducts) {
      const product = productMap.get(item.productId);

      if (!product) continue;

      totalCost += Number(product.importPrice) * item.quantity;
      totalRevenue += Number(product.sellPrice) * item.quantity;
    }

    const totalProfit = totalRevenue - totalCost;

    await prisma.$transaction(async (tx) => {
      const nextMap = new Map<number, number>(
        normalizedSoldProducts.map((item) => [item.productId, item.quantity]),
      );
      const affectedProductIds = new Set<number>([
        ...Array.from(existingMap.keys()),
        ...Array.from(nextMap.keys()),
      ]);

      for (const productId of affectedProductIds) {
        const oldQuantity = existingMap.get(productId) ?? 0;
        const nextQuantity = nextMap.get(productId) ?? 0;
        const diff = nextQuantity - oldQuantity;

        if (diff > 0) {
          await tx.product.update({
            where: { id: productId },
            data: {
              quantity: {
                decrement: diff,
              },
            },
          });
        }

        if (diff < 0) {
          await tx.product.update({
            where: { id: productId },
            data: {
              quantity: {
                increment: Math.abs(diff),
              },
            },
          });
        }
      }

      await tx.dailySoldProduct.deleteMany({
        where: {
          dailyFinanceId: dailyId,
        },
      });

      if (normalizedSoldProducts.length > 0) {
        await tx.dailySoldProduct.createMany({
          data: normalizedSoldProducts.map((item) => ({
            dailyFinanceId: dailyId,
            productId: item.productId,
            quantity: item.quantity,
          })),
        });
      }
    });

    return NextResponse.json({
      success: true,
      summary: {
        totalCost,
        totalRevenue,
        totalProfit,
      },
    });
  } catch (error) {
    if (isDailySoldProductSchemaError(error)) {
      return NextResponse.json(
        {
          message:
            "Tính năng sản phẩm theo ngày chưa sẵn sàng trong database. Hãy chạy migrate trước.",
        },
        { status: 503 },
      );
    }

    throw error;
  }
}
