import prisma from "@/lib/db";
import { calculateShippingQuote, validateCoordinates } from "@/lib/geoapify";
import {
  createShippingCalculation,
  getShippingConfiguration,
} from "@/lib/shipping";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const userId = Number(request.headers.get("x-user-id"));
  if (
    !Number.isInteger(userId) ||
    userId < 1 ||
    request.headers.get("x-user-role") !== "CUSTOMER"
  ) {
    return NextResponse.json(
      { message: "Vui lòng đăng nhập để tính phí giao hàng." },
      { status: 401 },
    );
  }
  const body = await request.json().catch(() => ({}));
  let latitude = Number(body.destinationLatitude);
  let longitude = Number(body.destinationLongitude);
  if (Number.isInteger(Number(body.addressId))) {
    const address = await prisma.userAddress.findFirst({
      where: { id: Number(body.addressId), userId },
      select: { latitude: true, longitude: true },
    });
    if (!address) {
      return NextResponse.json(
        { message: "Địa chỉ giao hàng không tồn tại." },
        { status: 404 },
      );
    }
    latitude = Number(address.latitude);
    longitude = Number(address.longitude);
  }
  if (!validateCoordinates(latitude, longitude))
    return NextResponse.json(
      { message: "Tọa độ giao hàng không hợp lệ." },
      { status: 422 },
    );
  try {
    const config = await getShippingConfiguration();
    if (config.latitude != null && config.longitude != null) {
      const result = await createShippingCalculation({
        destinationLatitude: latitude,
        destinationLongitude: longitude,
        eligibleOrderValue: Number(body.eligibleOrderValue || 0),
      });
      return NextResponse.json({
        ...result.route,
        distanceKm: result.route.distanceMeters / 1000,
        roundedDistanceKm: result.calculation.roundedDistanceKm,
        shippingFee: result.calculation.finalShippingFee,
        currency: "VND",
        breakdown: result.calculation,
      });
    }
    return NextResponse.json(await calculateShippingQuote(latitude, longitude));
  } catch (error) {
    console.error(
      "Shipping quote unavailable",
      error instanceof Error ? error.message : "unknown error",
    );
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Không thể tính phí giao hàng.",
      },
      { status: 503 },
    );
  }
}
