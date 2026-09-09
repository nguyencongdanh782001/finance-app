/* eslint-disable @typescript-eslint/no-non-null-assertion */
import prisma from "@/lib/db";
import { signJwt, verifyJwt } from "@/lib/auth/crypto";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const userId = Number(request.headers.get("x-user-id"));
  if (!Number.isInteger(userId) || userId < 1 || request.headers.get("x-user-role") !== "CUSTOMER") return NextResponse.json({ message: "Vui lòng đăng nhập để thanh toán." }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const ids = (Array.isArray(body.cartItemIds) ? [...new Set(body.cartItemIds.map((value: unknown) => Number(value)).filter((id: number) => Number.isInteger(id) && id > 0))] : []) as number[];
  if (!ids.length) return NextResponse.json({ message: "Vui lòng chọn ít nhất một sản phẩm để thanh toán." }, { status: 400 });
  const cart = await prisma.cart.findFirst({ where: { userId, status: "ACTIVE" }, select: { id: true } });
  if (!cart) return NextResponse.json({ message: "Giỏ hàng không có sản phẩm được chọn." }, { status: 409 });
  const items = await prisma.cartItem.findMany({ where: { cartId: cart.id, id: { in: ids } }, include: { product: { select: { status: true } }, variant: { select: { isActive: true, quantity: true, reservedQuantity: true } } } });
  if (items.length !== ids.length || items.some((item) => item.product.status !== "PUBLIC" || !item.variant?.isActive || item.variant.quantity - item.variant.reservedQuantity < item.quantity)) return NextResponse.json({ message: "Một hoặc nhiều sản phẩm vừa hết hàng hoặc không còn khả dụng." }, { status: 409 });
  const token = await signJwt({ sub: String(userId), role: "CUSTOMER", intentType: "CART", cartItemIds: ids }, 300);
  return NextResponse.json({ token, expiresIn: 300 });
}

export async function GET(request: Request) {
  const userId = Number(request.headers.get("x-user-id"));
  const token = new URL(request.url).searchParams.get("token") || "";
  const payload = await verifyJwt(token).catch(() => null);
  if (!payload || payload.intentType !== "CART" || payload.sub !== String(userId) || !payload.cartItemIds?.length) return NextResponse.json({ message: "Phiên thanh toán đã hết hạn." }, { status: 401 });
  const cart = await prisma.cart.findFirst({ where: { userId, status: "ACTIVE" }, select: { id: true } });
  if (!cart) return NextResponse.json({ message: "Giỏ hàng không có sản phẩm được chọn." }, { status: 409 });
  const items = await prisma.cartItem.findMany({ where: { cartId: cart.id, id: { in: payload.cartItemIds } }, include: { product: { select: { title: true, imageUrl: true, status: true } }, variant: { select: { id: true, isActive: true, sku: true, color: true, size: true, sellPrice: true, quantity: true, reservedQuantity: true, images: { orderBy: { position: "asc" }, take: 1 } } } } });
  if (items.length !== payload.cartItemIds.length || items.some((item) => item.product.status !== "PUBLIC" || !item.variant?.isActive || item.variant.quantity - item.variant.reservedQuantity < item.quantity)) return NextResponse.json({ message: "Sản phẩm trong phiên thanh toán đã thay đổi." }, { status: 409 });
  return NextResponse.json({ mode: "CART", items: items.map((item) => ({ variantId: item.variant!.id, quantity: item.quantity, title: item.product.title, price: Number(item.variant!.sellPrice), imageUrl: item.variant!.images[0]?.url || item.product.imageUrl, variantLabel: [item.variant!.color, item.variant!.size].filter(Boolean).join(" · "), available: item.variant!.quantity - item.variant!.reservedQuantity })) });
}
