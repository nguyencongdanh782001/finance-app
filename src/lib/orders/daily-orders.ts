import crypto from "node:crypto";
import prisma from "@/lib/db";
import {
  OrderSource,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  ProductStatus,
  Prisma,
} from "@/app/generated/prisma/client";

export type DailyOrderSourceFilter = "ALL" | OrderSource;
export type DailyOrderStatusFilter = "ALL" | OrderStatus;
export type DailyPaymentStatusFilter = "ALL" | PaymentStatus;
export type DailyPaymentMethodFilter = "ALL" | PaymentMethod;

export type OfflineOrderItemPayload = {
  productId: number;
  variantId?: number | null;
  unitPrice: number;
  quantity: number;
};

export type OfflineOrderPayload = {
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  orderedAt?: string;
  idempotencyKey?: string;
  items?: OfflineOrderItemPayload[];
};

const OFFLINE_PAYMENT_METHODS: PaymentMethod[] = [
  PaymentMethod.CASH,
  PaymentMethod.BANK_TRANSFER,
  PaymentMethod.MOMO,
];
const ONLINE_STATUS_FLOW = {
  [OrderStatus.PENDING]: OrderStatus.CONFIRMED,
  [OrderStatus.CONFIRMED]: OrderStatus.DELIVERED,
} as const;

const getVietnamDateParts = (date: Date) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  return {
    year: Number(parts.find((part) => part.type === "year")?.value),
    month: Number(parts.find((part) => part.type === "month")?.value),
    day: Number(parts.find((part) => part.type === "day")?.value),
  };
};

export const getVietnamDayRange = (date: Date) => {
  const { year, month, day } = getVietnamDateParts(date);
  const start = new Date(Date.UTC(year, month - 1, day) - 7 * 60 * 60 * 1000);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

  return { start, end };
};

const getPlacedAtForDaily = (dailyDate: Date, rawOrderedAt?: string) => {
  if (rawOrderedAt) {
    const parsedDate = new Date(rawOrderedAt);

    if (!Number.isNaN(parsedDate.getTime())) {
      return parsedDate;
    }
  }

  const todayParts = getVietnamDateParts(new Date());
  const dailyParts = getVietnamDateParts(dailyDate);
  const isToday =
    todayParts.year === dailyParts.year &&
    todayParts.month === dailyParts.month &&
    todayParts.day === dailyParts.day;

  if (isToday) {
    return new Date();
  }

  return new Date(
    Date.UTC(dailyParts.year, dailyParts.month - 1, dailyParts.day, 5, 0, 0),
  );
};

const toMoney = (value: unknown) => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return 0;
  }

  return Math.round(amount);
};

const validateInteger = (value: number) => Number.isInteger(value);

const assertAdmin = (request: Request) => {
  const userId = Number(request.headers.get("x-user-id"));
  const role = request.headers.get("x-user-role");

  if (!userId || Number.isNaN(userId)) {
    throw new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });
  }

  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    throw new Response(JSON.stringify({ message: "Forbidden" }), {
      status: 403,
    });
  }

  return { userId, role };
};

export const getAdminFromRequest = (request: Request) => assertAdmin(request);

const generateOrderNumber = (date: Date) => {
  const { year, month, day } = getVietnamDateParts(date);
  const suffix = crypto.randomBytes(3).toString("hex").toUpperCase();

  return `ORD-${year}${String(month).padStart(2, "0")}${String(day).padStart(
    2,
    "0",
  )}-${suffix}`;
};

const normalizePayloadItems = (items: OfflineOrderPayload["items"]) => {
  const normalizedItems = Array.isArray(items)
    ? items.map((item) => ({
        productId: Number(item.productId),
        variantId: item.variantId ? Number(item.variantId) : null,
        unitPrice: toMoney(item.unitPrice),
        quantity: Number(item.quantity),
      }))
    : [];

  if (normalizedItems.length === 0) {
    throw new Error("Vui lòng chọn ít nhất một sản phẩm.");
  }

  const mergedMap = new Map<string, OfflineOrderItemPayload>();

  normalizedItems.forEach((item) => {
    if (
      !item.productId ||
      Number.isNaN(item.productId) ||
      !validateInteger(item.quantity) ||
      item.quantity < 1 ||
      !validateInteger(item.unitPrice) ||
      item.unitPrice < 0
    ) {
      throw new Error("Thông tin sản phẩm trong đơn không hợp lệ.");
    }

    const key = `${item.productId}:${item.variantId ?? "product"}`;
    const current = mergedMap.get(key);

    if (current) {
      current.quantity += item.quantity;
      current.unitPrice = item.unitPrice;
      return;
    }

    mergedMap.set(key, item);
  });

  return Array.from(mergedMap.values());
};

