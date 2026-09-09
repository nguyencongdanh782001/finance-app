import { NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/orders/daily-orders";
import { previewInvoice } from "@/lib/invoices/service";

export async function POST(
  req: Request,
  context: { params: Promise<{ orderId: string }> },
) {
  try {
    getAdminFromRequest(req);
    const orderId = Number((await context.params).orderId);
    if (!Number.isInteger(orderId) || orderId < 1)
      return NextResponse.json(
        { message: "Mã đơn hàng không hợp lệ." },
        { status: 400 },
      );
    return NextResponse.json(await previewInvoice(orderId));
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Không thể tải bản xem trước hóa đơn.",
      },
      { status: 400 },
    );
  }
}
