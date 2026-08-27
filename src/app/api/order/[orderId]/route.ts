import { NextResponse } from "next/server";
import {
  getAdminFromRequest,
  getOrderDetail,
  updateOnlineOrderStatus,
  updateOfflineOrder,
  type OfflineOrderPayload,
} from "@/lib/orders/daily-orders";
import { OrderStatus } from "@/app/generated/prisma/client";

const toErrorResponse = (error: unknown) => {
  if (error instanceof Response) {
    return error;
  }

  const message =
    error instanceof Error
      ? error.message
      : "Không thể xử lý đơn hàng. Vui lòng thử lại.";
  const safeMessage =
    message.includes("current transaction is aborted") ||
    message.includes("Foreign key constraint") ||
    message.includes("Unique constraint")
      ? "Không thể xử lý đơn hàng. Vui lòng thử lại."
      : message;

  return NextResponse.json(
    {
      message: safeMessage,
    },
    { status: 400 },
  );
};

export async function GET(
  req: Request,
  context: { params: Promise<{ orderId: string }> },
) {
  try {
    getAdminFromRequest(req);
    const { orderId: rawOrderId } = await context.params;
    const orderId = Number(rawOrderId);

    if (!orderId || Number.isNaN(orderId)) {
      return NextResponse.json(
        { message: "Invalid order id" },
        { status: 400 },
      );
    }

    const response = await getOrderDetail(orderId);

    return NextResponse.json(response);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PATCH(
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

    const payload = (await req.json()) as OfflineOrderPayload & {
      status?: OrderStatus;
    };
    const response = payload.status
      ? await updateOnlineOrderStatus(orderId, payload.status, admin.userId)
      : await updateOfflineOrder(orderId, payload, admin.userId);

    return NextResponse.json(response);
  } catch (error) {
    return toErrorResponse(error);
  }
}
