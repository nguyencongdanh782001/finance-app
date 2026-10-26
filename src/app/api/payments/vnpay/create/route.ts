import prisma from "@/lib/db";
import { buildVnpayPaymentUrl, getVnpayConfig } from "@/lib/vnpay";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const userId = Number(request.headers.get("x-user-id"));
  if (!userId || request.headers.get("x-user-role") !== "CUSTOMER") return NextResponse.json({ message: "Vui lòng đăng nhập." }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const orderNumber = String(body.orderNumber || "").trim();
  const order = await prisma.order.findFirst({ where: { userId, orderNumber, source: "ONLINE" }, select: { orderNumber: true, totalAmount: true, paymentMethod: true, paymentStatus: true } });
  if (!order || order.paymentMethod !== "BANK_TRANSFER") return NextResponse.json({ message: "Không tìm thấy đơn thanh toán." }, { status: 404 });
  if (order.paymentStatus === "PAID") return NextResponse.json({ message: "Đơn hàng đã thanh toán." }, { status: 409 });
  const config = getVnpayConfig(new URL(request.url).origin);
  if (!config) return NextResponse.json({ message: "VNPAY chưa được cấu hình." }, { status: 503 });
  return NextResponse.json({ paymentUrl: buildVnpayPaymentUrl({ config, orderNumber: order.orderNumber, amount: Number(order.totalAmount), ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() }) });
}