const getOrderItemKey = (item: {
  productId: number | null;
  variantId: number | null;
}) => `${item.productId ?? "deleted"}:${item.variantId ?? "product"}`;

const buildOrderItems = async (
  tx: Prisma.TransactionClient,
  items: OfflineOrderItemPayload[],
  oldQuantities = new Map<string, number>(),
) => {
  const productIds = [...new Set(items.map((item) => item.productId))];
  const products = await tx.product.findMany({
    where: {
      id: { in: productIds },
      status: { not: ProductStatus.DISCONTINUED },
    },
    include: {
      category: true,
      images: {
        where: { variantId: null },
        orderBy: { position: "asc" },
      },
      variants: {
        include: {
          images: { orderBy: { position: "asc" } },
          options: {
            include: {
              option: true,
            },
          },
        },
      },
    },
  });
  const productMap = new Map(products.map((product) => [product.id, product]));

  if (products.length !== productIds.length) {
    throw new Error("Có sản phẩm không còn khả dụng trong hệ thống.");
  }

  let subtotal = 0;
  let totalCost = 0;

  const orderItems = items.map((item) => {
    const product = productMap.get(item.productId);

    if (!product) {
      throw new Error("Có sản phẩm không còn khả dụng trong hệ thống.");
    }

    const variant = item.variantId
      ? product.variants.find(
          (productVariant) => productVariant.id === item.variantId,
        )
      : null;

    if (!item.variantId && product.variants.length > 0) {
      throw new Error(
        `Vui lòng chọn màu và kích thước cho "${product.title}".`,
      );
    }

    if (item.variantId && (!variant || !variant.isActive)) {
      throw new Error(`Biến thể của "${product.title}" không còn khả dụng.`);
    }

    const stockQuantity = variant ? variant.quantity : product.quantity;
    const oldQuantity =
      oldQuantities.get(
        getOrderItemKey({
          productId: item.productId,
          variantId: item.variantId ?? null,
        }),
      ) ?? 0;
    const availableQuantity = stockQuantity + oldQuantity;

    if (item.quantity > availableQuantity) {
      throw new Error(
        `"${product.title}" chỉ còn ${availableQuantity.toLocaleString(
          "vi-VN",
        )} sản phẩm khả dụng.`,
      );
    }

    const originalUnitPrice = toMoney(variant?.sellPrice ?? product.sellPrice);
    const unitCost = toMoney(
      variant?.averageCost ?? variant?.importPrice ?? product.importPrice,
    );
    const lineSubtotal = item.unitPrice * item.quantity;
    const lineCost = unitCost * item.quantity;

    subtotal += lineSubtotal;
    totalCost += lineCost;

    const variantOptionValues =
      variant?.options.map((option) => option.option.value).filter(Boolean) ||
      [];
    const variantOptionText = [
      variant?.color,
      variant?.size,
      ...variantOptionValues,
    ]
      .filter(
        (value, index, values): value is string =>
          Boolean(value) && values.indexOf(value) === index,
      )
      .join(" / ");

    const productImageUrl =
      variant?.images.find((image) => image.isPrimary)?.url ||
      variant?.images[0]?.url ||
      product.images.find((image) => image.isPrimary)?.url ||
      product.images[0]?.url ||
      product.imageUrl;

    return {
      productId: product.id,
      variantId: variant?.id ?? null,
      productTitle: product.title,
      productImageUrl,
      sku: variant?.sku ?? null,
      size: variant?.size ?? null,
      color: variant?.color ?? null,
      variantOptionsSnapshot: variant
        ? ({
            label: variantOptionText || variant.sku,
            color: variant.color || "",
            colorCode: variant.colorCode || "",
            size: variant.size || "",
            sku: variant.sku,
            options: variantOptionValues,
          } as Prisma.InputJsonValue)
        : Prisma.JsonNull,
      quantity: item.quantity,
      originalUnitPrice,
      unitPrice: item.unitPrice,
      unitCost,
      totalPrice: lineSubtotal,
      lineSubtotal,
      lineCost,
      lineProfit: lineSubtotal - lineCost,
    };
  });

  return {
    items: orderItems,
    subtotal,
    totalCost,
    totalAmount: subtotal,
    profit: subtotal - totalCost,
  };
};

