/* eslint-disable @typescript-eslint/no-explicit-any */
import { OrderStatus, PaymentStatus } from "@/app/generated/prisma/client";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

const money = (value: unknown) => Number(value || 0);
const summary = (order: any) => ({ id: order.id, orderNumber: order.orderNumber, status: order.status, createdAt: order.createdAt, subtotal: money(order.subtotal), discountAmount: money(order.discountAmount), shippingFee: money(order.shippingFee), totalAmount: money(order.totalAmount), paymentMethod: order.paymentMethod, paymentStatus: order.paymentStatus, receiverName: order.receiverName, receiverAddress: [order.receiverAddress, order.receiverWard, order.receiverDistrict, order.receiverProvince].filter(Boolean).join(", "), itemCount: order.items.reduce((sum: number, item: any) => sum + item.quantity, 0), items: order.items.slice(0, 2).map((item: any) => ({ productId: item.productId, variantId: item.variantId, title: item.productTitle, imageUrl: item.productImageUrl, variantLabel: [item.color, item.size].filter(Boolean).join(" · "), quantity: item.quantity })) });
const statuses = new Set(Object.values(OrderStatus));

export async function GET(request: Request) {
  const userId = Number(request.headers.get("x-user-id"));
  if (!userId) return NextResponse.json({ message: "Vui lòng đăng nhập." }, { status: 401 });
  const url = new URL(request.url); const page = Math.max(1, Number(url.searchParams.get("page") || 1)); const limit = Math.min(10, Math.max(1, Number(url.searchParams.get("limit") || 6))); const status = url.searchParams.get("status") || ""; const search = url.searchParams.get("search")?.trim();
  const where = { userId, source: "ONLINE" as const, ...(statuses.has(status as OrderStatus) ? { status: status as OrderStatus } : {}), ...(search ? { orderNumber: { contains: search, mode: "insensitive" as const } } : {}) };
  const [orders, total] = await Promise.all([prisma.order.findMany({ where, orderBy: { placedAt: "desc" }, skip: (page - 1) * limit, take: limit, select: { id: true, orderNumber: true, status: true, createdAt: true, subtotal: true, discountAmount: true, shippingFee: true, totalAmount: true, paymentMethod: true, paymentStatus: true, receiverName: true, receiverAddress: true, receiverWard: true, receiverDistrict: true, receiverProvince: true, items: { orderBy: { id: "asc" }, select: { productId: true, variantId: true, productTitle: true, productImageUrl: true, color: true, size: true, quantity: true } } } }), prisma.order.count({ where })]);
  return NextResponse.json({ items: orders.map(summary), page, limit, total, hasMore: page * limit < total });
}
