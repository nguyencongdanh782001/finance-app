import { NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/orders/daily-orders";
import {
  listAdminOnlineOrders,
  parseAdminOnlineOrderQuery,
} from "@/lib/orders/admin-online-orders";

export async function GET(request: Request) {
  try {
    getAdminFromRequest(request);
    const query = parseAdminOnlineOrderQuery(new URL(request.url).searchParams);
    return NextResponse.json(await listAdminOnlineOrders(query));
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json(
      { message: "Không thể tải danh sách đơn hàng." },
      { status: 500 },
    );
  }
}