const applyInventoryDelta = async (
  tx: Prisma.TransactionClient,
  oldQuantities: Map<string, number>,
  nextItems: Array<{
    productId: number | null;
    variantId: number | null;
    quantity: number;
  }>,
  orderId: number,
) => {
  const nextQuantities = nextItems.reduce((map, item) => {
    map.set(getOrderItemKey(item), item.quantity);
    return map;
  }, new Map<string, number>());
  const affectedKeys = new Set([
    ...oldQuantities.keys(),
    ...nextQuantities.keys(),
  ]);

  for (const key of affectedKeys) {
    const oldQuantity = oldQuantities.get(key) ?? 0;
    const nextQuantity = nextQuantities.get(key) ?? 0;
    const diff = nextQuantity - oldQuantity;

    if (diff === 0) {
      continue;
    }

    const [rawProductId, rawVariantId] = key.split(":");
    const productId = Number(rawProductId);
    const variantId = rawVariantId === "product" ? null : Number(rawVariantId);

    if (!productId || Number.isNaN(productId)) {
      continue;
    }

    if (diff > 0) {
      const updateResult = variantId
        ? await tx.productVariant.updateMany({
            where: { id: variantId, quantity: { gte: diff } },
            data: { quantity: { decrement: diff } },
          })
        : await tx.product.updateMany({
            where: { id: productId, quantity: { gte: diff } },
            data: { quantity: { decrement: diff } },
          });

      if (updateResult.count === 0) {
        throw new Error("Số lượng tồn kho không đủ, vui lòng tải lại dữ liệu.");
      }
    } else {
      const restoredQuantity = Math.abs(diff);

      if (variantId) {
        await tx.productVariant.update({
          where: { id: variantId },
          data: { quantity: { increment: restoredQuantity } },
        });
      } else {
        await tx.product.update({
          where: { id: productId },
          data: { quantity: { increment: restoredQuantity } },
        });
      }
    }

    const stockRecord = variantId
      ? await tx.productVariant.findUnique({
          where: { id: variantId },
          select: { productId: true, quantity: true },
        })
      : await tx.product.findUnique({
          where: { id: productId },
          select: { id: true, quantity: true },
        });

    await tx.inventoryTransaction.create({
      data: {
        productId: variantId
          ? (stockRecord as { productId: number } | null)?.productId
          : productId,
        variantId,
        type: diff > 0 ? "SALE" : "RETURN",
        quantity: Math.abs(diff),
        balanceAfter: Number(stockRecord?.quantity ?? 0),
        referenceType: "ORDER",
        referenceId: orderId,
        note:
          diff > 0 ? "Tạo/cập nhật đơn tại shop" : "Hoàn tồn kho đơn tại shop",
      },
    });
  }
};

const getExistingOrderQuantityMap = (
  order: {
    items: Array<{
      productId: number | null;
      variantId: number | null;
      quantity: number;
    }>;
  } | null,
) =>
  (order?.items ?? []).reduce((map, item) => {
    map.set(
      getOrderItemKey(item),
      (map.get(getOrderItemKey(item)) ?? 0) + item.quantity,
    );
    return map;
  }, new Map<string, number>());

const includeOrderDetail = {
  items: {
    orderBy: { createdAt: "asc" as const },
  },
  user: {
    select: {
      id: true,
      displayName: true,
      email: true,
      phone: true,
    },
  },
  createdBy: {
    select: {
      id: true,
      displayName: true,
      email: true,
    },
  },
} satisfies Prisma.OrderInclude;

