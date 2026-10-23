import { expireUnpaidOnlineOrders } from "@/lib/orders/daily-orders";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await expireUnpaidOnlineOrders(30));
}
