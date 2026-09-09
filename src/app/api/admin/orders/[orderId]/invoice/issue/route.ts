import { NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/orders/daily-orders";
import { issueInvoice } from "@/lib/invoices/service";

export async function POST(
  req: Request,
  context: { params: Promise<{ orderId: string }> },
) {
  try {
    const admin = getAdminFromRequest(req);
    const orderId = Number((await context.params).orderId);
    const body = (await req.json().catch(() => ({}))) as {
      reissueReason?: string;
    };
    if (!Number.isInteger(orderId) || orderId < 1)
      return NextResponse.json(
        { message: "Mã đơn hàng không hợp lệ." },
        { status: 400 },
      );
    return NextResponse.json(
      await issueInvoice(orderId, admin.userId, body.reissueReason),
    );
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Không thể phát hành hóa đơn.",
      },
      { status: 400 },
    );
  }
}