export const serializeOrder = (
  order: Prisma.OrderGetPayload<{ include: typeof includeOrderDetail }>,
) => {
  const totalQuantity = order.items.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  const firstItem = order.items[0];

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    source: order.source,
    status: order.status,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    isPaid: order.isPaid,
    subtotal: Number(order.subtotal),
    discountAmount: Number(order.discountAmount),
    shippingFee: Number(order.shippingFee),
    taxAmount: Number(order.taxAmount),
    totalCost: Number(order.totalCost),
    totalAmount: Number(order.totalAmount),
    paidAmount: Number(order.paidAmount),
    remainingAmount: Number(order.remainingAmount),
    profit: Number(order.profit),
    totalQuantity,
    firstProductTitle: firstItem?.productTitle ?? "",
    itemCount: order.items.length,
    placedAt: order.placedAt,
    completedAt: order.completedAt,
    deliveredAt: order.deliveredAt,
    cancelledAt: order.cancelledAt,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    customer: order.user
      ? {
          id: order.user.id,
          displayName: order.user.displayName,
          email: order.user.email,
          phone: order.user.phone,
        }
      : null,
    receiver:
      order.source === OrderSource.ONLINE
        ? {
            name: order.receiverName,
            phone: order.receiverPhone,
            address: order.receiverAddress,
            ward: order.receiverWard,
            district: order.receiverDistrict,
            province: order.receiverProvince,
          }
        : null,
    createdBy: order.createdBy,
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      productTitle: item.productTitle,
      productImageUrl: item.productImageUrl,
      sku: item.sku,
      size: item.size,
      color: item.color,
      variantOptionsSnapshot: item.variantOptionsSnapshot,
      quantity: item.quantity,
      originalUnitPrice: Number(item.originalUnitPrice),
      unitPrice: Number(item.unitPrice),
      unitCost: Number(item.unitCost),
      totalPrice: Number(item.totalPrice),
      lineSubtotal: Number(item.lineSubtotal),
      lineCost: Number(item.lineCost),
      lineProfit: Number(item.lineProfit),
    })),
  };
};

