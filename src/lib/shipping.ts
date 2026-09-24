import type { ShippingRoute } from "./geoapify.ts";
import { validateCoordinates } from "./geoapify.ts";

export type ShippingConfig = {
  enabled: boolean;
  shopName?: string | null;
  formattedAddress?: string | null;
  latitude: number | null;
  longitude: number | null;
  baseFee: number;
  pricePerKm: number;
  maximumDeliveryDistanceKm: number;
  distanceRoundingMode: "EXACT" | "UP_TO_0_5_KM" | "UP_TO_1_KM";
  feeRoundingStep: number;
  minimumShippingFee?: number | null;
  maximumShippingFee?: number | null;
  fallbackShippingFee: number;
};

export type ShippingPromotion = {
  id: number;
  name: string;
  minimumOrderValue: number;
  freeDistanceKm: number;
  maximumShippingDiscount?: number | null;
  priority: number;
  startsAt?: Date | null;
  endsAt?: Date | null;
  createdAt?: Date;
};

export const defaultShippingConfig: ShippingConfig = {
  enabled: true,
  latitude: null,
  longitude: null,
  baseFee: 10_000,
  pricePerKm: 5_000,
  maximumDeliveryDistanceKm: 30,
  distanceRoundingMode: "UP_TO_0_5_KM",
  feeRoundingStep: 1_000,
  minimumShippingFee: null,
  maximumShippingFee: null,
  fallbackShippingFee: 30_000,
};

export const roundDistance = (
  distanceKm: number,
  mode: ShippingConfig["distanceRoundingMode"],
) => {
  if (mode === "EXACT") return distanceKm;
  const step = mode === "UP_TO_0_5_KM" ? 0.5 : 1;
  return Math.ceil(distanceKm / step) * step;
};

const roundMoney = (value: number, step: number) => {
  const safeStep = Math.max(1, Math.round(step || 1));
  return Math.round(value / safeStep) * safeStep;
};

export const selectShippingPromotion = (
  promotions: ShippingPromotion[],
  eligibleOrderValue: number,
  now = new Date(),
) =>
  promotions
    .filter(
      (promotion) =>
        promotion.minimumOrderValue <= eligibleOrderValue &&
        (!promotion.startsAt || promotion.startsAt <= now) &&
        (!promotion.endsAt || promotion.endsAt >= now),
    )
    .sort(
      (a, b) =>
        b.freeDistanceKm - a.freeDistanceKm ||
        b.priority - a.priority ||
        b.minimumOrderValue - a.minimumOrderValue ||
        Number(b.createdAt || 0) - Number(a.createdAt || 0),
    )[0] || null;

export const calculateShippingFee = ({
  config,
  distanceMeters,
  eligibleOrderValue,
  promotions,
}: {
  config: ShippingConfig;
  distanceMeters: number;
  eligibleOrderValue: number;
  promotions: ShippingPromotion[];
}) => {
  if (!Number.isFinite(distanceMeters) || distanceMeters < 0) {
    throw new Error("Khoảng cách giao hàng không hợp lệ.");
  }
  const rawDistanceKm = distanceMeters / 1000;
  const roundedDistanceKm = roundDistance(
    rawDistanceKm,
    config.distanceRoundingMode,
  );
  if (roundedDistanceKm > config.maximumDeliveryDistanceKm) {
    throw new Error("Địa chỉ nằm ngoài khu vực giao hàng.");
  }
  const promotion = selectShippingPromotion(promotions, eligibleOrderValue);
  const freeDistanceKm = promotion?.freeDistanceKm || 0;
  const chargeableDistanceKm = Math.max(0, roundedDistanceKm - freeDistanceKm);
  const beforePromotion =
    chargeableDistanceKm === 0
      ? config.baseFee
      : config.baseFee + chargeableDistanceKm * config.pricePerKm;
  let shippingDiscount =
    promotion && promotion.maximumShippingDiscount
      ? Math.min(
          beforePromotion,
          Math.max(0, promotion.maximumShippingDiscount),
        )
      : promotion
        ? beforePromotion
        : 0;
  let finalShippingFee = Math.max(0, beforePromotion - shippingDiscount);
  if (!promotion && chargeableDistanceKm === 0)
    finalShippingFee = config.baseFee;
  if (finalShippingFee > 0 && config.minimumShippingFee != null) {
    finalShippingFee = Math.max(finalShippingFee, config.minimumShippingFee);
  }
  if (config.maximumShippingFee != null) {
    finalShippingFee = Math.min(finalShippingFee, config.maximumShippingFee);
  }
  finalShippingFee = roundMoney(finalShippingFee, config.feeRoundingStep);
  shippingDiscount = Math.max(0, beforePromotion - finalShippingFee);
  return {
    rawDistanceMeters: Math.round(distanceMeters),
    rawDistanceKm,
    roundedDistanceKm,
    freeDistanceKm,
    chargeableDistanceKm,
    baseFee: config.baseFee,
    pricePerKm: config.pricePerKm,
    distanceFee: Math.round(chargeableDistanceKm * config.pricePerKm),
    shippingFeeBeforePromotion: roundMoney(
      beforePromotion,
      config.feeRoundingStep,
    ),
    shippingDiscount,
    finalShippingFee,
    appliedPromotionId: promotion?.id || null,
    appliedPromotion: promotion,
  };
};

