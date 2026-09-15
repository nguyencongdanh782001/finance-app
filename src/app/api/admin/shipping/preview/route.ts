import { NextResponse } from "next/server";
import { calculateShippingFee, defaultShippingConfig } from "@/lib/shipping";

export async function POST(request: Request) {
  if (
    !["ADMIN", "SUPER_ADMIN"].includes(request.headers.get("x-user-role") || "")
  ) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  const body = await request.json().catch(() => ({}));
  const config = {
    ...defaultShippingConfig,
    ...body.config,
    baseFee: Number(body.config?.baseFee ?? defaultShippingConfig.baseFee),
    pricePerKm: Number(
      body.config?.pricePerKm ?? defaultShippingConfig.pricePerKm,
    ),
    maximumDeliveryDistanceKm: Number(
      body.config?.maximumDeliveryDistanceKm ??
        defaultShippingConfig.maximumDeliveryDistanceKm,
    ),
    feeRoundingStep: Number(
      body.config?.feeRoundingStep ?? defaultShippingConfig.feeRoundingStep,
    ),
  };
  const distanceMeters = Number(body.distanceMeters);
  const eligibleOrderValue = Number(body.eligibleOrderValue || 0);
  if (
    !Number.isFinite(distanceMeters) ||
    distanceMeters < 0 ||
    !Number.isFinite(eligibleOrderValue) ||
    eligibleOrderValue < 0
  ) {
    return NextResponse.json(
      { message: "Khoảng cách hoặc giá trị đơn hàng không hợp lệ." },
      { status: 422 },
    );
  }
  try {
    return NextResponse.json(
      calculateShippingFee({
        config,
        distanceMeters,
        eligibleOrderValue,
        promotions: body.promotions || [],
      }),
    );
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Không thể tính phí vận chuyển.",
      },
      { status: 422 },
    );
  }
}