export async function listDailyOrders(
  dailyId: number,
  filters: {
    search?: string;
    source?: DailyOrderSourceFilter;
    status?: DailyOrderStatusFilter;
    paymentStatus?: DailyPaymentStatusFilter;
    paymentMethod?: DailyPaymentMethodFilter;
  },
) {
  const daily = await prisma.dailyFinance.findUnique({
    where: { id: dailyId },
    select: { id: true, date: true },
  });

  if (!daily) {
    throw new Error("Daily finance not found");
  }

  const { start, end } = getVietnamDayRange(daily.date);
  const where: Prisma.OrderWhereInput = {
    placedAt: {
      gte: start,
      lt: end,
    },
  };
  const search = filters.search?.trim();

  if (filters.source && filters.source !== "ALL") {
    where.source = filters.source;
  }

  if (filters.status && filters.status !== "ALL") {
    where.status = filters.status;
  }

  if (filters.paymentStatus && filters.paymentStatus !== "ALL") {
    where.paymentStatus = filters.paymentStatus;
  }

  if (filters.paymentMethod && filters.paymentMethod !== "ALL") {
    where.paymentMethod = filters.paymentMethod;
  }

  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: "insensitive" } },
      {
        items: {
          some: {
            OR: [
              { productTitle: { contains: search, mode: "insensitive" } },
              { sku: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      },
    ];
  }

  const [orders, offlineOrderCount, onlineOrderCount] = await Promise.all([
    prisma.order.findMany({
      where,
      include: includeOrderDetail,
      orderBy: { placedAt: "desc" },
      take: 100,
    }),
    prisma.order.count({
      where: {
        placedAt: { gte: start, lt: end },
        source: OrderSource.OFFLINE,
      },
    }),
    prisma.order.count({
      where: {
        placedAt: { gte: start, lt: end },
        source: OrderSource.ONLINE,
      },
    }),
  ]);

  return {
    items: orders.map(serializeOrder),
    counts: {
      offline: offlineOrderCount,
      online: onlineOrderCount,
    },
    pagination: {
      page: 1,
      limit: 100,
      total: orders.length,
      totalPages: 1,
    },
  };
}

export async function createOfflineOrder(
  dailyId: number,
  payload: OfflineOrderPayload,
  adminId: number,
) {
  const daily = await prisma.dailyFinance.findUnique({
    where: { id: dailyId },
    select: { date: true },
  });

  if (!daily) {
    throw new Error("Daily finance not found");
  }

  const paymentMethod = payload.paymentMethod ?? PaymentMethod.CASH;
  const paymentStatus = payload.paymentStatus ?? PaymentStatus.PAID;

  if (!OFFLINE_PAYMENT_METHODS.includes(paymentMethod)) {
    throw new Error("Phương thức thanh toán không hợp lệ cho đơn tại shop.");
  }

  if (
    paymentStatus !== PaymentStatus.PAID &&
    paymentStatus !== PaymentStatus.UNPAID
  ) {
    throw new Error("Trạng thái thanh toán không hợp lệ cho đơn tại shop.");
  }

  const placedAt = getPlacedAtForDaily(daily.date, payload.orderedAt);
  const items = normalizePayloadItems(payload.items);
  const idempotencyKey = payload.idempotencyKey?.trim();

  return prisma.$transaction(async (tx) => {
    if (idempotencyKey) {
      const existingOrder = await tx.order.findUnique({
        where: { idempotencyKey },
        include: includeOrderDetail,
      });

      if (existingOrder) {
        return serializeOrder(existingOrder);
      }
    }

    const calculatedOrder = await buildOrderItems(tx, items);
    const order = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(placedAt),
        idempotencyKey: idempotencyKey || null,
        userId: null,
        createdById: adminId,
        updatedById: adminId,
        source: OrderSource.OFFLINE,
        status: OrderStatus.COMPLETED,
        paymentMethod,
        paymentStatus,
        isPaid: paymentStatus === PaymentStatus.PAID,
        paidAt: paymentStatus === PaymentStatus.PAID ? placedAt : null,
        placedAt,
        completedAt: placedAt,
        subtotal: calculatedOrder.subtotal,
        discountAmount: 0,
        shippingFee: 0,
        taxAmount: 0,
        totalCost: calculatedOrder.totalCost,
        totalAmount: calculatedOrder.totalAmount,
        paidAmount:
          paymentStatus === PaymentStatus.PAID
            ? calculatedOrder.totalAmount
            : 0,
        remainingAmount:
          paymentStatus === PaymentStatus.PAID
            ? 0
            : calculatedOrder.totalAmount,
        profit: calculatedOrder.profit,
        items: {
          create: calculatedOrder.items,
        },
        statusHistories: {
          create: {
            currentStatus: OrderStatus.COMPLETED,
            changedById: adminId,
            note: "Tạo đơn tại shop",
          },
        },
      },
      include: includeOrderDetail,
    });

    await applyInventoryDelta(tx, new Map(), calculatedOrder.items, order.id);

    return serializeOrder(order);
  });
}

export async function updateOfflineOrder(
  orderId: number,
  payload: OfflineOrderPayload,
  adminId: number,
) {
  const paymentMethod = payload.paymentMethod ?? PaymentMethod.CASH;
  const paymentStatus = payload.paymentStatus ?? PaymentStatus.PAID;

  if (!OFFLINE_PAYMENT_METHODS.includes(paymentMethod)) {
    throw new Error("Phương thức thanh toán không hợp lệ cho đơn tại shop.");
  }

  if (
    paymentStatus !== PaymentStatus.PAID &&
    paymentStatus !== PaymentStatus.UNPAID
  ) {
    throw new Error("Trạng thái thanh toán không hợp lệ cho đơn tại shop.");
  }

  const items = normalizePayloadItems(payload.items);

  return prisma.$transaction(async (tx) => {
    const existingOrder = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!existingOrder) {
      throw new Error("Không tìm thấy đơn hàng.");
    }

    if (existingOrder.source !== OrderSource.OFFLINE) {
      throw new Error("Không thể sửa nhanh đơn online từ màn hình này.");
    }

    if (
      existingOrder.status === OrderStatus.CANCELLED ||
      existingOrder.status === OrderStatus.REFUNDED ||
      existingOrder.paymentStatus === PaymentStatus.REFUNDED
    ) {
      throw new Error("Không thể chỉnh sửa đơn đã hủy hoặc hoàn tiền.");
    }

    const oldQuantityMap = getExistingOrderQuantityMap(existingOrder);
    const calculatedOrder = await buildOrderItems(tx, items, oldQuantityMap);

    await applyInventoryDelta(
      tx,
      oldQuantityMap,
      calculatedOrder.items,
      orderId,
    );
    await tx.orderItem.deleteMany({ where: { orderId } });

    const order = await tx.order.update({
      where: { id: orderId },
      data: {
        updatedById: adminId,
        paymentMethod,
        paymentStatus,
        isPaid: paymentStatus === PaymentStatus.PAID,
        paidAt:
          paymentStatus === PaymentStatus.PAID
            ? (existingOrder.paidAt ?? new Date())
            : null,
        subtotal: calculatedOrder.subtotal,
        totalCost: calculatedOrder.totalCost,
        totalAmount: calculatedOrder.totalAmount,
        paidAmount:
          paymentStatus === PaymentStatus.PAID
            ? calculatedOrder.totalAmount
            : 0,
        remainingAmount:
          paymentStatus === PaymentStatus.PAID
            ? 0
            : calculatedOrder.totalAmount,
        profit: calculatedOrder.profit,
        items: {
          create: calculatedOrder.items,
        },
      },
      include: includeOrderDetail,
    });

    return serializeOrder(order);
  });
}

