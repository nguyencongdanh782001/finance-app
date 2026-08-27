import { NextResponse } from "next/server";
import {
  createOfflineOrder,
  getAdminFromRequest,
  listDailyOrders,
  type DailyOrderSourceFilter,
  type DailyOrderStatusFilter,
  type DailyPaymentMethodFilter,
  type DailyPaymentStatusFilter,
  type OfflineOrderPayload,
} from "@/lib/orders/daily-orders";

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
      ? "Không thể tạo đơn hàng. Vui lòng thử lại."
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
  context: { params: Promise<{ id: string }> },
) {
  try {
    getAdminFromRequest(req);
    const { id } = await context.params;
    const dailyId = Number(id);

    if (!dailyId || Number.isNaN(dailyId)) {
      return NextResponse.json(
        { message: "Invalid daily id" },
        { status: 400 },
      );
    }

    const { searchParams } = new URL(req.url);
    const response = await listDailyOrders(dailyId, {
      search: searchParams.get("search") || undefined,
      source: (searchParams.get("source") || "ALL") as DailyOrderSourceFilter,
      status: (searchParams.get("status") || "ALL") as DailyOrderStatusFilter,
      paymentStatus: (searchParams.get("paymentStatus") ||
        "ALL") as DailyPaymentStatusFilter,
      paymentMethod: (searchParams.get("paymentMethod") ||
        "ALL") as DailyPaymentMethodFilter,
    });

    return NextResponse.json(response);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const admin = getAdminFromRequest(req);
    const { id } = await context.params;
    const dailyId = Number(id);

    if (!dailyId || Number.isNaN(dailyId)) {
      return NextResponse.json(
        { message: "Invalid daily id" },
        { status: 400 },
      );
    }

    const payload = (await req.json()) as OfflineOrderPayload;
    const response = await createOfflineOrder(dailyId, payload, admin.userId);

    return NextResponse.json(response);
  } catch (error) {
    return toErrorResponse(error);
  }
}
