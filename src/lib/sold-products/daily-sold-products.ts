import type {
  DailySoldProduct,
  OrderItem,
  OrderSource,
  OrderStatus,
  Product,
  ProductVariant,
} from "@/app/generated/prisma/client";
import { PaymentStatus, Prisma } from "@/app/generated/prisma/client";
import type prisma from "@/lib/db";
import { getVietnamDayRange } from "@/lib/orders/daily-orders";
import { isSoldOrderEligible } from "./sold-order-eligibility";
import { calculateNetOrderItemAmount } from "./order-item-revenue";

type PrismaClientLike = typeof prisma | Prisma.TransactionClient;

type SaleSnapshot = {
  quantity: number;
  sellPrice: number;
  source?: string;
  orderId?: number;
  orderItemId?: number;
};

type LegacySoldProduct = DailySoldProduct & {
  product: Product & {
    category: {
      name: string;
    };
  };
};

type OrderSoldItem = OrderItem & {
  order: {
    id: number;
    orderNumber: string;
    source: OrderSource;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    placedAt: Date;
    paidAt: Date | null;
    subtotal: Prisma.Decimal;
    discountAmount: Prisma.Decimal;
    deliveredAt: Date | null;
    completedAt: Date | null;
  };
  product: (Product & { category: { name: string } }) | null;
  variant: ProductVariant | null;
};

export type SoldProductRecordType = "ORDER_ITEM" | "LEGACY_MANUAL";

export type SoldProductListItem = {
  id: string;
  recordType: SoldProductRecordType;
  date: string;
  productId: number | null;
  productVariantId: number | null;
  productName: string;
  variantName: string | null;
  sku: string | null;
  imageUrl: string | null;
  categoryName: string | null;
  quantity: number;
  unitPrice: number;
  unitCost: number | null;
  totalAmount: number;
  totalCost: number | null;
  profit: number | null;
  orderId: number | null;
  orderCode: string | null;
  orderSource: OrderSource | null;
  paymentStatus?: PaymentStatus;
  readOnly: true;
  createdAt: string;
};

const toMoney = (value: unknown) => Math.round(Number(value || 0));

const getManualSales = (sales: Prisma.JsonValue) => {
  if (!Array.isArray(sales)) {
    return [];
  }

  return (sales as SaleSnapshot[])
    .filter((sale) => sale.source !== "ORDER" && !sale.orderItemId)
    .map((sale) => ({
      quantity: Number(sale.quantity),
      sellPrice: Number(sale.sellPrice),
    }))
    .filter(
      (sale) =>
        Number.isInteger(sale.quantity) &&
        sale.quantity > 0 &&
        Number.isFinite(sale.sellPrice) &&
        sale.sellPrice >= 0,
    );
};

const getVariantName = (item: {
  size: string | null;
  color: string | null;
  sku: string | null;
}) => [item.size, item.color].filter(Boolean).join(" / ") || item.sku || null;

const mapOrderItem = (item: OrderSoldItem): SoldProductListItem => {
  const lineSubtotal = toMoney(item.lineSubtotal || item.totalPrice);
  const totalAmount = calculateNetOrderItemAmount({
    lineSubtotal,
    orderSubtotal: toMoney(item.order.subtotal),
    discountAmount: toMoney(item.order.discountAmount),
  });
  const unitPrice =
    item.quantity > 0 ? Math.round(totalAmount / item.quantity) : 0;
  const unitCost = toMoney(item.unitCost);
  const saleDate =
    item.order.source === "ONLINE"
      ? (item.order.paidAt ??
        item.order.deliveredAt ??
        item.order.completedAt ??
        item.order.placedAt)
      : item.order.placedAt;

  return {
    id: `order-item-${item.id}`,
    recordType: "ORDER_ITEM",
    date: saleDate.toISOString(),
    productId: item.productId,
    productVariantId: item.variantId,
    productName: item.productTitle,
    variantName:
      getVariantName({
        size: item.size,
        color: item.color,
        sku: item.sku,
      }) ??
      getVariantName(item.variant ?? { size: null, color: null, sku: null }),
    sku: item.sku,
    imageUrl: item.productImageUrl ?? item.product?.imageUrl ?? null,
    categoryName: item.product?.category.name ?? null,
    quantity: item.quantity,
    unitPrice,
    unitCost,
    totalAmount,
    totalCost: unitCost * item.quantity,
    profit: totalAmount - unitCost * item.quantity,
    orderId: item.order.id,
    orderCode: item.order.orderNumber,
    orderSource: item.order.source,
    paymentStatus: item.order.paymentStatus,
    readOnly: true,
    createdAt: item.createdAt.toISOString(),
  };
};

const mapLegacyItem = (item: LegacySoldProduct): SoldProductListItem[] =>
  getManualSales(item.sales).map((sale, index) => {
    const unitCost = toMoney(item.importPrice);

    return {
      id: `legacy-${item.id}-${index}`,
      recordType: "LEGACY_MANUAL",
      date: item.createdAt.toISOString(),
      productId: item.productId,
      productVariantId: null,
      productName: item.product.title,
      variantName: null,
      sku: null,
      imageUrl: item.product.imageUrl,
      categoryName: item.product.category.name,
      quantity: sale.quantity,
      unitPrice: sale.sellPrice,
      unitCost,
      totalAmount: sale.sellPrice * sale.quantity,
      totalCost: unitCost * sale.quantity,
      profit: (sale.sellPrice - unitCost) * sale.quantity,
      orderId: null,
      orderCode: null,
      orderSource: null,
      paymentStatus: "PAID",
      readOnly: true,
      createdAt: item.createdAt.toISOString(),
    };
  });

export async function getDailySoldProducts(
  client: PrismaClientLike,
  dailyId: number,
) {
  const daily = await client.dailyFinance.findUnique({
    where: { id: dailyId },
    select: { id: true, date: true },
  });

  if (!daily) {
    return null;
  }

  const { start, end } = getVietnamDayRange(daily.date);
  const [legacyProducts, orderItems] = await Promise.all([
    client.dailySoldProduct.findMany({
      where: {
        dailyFinanceId: daily.id,
        contributions: {
          none: {},
        },
      },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    }),
    client.orderItem.findMany({
      where: {
        order: {
          OR: [
            {
              source: "OFFLINE",
              status: {
                notIn: ["CANCELLED", "REFUNDED"],
              },
              placedAt: {
                gte: start,
                lt: end,
              },
            },
            {
              source: "ONLINE",
              paymentStatus: "PAID",
              status: {
                in: ["DELIVERED", "COMPLETED"],
              },
              OR: [
                {
                  paidAt: {
                    gte: start,
                    lt: end,
                  },
                },
                {
                  paidAt: null,
                  OR: [
                    {
                      deliveredAt: {
                        gte: start,
                        lt: end,
                      },
                    },
                    {
                      deliveredAt: null,
                      completedAt: {
                        gte: start,
                        lt: end,
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            source: true,
            status: true,
            paymentStatus: true,
            placedAt: true,
            paidAt: true,
            subtotal: true,
            discountAmount: true,
            deliveredAt: true,
            completedAt: true,
          },
        },
        product: {
          include: {
            category: true,
          },
        },
        variant: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    }),
  ]);

  const items = [
    ...legacyProducts.flatMap(mapLegacyItem),
    ...orderItems
      .filter((item) => isSoldOrderEligible(item.order))
      .map(mapOrderItem),
  ].sort(
    (left, right) =>
      new Date(left.date).getTime() - new Date(right.date).getTime() ||
      left.id.localeCompare(right.id),
  );

  return {
    daily,
    items,
  };
}
