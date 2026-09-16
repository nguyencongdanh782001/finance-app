import prisma from "@/lib/db";
import { getAdminFromRequest } from "@/lib/orders/daily-orders";
import { NextResponse } from "next/server";

const money = (value: unknown) => Number(value || 0);

export async function GET(
  request: Request,
  context: { params: Promise<{ orderId: string }> },
) {
  try {
    getAdminFromRequest(request);
    const orderId = Number((await context.params).orderId);
    if (!Number.isInteger(orderId) || orderId < 1) {
      return NextResponse.json(
        { message: "Mã đơn không hợp lệ." },
        { status: 400 },
      );
    }
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        orderNumber: true,
        source: true,
        status: true,
        paymentMethod: true,
        paymentStatus: true,
        subtotal: true,
        discountAmount: true,
        shippingFee: true,
        totalAmount: true,
        receiverName: true,
        receiverPhone: true,
        receiverAddress: true,
        receiverWard: true,
        receiverDistrict: true,
        receiverProvince: true,
        placedAt: true,
        items: {
          orderBy: { id: "asc" },
          select: {
            productTitle: true,
            productImageUrl: true,
            sku: true,
            color: true,
            size: true,
            quantity: true,
            unitPrice: true,
            totalPrice: true,
          },
        },
      },
    });
    if (!order)
      return NextResponse.json(
        { message: "Không tìm thấy đơn hàng." },
        { status: 404 },
      );
    return NextResponse.json({
      ...order,
      subtotal: money(order.subtotal),
      discountAmount: money(order.discountAmount),
      shippingFee: money(order.shippingFee),
      totalAmount: money(order.totalAmount),
      items: order.items.map((item) => ({
        ...item,
        unitPrice: money(item.unitPrice),
        totalPrice: money(item.totalPrice),
      })),
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json(
      { message: "Không thể tải đơn hàng." },
      { status: 500 },
    );
  }
}
