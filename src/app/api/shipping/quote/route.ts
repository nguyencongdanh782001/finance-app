import { calculateShippingQuote, validateCoordinates } from "@/lib/geoapify";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const userId = Number(request.headers.get("x-user-id"));
  if (!Number.isInteger(userId) || userId < 1 || request.headers.get("x-user-role") !== "CUSTOMER") {
    return NextResponse.json({ message: "Vui lòng đăng nhập để tính phí giao hàng." }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const latitude = Number(body.destinationLatitude);
  const longitude = Number(body.destinationLongitude);
  if (!validateCoordinates(latitude, longitude)) return NextResponse.json({ message: "Tọa độ giao hàng không hợp lệ." }, { status: 422 });
  try {
    return NextResponse.json(await calculateShippingQuote(latitude, longitude));
  } catch (error) {
    console.error("Shipping quote unavailable", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ message: error instanceof Error ? error.message : "Không thể tính phí giao hàng." }, { status: 503 });
  }
}