export async function cancelOfflineOrder(orderId: number, adminId: number) {
  return prisma.$transaction(async (tx) => {
    const existingOrder = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!existingOrder) {
      throw new Error("Không tìm thấy đơn hàng.");
    }

    if (existingOrder.source !== OrderSource.OFFLINE) {
      throw new Error("Không thể hủy đơn online từ màn hình này.");
    }

    if (existingOrder.status === OrderStatus.CANCELLED) {
      throw new Error("Đơn hàng này đã được hủy trước đó.");
    }

    const oldQuantityMap = getExistingOrderQuantityMap(existingOrder);
    await applyInventoryDelta(tx, oldQuantityMap, [], orderId);

    const order = await tx.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.CANCELLED,
        paymentStatus:
          existingOrder.paymentStatus === PaymentStatus.PAID
            ? PaymentStatus.REFUNDED
            : existingOrder.paymentStatus,
        cancelledAt: new Date(),
        updatedById: adminId,
        statusHistories: {
          create: {
            previousStatus: existingOrder.status,
            currentStatus: OrderStatus.CANCELLED,
            changedById: adminId,
            note: "Hủy đơn tại shop và hoàn tồn kho",
          },
        },
      },
      include: includeOrderDetail,
    });

    return serializeOrder(order);
  });
}

export async function updateOnlineOrderStatus(
  orderId: number,
  nextStatus: OrderStatus,
  adminId: number,
) {
  return prisma.$transaction(async (tx) => {
    const existingOrder = await tx.order.findUnique({
      where: { id: orderId },
      include: includeOrderDetail,
    });

    if (!existingOrder) {
      throw new Error("Không tìm thấy đơn hàng.");
    }

    if (existingOrder.source !== OrderSource.ONLINE) {
      throw new Error("Luồng trạng thái online chỉ áp dụng cho đơn online.");
    }

    const allowedNextStatus =
      ONLINE_STATUS_FLOW[
        existingOrder.status as keyof typeof ONLINE_STATUS_FLOW
      ];

    if (!allowedNextStatus || nextStatus !== allowedNextStatus) {
      throw new Error("Không thể chuyển trạng thái đơn online theo bước này.");
    }

    const order = await tx.order.update({
      where: { id: orderId },
      data: {
        status: nextStatus,
        updatedById: adminId,
        completedAt:
          nextStatus === OrderStatus.DELIVERED
            ? (existingOrder.completedAt ?? new Date())
            : undefined,
        deliveredAt:
          nextStatus === OrderStatus.DELIVERED
            ? (existingOrder.deliveredAt ?? new Date())
            : undefined,
        statusHistories: {
          create: {
            previousStatus: existingOrder.status,
            currentStatus: nextStatus,
            changedById: adminId,
            note: "Cập nhật trạng thái đơn online",
          },
        },
      },
      include: includeOrderDetail,
    });

    return serializeOrder(order);
  });
}

export async function getOrderDetail(orderId: number) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: includeOrderDetail,
  });

  if (!order) {
    throw new Error("Không tìm thấy đơn hàng.");
  }

  return serializeOrder(order);
}