export async function getShippingConfiguration() {
  const { default: prisma } = await import("./db.ts");
  const row = await prisma.shippingConfiguration.findUnique({
    where: { id: 1 },
  });
  if (!row) return defaultShippingConfig;
  return {
    ...defaultShippingConfig,
    ...row,
    latitude: row.latitude == null ? null : Number(row.latitude),
    longitude: row.longitude == null ? null : Number(row.longitude),
    maximumDeliveryDistanceKm: Number(row.maximumDeliveryDistanceKm),
    baseFee: row.baseFee,
    pricePerKm: row.pricePerKm,
    feeRoundingStep: row.feeRoundingStep,
    minimumShippingFee: row.minimumShippingFee,
    maximumShippingFee: row.maximumShippingFee,
    fallbackShippingFee: row.fallbackShippingFee,
  } satisfies ShippingConfig;
}

export const createFallbackShippingCalculation = ({
  config,
  reason,
}: {
  config: ShippingConfig;
  reason?: string;
}) => {
  const fallbackFee = Math.max(0, Math.round(config.fallbackShippingFee));
  return {
    config,
    route: null,
    isFallback: true,
    fallbackReason: reason || "Không thể xác định khoảng cách giao hàng.",
    calculation: {
      rawDistanceMeters: null,
      rawDistanceKm: null,
      roundedDistanceKm: null,
      freeDistanceKm: 0,
      chargeableDistanceKm: null,
      baseFee: config.baseFee,
      pricePerKm: config.pricePerKm,
      distanceFee: 0,
      shippingFeeBeforePromotion: fallbackFee,
      shippingDiscount: 0,
      finalShippingFee: fallbackFee,
      appliedPromotionId: null,
      appliedPromotion: null,
    },
  };
};

export async function createShippingCalculationWithFallback({
  destinationLatitude,
  destinationLongitude,
  eligibleOrderValue,
}: {
  destinationLatitude: number | null;
  destinationLongitude: number | null;
  eligibleOrderValue: number;
}) {
  const config = await getShippingConfiguration();
  if (!config.enabled) throw new Error("Cấu hình vận chuyển đang tạm dừng.");
  try {
    if (
      !validateCoordinates(
        config.latitude == null ? Number.NaN : config.latitude,
        config.longitude == null ? Number.NaN : config.longitude,
      )
    ) {
      throw new Error("Cấu hình tọa độ cửa hàng chưa hoàn tất.");
    }
    if (
      !validateCoordinates(
        destinationLatitude == null ? Number.NaN : destinationLatitude,
        destinationLongitude == null ? Number.NaN : destinationLongitude,
      )
    ) {
      throw new Error("Tọa độ giao hàng không hợp lệ.");
    }
    const result = await createShippingCalculation({
      destinationLatitude: destinationLatitude as number,
      destinationLongitude: destinationLongitude as number,
      eligibleOrderValue,
    });
    return { ...result, isFallback: false as const, fallbackReason: null };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Địa chỉ nằm ngoài khu vực giao hàng."
    ) {
      throw error;
    }
    return createFallbackShippingCalculation({
      config,
      reason: error instanceof Error ? error.message : undefined,
    });
  }
}

export async function createShippingCalculation({
  destinationLatitude,
  destinationLongitude,
  eligibleOrderValue,
}: {
  destinationLatitude: number;
  destinationLongitude: number;
  eligibleOrderValue: number;
}) {
  const [{ default: prisma }, { getDrivingRoute }] = await Promise.all([
    import("./db.ts"),
    import("./geoapify.ts"),
  ]);
  const config = await getShippingConfiguration();
  if (!config.enabled) throw new Error("Cấu hình vận chuyển đang tạm dừng.");
  if (
    !validateCoordinates(
      config.latitude == null ? Number.NaN : config.latitude,
      config.longitude == null ? Number.NaN : config.longitude,
    )
  ) {
    throw new Error("Cấu hình tọa độ cửa hàng chưa hoàn tất.");
  }
  if (!validateCoordinates(destinationLatitude, destinationLongitude)) {
    throw new Error("Tọa độ giao hàng không hợp lệ.");
  }
  const route: ShippingRoute = await getDrivingRoute(
    config.latitude as number,
    config.longitude as number,
    destinationLatitude,
    destinationLongitude,
  );
  const promotions = await prisma.shippingPromotion.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });
  return {
    config,
    route,
    calculation: calculateShippingFee({
      config,
      distanceMeters: route.distanceMeters,
      eligibleOrderValue,
      promotions: promotions.map((promotion) => ({
        ...promotion,
        freeDistanceKm: Number(promotion.freeDistanceKm),
        maximumShippingDiscount: promotion.maximumShippingDiscount,
      })),
    }),
  };
}
