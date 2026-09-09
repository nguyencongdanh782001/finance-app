import { NextResponse } from "next/server";
import { getPublicInvoice } from "@/lib/invoices/service";

export async function GET(
  _req: Request,
  context: { params: Promise<{ token: string }> },
) {
  try {
    const token = (await context.params).token;
    if (!token || token.length < 32)
      return NextResponse.json(
        { message: "Liên kết hóa đơn không hợp lệ." },
        { status: 404 },
      );
    return NextResponse.json(await getPublicInvoice(token), {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch {
    return NextResponse.json(
      { message: "Không tìm thấy hóa đơn." },
      { status: 404 },
    );
  }
}
