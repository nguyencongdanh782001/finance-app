import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getAdminInvoice } from "@/lib/invoices/service";

export async function GET(
  req: Request,
  context: { params: Promise<{ orderId: string }> },
) {
  const userId = Number(req.headers.get("x-user-id"));
  if (
    !Number.isInteger(userId) ||
    userId < 1 ||
    req.headers.get("x-user-role") !== "CUSTOMER"
  ) {
    return NextResponse.json(
      { message: "Vui lòng đăng nhập để xem hóa đơn." },
      { status: 401 },
    );
  }
  const orderId = Number((await context.params).orderId);
  if (!Number.isInteger(orderId) || orderId < 1)
    return NextResponse.json(
      { message: "Mã đơn hàng không hợp lệ." },
      { status: 400 },
    );
  const owned = await prisma.order.findFirst({
    where: { id: orderId, userId },
    select: { id: true },
  });
  if (!owned)
    return NextResponse.json(
      { message: "Không tìm thấy hóa đơn." },
      { status: 404 },
    );
  const invoice = await prisma.orderInvoice.findFirst({
    where: { orderId, status: "ISSUED", isPrimary: true },
    select: { id: true },
  });
  if (!invoice)
    return NextResponse.json(
      { message: "Hóa đơn chưa được phát hành." },
      { status: 404 },
    );
  return NextResponse.json(await getAdminInvoice(invoice.id), {
    headers: { "Cache-Control": "private, no-store" },
  });
}
