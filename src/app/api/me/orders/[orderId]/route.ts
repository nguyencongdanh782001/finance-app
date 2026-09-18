import prisma from "@/lib/db";
import { cancelOfflineOrder } from "@/lib/orders/daily-orders";
import { NextResponse } from "next/server";
const n = (x: unknown) => Number(x || 0);
export async function GET(request: Request, context: { params: Promise<{ orderId: string }> }) { const userId = Number(request.headers.get("x-user-id")); const orderId = Number((await context.params).orderId); if (!userId || !orderId) return NextResponse.json({ message: "Không hợp lệ." }, { status: 400 }); const order = await prisma.order.findFirst({ where: { id: orderId, userId, source: "ONLINE" }, select: { id: true, orderNumber: true, status: true, createdAt: true, placedAt: true, deliveredAt: true, completedAt: true, subtotal: true, discountAmount: true, shippingFee: true, taxAmount: true, totalAmount: true, paymentMethod: true, paymentStatus: true, receiverName: true, receiverPhone: true, receiverAddress: true, receiverWard: true, receiverDistrict: true, receiverProvince: true, items: { orderBy: { id: "asc" }, select: { productId: true, variantId: true, productTitle: true, productImageUrl: true, color: true, size: true, sku: true, quantity: true, originalUnitPrice: true, unitPrice: true, totalPrice: true, variantOptionsSnapshot: true } }, statusHistories: { orderBy: { createdAt: "asc" }, select: { currentStatus: true, createdAt: true } } } }); if (!order) return NextResponse.json({ message: "Không tìm thấy đơn hàng." }, { status: 404 }); return NextResponse.json({ ...order, subtotal: n(order.subtotal), discountAmount: n(order.discountAmount), shippingFee: n(order.shippingFee), taxAmount: n(order.taxAmount), totalAmount: n(order.totalAmount), items: order.items.map((item) => ({ ...item, originalUnitPrice: n(item.originalUnitPrice), unitPrice: n(item.unitPrice), totalPrice: n(item.totalPrice) })) }); }

export async function POST(request: Request, context: { params: Promise<{ orderId: string }> }) {
  const userId = Number(request.headers.get("x-user-id"));
  const orderId = Number((await context.params).orderId);
  if (!userId || !orderId) return NextResponse.json({ message: "Không hợp lệ." }, { status: 400 });
  try {
    const body = await request.json().catch(() => ({}));
    const order = await cancelOfflineOrder(
      orderId,
      userId,
      String(body.reason || ""),
      userId,
    );
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Không thể hủy đơn hàng." },
      { status: 400 },
    );
  }
}
