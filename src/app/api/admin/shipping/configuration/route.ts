/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { defaultShippingConfig } from "@/lib/shipping";

const adminOnly = (request: Request) =>
  ["ADMIN", "SUPER_ADMIN"].includes(request.headers.get("x-user-role") || "");
const number = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};
const serialize = (value: any) => ({
  ...value,
  latitude: value.latitude == null ? null : Number(value.latitude),
  longitude: value.longitude == null ? null : Number(value.longitude),
  maximumDeliveryDistanceKm:
    value.maximumDeliveryDistanceKm == null
      ? null
      : Number(value.maximumDeliveryDistanceKm),
  fallbackShippingFee:
    value.fallbackShippingFee == null ? 0 : Number(value.fallbackShippingFee),
});

export async function GET(request: Request) {
  if (!adminOnly(request))
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  const config = await prisma.shippingConfiguration.findUnique({
    where: { id: 1 },
  });
  return NextResponse.json(
    serialize(config || { id: 1, ...defaultShippingConfig }),
  );
}

export async function PUT(request: Request) {
  if (!adminOnly(request))
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  const body = await request.json().catch(() => ({}));
  const latitude =
    body.latitude === "" || body.latitude == null
      ? null
      : number(body.latitude, NaN);
  const longitude =
    body.longitude === "" || body.longitude == null
      ? null
      : number(body.longitude, NaN);
  if (latitude !== null && (latitude < -90 || latitude > 90))
    return NextResponse.json(
      { message: "Vĩ độ không hợp lệ." },
      { status: 422 },
    );
  if (longitude !== null && (longitude < -180 || longitude > 180))
    return NextResponse.json(
      { message: "Kinh độ không hợp lệ." },
      { status: 422 },
    );
  if (
    number(body.baseFee) < 0 ||
    number(body.pricePerKm) < 0 ||
    number(body.fallbackShippingFee) < 0 ||
    number(body.feeRoundingStep, 1000) <= 0 ||
    number(body.maximumDeliveryDistanceKm) <= 0
  ) {
    return NextResponse.json(
      { message: "Thông số phí vận chuyển không hợp lệ." },
      { status: 422 },
    );
  }
  const config = await prisma.shippingConfiguration.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      enabled: body.enabled !== false,
      shopName: String(body.shopName || "").trim() || null,
      formattedAddress: String(body.formattedAddress || "").trim() || null,
      streetAddress: String(body.streetAddress || "").trim() || null,
      ward: String(body.ward || "").trim() || null,
      district: String(body.district || "").trim() || null,
      province: String(body.province || "").trim() || null,
      latitude,
      longitude,
      placeId: String(body.placeId || "").trim() || null,
      baseFee: Math.round(number(body.baseFee)),
      pricePerKm: Math.round(number(body.pricePerKm)),
      maximumDeliveryDistanceKm: number(body.maximumDeliveryDistanceKm),
      distanceRoundingMode: body.distanceRoundingMode || "UP_TO_0_5_KM",
      feeRoundingStep: Math.round(number(body.feeRoundingStep, 1000)),
      minimumShippingFee:
        body.minimumShippingFee == null || body.minimumShippingFee === ""
          ? null
          : Math.round(number(body.minimumShippingFee)),
      maximumShippingFee:
        body.maximumShippingFee == null || body.maximumShippingFee === ""
          ? null
          : Math.round(number(body.maximumShippingFee)),
      fallbackShippingFee: Math.round(number(body.fallbackShippingFee)),
      updatedById: Number(request.headers.get("x-user-id")) || null,
    },
    update: {
      enabled: body.enabled !== false,
      shopName: String(body.shopName || "").trim() || null,
      formattedAddress: String(body.formattedAddress || "").trim() || null,
      streetAddress: String(body.streetAddress || "").trim() || null,
      ward: String(body.ward || "").trim() || null,
      district: String(body.district || "").trim() || null,
      province: String(body.province || "").trim() || null,
      latitude,
      longitude,
      placeId: String(body.placeId || "").trim() || null,
      baseFee: Math.round(number(body.baseFee)),
      pricePerKm: Math.round(number(body.pricePerKm)),
      maximumDeliveryDistanceKm: number(body.maximumDeliveryDistanceKm),
      distanceRoundingMode: body.distanceRoundingMode || "UP_TO_0_5_KM",
      feeRoundingStep: Math.round(number(body.feeRoundingStep, 1000)),
      minimumShippingFee:
        body.minimumShippingFee == null || body.minimumShippingFee === ""
          ? null
          : Math.round(number(body.minimumShippingFee)),
      maximumShippingFee:
        body.maximumShippingFee == null || body.maximumShippingFee === ""
          ? null
          : Math.round(number(body.maximumShippingFee)),
      fallbackShippingFee: Math.round(number(body.fallbackShippingFee)),
      updatedById: Number(request.headers.get("x-user-id")) || null,
    },
  });
  return NextResponse.json(serialize(config));
}
