import { NextResponse } from "next/server";
import {
  cancelOfflineOrder,
  getAdminFromRequest,
} from "@/lib/orders/daily-orders";

const toErrorResponse = (error: unknown) => {
  if (error instanceof Response) {
    return error;
  }

  return NextResponse.json(
    {
      message:
        error instanceof Error
          ? error.message
          : "Không thể hủy đơn hàng. Vui lòng thử lại.",
    },
    { status: 400 },
  );
};

export async function POST(
  req: Request,
  context: { params: Promise<{ orderId: string }> },
) {
  try {
    const admin = getAdminFromRequest(req);
    const { orderId: rawOrderId } = await context.params;
    const orderId = Number(rawOrderId);

    if (!orderId || Number.isNaN(orderId)) {
      return NextResponse.json(
        { message: "Invalid order id" },
        { status: 400 },
      );
    }

    const body = await req.json().catch(() => ({}));
    const response = await cancelOfflineOrder(
      orderId,
      admin.userId,
      String(body.reason || ""),
    );

    return NextResponse.json(response);
  } catch (error) {
    return toErrorResponse(error);
  }
}
