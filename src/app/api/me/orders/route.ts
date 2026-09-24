import { OrderStatus } from "@/app/generated/prisma/client";
import { CUSTOMER_ORDER_FILTER_STATUSES } from "@/lib/orders/order-status";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

const money = (value: unknown) => Number(value || 0);

const isCustomer = (request: Request) =>
  Number(request.headers.get("x-user-id")) > 0 &&
  request.headers.get("x-user-role") === "CUSTOMER";

const toSummary = (order: {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  source: "ONLINE" | "OFFLINE";
  createdAt: Date;
  placedAt: Date;
  subtotal: unknown;
  discountAmount: unknown;
  shippingFee: unknown;
  totalAmount: unknown;
  paymentMethod: string | null;
  paymentStatus: string;
  receiverName: string | null;
  receiverAddress: string | null;
  receiverWard: string | null;
  receiverDistrict: string | null;
  receiverProvince: string | null;
  items: Array<{
    productId: number | null;
    variantId: number | null;
    productTitle: string;
    productImageUrl: string | null;
    color: string | null;
    size: string | null;
    quantity: number;
  }>;
}) => ({
  id: order.id,
  orderNumber: order.orderNumber,
  status: order.status,
  source: order.source,
  createdAt: order.createdAt.toISOString(),
  placedAt: order.placedAt.toISOString(),
  subtotal: money(order.subtotal),
  discountAmount: money(order.discountAmount),
  shippingFee: money(order.shippingFee),
  totalAmount: money(order.totalAmount),
  paymentMethod: order.paymentMethod,
  paymentStatus: order.paymentStatus,
  receiverName: order.receiverName,
  receiverAddress: [
    order.receiverAddress,
    order.receiverWard,
    order.receiverDistrict,
    order.receiverProvince,
  ]
    .filter(Boolean)
    .join(", "),
  itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
  lineCount: order.items.length,
  items: order.items.slice(0, 3).map((item) => ({
    productId: item.productId,
    variantId: item.variantId,
    title: item.productTitle,
    imageUrl: item.productImageUrl,
    color: item.color,
    size: item.size,
    variantLabel: [item.color, item.size].filter(Boolean).join(" · "),
    quantity: item.quantity,
  })),
});

export async function GET(request: Request) {
  if (!isCustomer(request)) {
    return NextResponse.json({ message: "Vui lòng đăng nhập." }, { status: 401 });
  }

  const userId = Number(request.headers.get("x-user-id"));
  const params = new URL(request.url).searchParams;
  const page = Math.max(1, Number(params.get("page") || 1));
  const limit = Math.min(10, Math.max(1, Number(params.get("limit") || 6)));
  const requestedStatus = params.get("status") || "ALL";
  const statuses =
    CUSTOMER_ORDER_FILTER_STATUSES[
      requestedStatus as keyof typeof CUSTOMER_ORDER_FILTER_STATUSES
    ] || CUSTOMER_ORDER_FILTER_STATUSES.ALL;
  const search = params.get("search")?.trim();
  const where = {
    userId,
    source: "ONLINE" as const,
    status: { in: statuses },
    ...(search
      ? { orderNumber: { contains: search, mode: "insensitive" as const } }
      : {}),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { placedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        source: true,
        createdAt: true,
        placedAt: true,
        subtotal: true,
        discountAmount: true,
        shippingFee: true,
        totalAmount: true,
        paymentMethod: true,
        paymentStatus: true,
        receiverName: true,
        receiverAddress: true,
        receiverWard: true,
        receiverDistrict: true,
        receiverProvince: true,
        items: {
          orderBy: { id: "asc" },
          select: {
            productId: true,
            variantId: true,
            productTitle: true,
            productImageUrl: true,
            color: true,
            size: true,
            quantity: true,
          },
        },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return NextResponse.json({
    items: orders.map(toSummary),
    page,
    limit,
    total,
    hasMore: page * limit < total,
  });
}
