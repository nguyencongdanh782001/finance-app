import {
  OrderSource,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Prisma,
} from "@/app/generated/prisma/client";
import prisma from "@/lib/db";
import { CUSTOMER_ORDER_FILTER_STATUSES } from "@/lib/orders/order-status";

export const ADMIN_ORDER_SORTS = [
  "newest",
  "oldest",
  "total-desc",
  "total-asc",
] as const;

export type AdminOrderSort = (typeof ADMIN_ORDER_SORTS)[number];

export type AdminOnlineOrderQuery = {
  page: number;
  limit: number;
  search: string;
  status: keyof typeof CUSTOMER_ORDER_FILTER_STATUSES;
  paymentStatus: PaymentStatus | "ALL";
  paymentMethod: PaymentMethod | "ALL";
  delivery: "ALL" | "WITH_SHIPMENT" | "WITHOUT_SHIPMENT";
  from: Date | null;
  to: Date | null;
  sort: AdminOrderSort;
};

const isEnumValue = <T extends string>(
  values: readonly T[],
  value: string | null,
): value is T => Boolean(value && values.includes(value as T));

const startOfVietnamDate = (value: string | null) => {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00+07:00`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const endOfVietnamDate = (value: string | null) => {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T23:59:59.999+07:00`);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const parseAdminOnlineOrderQuery = (
  searchParams: URLSearchParams,
): AdminOnlineOrderQuery => {
  const rawPage = Number(searchParams.get("page"));
  const rawLimit = Number(searchParams.get("limit"));
  const rawStatus = searchParams.get("status");
  const rawPaymentStatus = searchParams.get("paymentStatus");
  const rawPaymentMethod = searchParams.get("paymentMethod");
  const rawDelivery = searchParams.get("delivery");
  const rawSort = searchParams.get("sort");
  const statusValues = Object.keys(CUSTOMER_ORDER_FILTER_STATUSES) as Array<
    keyof typeof CUSTOMER_ORDER_FILTER_STATUSES
  >;

  return {
    page: Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1,
    limit:
      Number.isInteger(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 100) : 20,
    search: (searchParams.get("search") || "").trim().slice(0, 100),
    status: isEnumValue(statusValues, rawStatus) ? rawStatus : "ALL",
    paymentStatus: isEnumValue(Object.values(PaymentStatus), rawPaymentStatus)
      ? rawPaymentStatus
      : "ALL",
    paymentMethod: isEnumValue(Object.values(PaymentMethod), rawPaymentMethod)
      ? rawPaymentMethod
      : "ALL",
    delivery:
      rawDelivery === "WITH_SHIPMENT" || rawDelivery === "WITHOUT_SHIPMENT"
        ? rawDelivery
        : "ALL",
    from: startOfVietnamDate(searchParams.get("from")),
    to: endOfVietnamDate(searchParams.get("to")),
    sort: isEnumValue(ADMIN_ORDER_SORTS, rawSort) ? rawSort : "newest",
  };
};

export const buildAdminOnlineOrderWhere = (
  query: AdminOnlineOrderQuery,
): Prisma.OrderWhereInput => {
  const where: Prisma.OrderWhereInput = { source: OrderSource.ONLINE };

  if (query.status !== "ALL") {
    where.status = { in: CUSTOMER_ORDER_FILTER_STATUSES[query.status] };
  }
  if (query.paymentStatus !== "ALL") where.paymentStatus = query.paymentStatus;
  if (query.paymentMethod !== "ALL") where.paymentMethod = query.paymentMethod;
  if (query.delivery === "WITH_SHIPMENT") where.shipments = { some: {} };
  if (query.delivery === "WITHOUT_SHIPMENT") where.shipments = { none: {} };
  if (query.from || query.to) {
    where.placedAt = {
      ...(query.from ? { gte: query.from } : {}),
      ...(query.to ? { lte: query.to } : {}),
    };
  }
  if (query.search) {
    where.OR = [
      { orderNumber: { contains: query.search, mode: "insensitive" } },
      { receiverName: { contains: query.search, mode: "insensitive" } },
      { receiverPhone: { contains: query.search, mode: "insensitive" } },
      {
        user: { displayName: { contains: query.search, mode: "insensitive" } },
      },
      { user: { phone: { contains: query.search, mode: "insensitive" } } },
    ];
  }

  return where;
};

const getOrderBy = (
  sort: AdminOrderSort,
): Prisma.OrderOrderByWithRelationInput => {
  if (sort === "oldest") return { placedAt: "asc" };
  if (sort === "total-desc") return { totalAmount: "desc" };
  if (sort === "total-asc") return { totalAmount: "asc" };
  return { placedAt: "desc" };
};

const money = (value: unknown) => Number(value || 0);

export async function listAdminOnlineOrders(query: AdminOnlineOrderQuery) {
  const where = buildAdminOnlineOrderWhere(query);
  const baseWhere = {
    source: OrderSource.ONLINE,
  } satisfies Prisma.OrderWhereInput;
  const [orders, total, grouped, paymentPendingCount] = await Promise.all([
    prisma.order.findMany({
      where,
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      orderBy: [getOrderBy(query.sort), { id: "desc" }],
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
        paymentMethod: true,
        totalAmount: true,
        placedAt: true,
        updatedAt: true,
        receiverName: true,
        receiverPhone: true,
        user: { select: { displayName: true, phone: true, email: true } },
        items: {
          orderBy: { id: "asc" },
          take: 2,
          select: { productTitle: true, quantity: true },
        },
        _count: { select: { items: true } },
      },
    }),
    prisma.order.count({ where }),
    prisma.order.groupBy({
      by: ["status"],
      where: baseWhere,
      _count: { _all: true },
    }),
    prisma.order.count({
      where: {
        source: OrderSource.ONLINE,
        status: { notIn: [OrderStatus.CANCELLED, OrderStatus.REFUNDED] },
        paymentStatus: {
          in: [
            PaymentStatus.UNPAID,
            PaymentStatus.PENDING,
            PaymentStatus.PROCESSING,
            PaymentStatus.AUTHORIZED,
            PaymentStatus.FAILED,
          ],
        },
      },
    }),
  ]);

  const countFor = (statuses: OrderStatus[]) =>
    grouped.reduce(
      (sum, item) =>
        sum + (statuses.includes(item.status) ? item._count._all : 0),
      0,
    );

  return {
    items: orders.map((order) => ({
      ...order,
      totalAmount: money(order.totalAmount),
      itemCount: order._count.items,
      customerName:
        order.receiverName || order.user?.displayName || "Khách hàng",
      customerPhone: order.receiverPhone || order.user?.phone || null,
      customerEmail: order.user?.email || null,
      _count: undefined,
    })),
    counts: {
      all: grouped.reduce((sum, item) => sum + item._count._all, 0),
      pending: countFor(CUSTOMER_ORDER_FILTER_STATUSES.PENDING),
      confirmed: countFor(CUSTOMER_ORDER_FILTER_STATUSES.CONFIRMED),
      preparing: countFor(CUSTOMER_ORDER_FILTER_STATUSES.PREPARING),
      shipping: countFor(CUSTOMER_ORDER_FILTER_STATUSES.SHIPPING),
      delivered: countFor(CUSTOMER_ORDER_FILTER_STATUSES.DELIVERED),
      cancelled: countFor(CUSTOMER_ORDER_FILTER_STATUSES.CANCELLED),
      paymentPending: paymentPendingCount,
    },
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    },
  };
}
