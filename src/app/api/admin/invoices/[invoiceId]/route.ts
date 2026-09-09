import { NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/orders/daily-orders";
import { getAdminInvoice, voidInvoice } from "@/lib/invoices/service";

export async function GET(
  req: Request,
  context: { params: Promise<{ invoiceId: string }> },
) {
  try {
    getAdminFromRequest(req);
    const invoiceId = Number((await context.params).invoiceId);
    if (!Number.isInteger(invoiceId) || invoiceId < 1)
      return NextResponse.json(
        { message: "Mã hóa đơn không hợp lệ." },
        { status: 400 },
      );
    return NextResponse.json(await getAdminInvoice(invoiceId));
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Không thể tải hóa đơn.",
      },
      { status: 400 },
    );
  }
}

export async function POST(
  req: Request,
  context: { params: Promise<{ invoiceId: string }> },
) {
  try {
    const admin = getAdminFromRequest(req);
    const invoiceId = Number((await context.params).invoiceId);
    const body = (await req.json().catch(() => ({}))) as {
      action?: string;
      reason?: string;
    };
    if (body.action !== "void")
      return NextResponse.json(
        { message: "Thao tác không hợp lệ." },
        { status: 400 },
      );
    return NextResponse.json(
      await voidInvoice(invoiceId, admin.userId, body.reason || ""),
    );
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Không thể hủy hóa đơn.",
      },
      { status: 400 },
    );
  }
}
