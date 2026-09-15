const GEOAPIFY_BASE_URL = "https://api.geoapify.com/v1";

export const SHOP_LOCATION = {
  latitude: Number(process.env.SHOP_LATITUDE || 11.275790867301161),
  longitude: Number(process.env.SHOP_LONGITUDE || 106.5892647696457),
};

export const SHIPPING_CONFIG = {
  baseDistanceKm: 3,
  baseFee: 15_000,
  additionalFeePerKm: 5_000,
  maximumDeliveryDistanceKm: 50,
  currency: "VND" as const,
};

type GeoapifyFeature = {
  properties?: Record<string, unknown>;
  geometry?: { coordinates?: unknown };
};

const timeoutSignal = (milliseconds: number) =>
  AbortSignal.timeout(milliseconds);

const apiKey = () => {
  const value = process.env.GEOAPIFY_API_KEY?.trim();
  if (!value) throw new Error("Geoapify chưa được cấu hình.");
  return value;
};

const numberProperty = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

export type AddressSuggestion = {
  id: string;
  formattedAddress: string;
  addressLine1?: string;
  addressLine2?: string;
  houseNumber?: string;
  street?: string;
  ward?: string;
  district?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
  countryCode?: string;
  latitude: number;
  longitude: number;
};

export async function autocompleteAddress(text: string) {
  const url = new URL(`${GEOAPIFY_BASE_URL}/geocode/autocomplete`);
  url.searchParams.set("text", text);
  url.searchParams.set("filter", "countrycode:vn");
  url.searchParams.set(
    "bias",
    `proximity:${SHOP_LOCATION.longitude},${SHOP_LOCATION.latitude}`,
  );
  url.searchParams.set("limit", "6");
  url.searchParams.set("apiKey", apiKey());

  const response = await fetch(url, {
    signal: timeoutSignal(5_000),
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Geoapify autocomplete failed (${response.status}).`);
  }
  const body = (await response.json()) as { features?: GeoapifyFeature[] };
  return (body.features || []).flatMap((feature, index) => {
    const p = feature.properties || {};
    const latitude = numberProperty(p.lat);
    const longitude = numberProperty(p.lon);
    const formattedAddress = typeof p.formatted === "string" ? p.formatted : "";
    if (latitude === null || longitude === null || !formattedAddress) return [];
    return [
      {
        id: String(p.place_id || `${latitude}:${longitude}:${index}`),
        formattedAddress,
        addressLine1:
          typeof p.address_line1 === "string" ? p.address_line1 : undefined,
        addressLine2:
          typeof p.address_line2 === "string" ? p.address_line2 : undefined,
        houseNumber:
          typeof p.housenumber === "string" ? p.housenumber : undefined,
        street: typeof p.street === "string" ? p.street : undefined,
        ward: typeof p.suburb === "string" ? p.suburb : undefined,
        district: typeof p.district === "string" ? p.district : undefined,
        city: typeof p.city === "string" ? p.city : undefined,
        state: typeof p.state === "string" ? p.state : undefined,
        postcode: typeof p.postcode === "string" ? p.postcode : undefined,
        country: typeof p.country === "string" ? p.country : undefined,
        countryCode:
          typeof p.country_code === "string" ? p.country_code : undefined,
        latitude,
        longitude,
      } satisfies AddressSuggestion,
    ];
  });
}

export type ShippingQuote = {
  distanceMeters: number;
  distanceKm: number;
  roundedDistanceKm: number;
  estimatedDurationSeconds: number;
  estimatedDurationMinutes: number;
  shippingFee: number;
  currency: "VND";
};
export type ShippingRoute = {
  distanceMeters: number;
  estimatedDurationSeconds: number;
  estimatedDurationMinutes: number;
};

export function validateCoordinates(latitude: number, longitude: number) {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

export function calculateShippingFee(distanceKm: number) {
  if (distanceKm > SHIPPING_CONFIG.maximumDeliveryDistanceKm) {
    throw new Error("Địa chỉ nằm ngoài phạm vi giao hàng.");
  }
  if (distanceKm <= SHIPPING_CONFIG.baseDistanceKm)
    return SHIPPING_CONFIG.baseFee;
  return (
    SHIPPING_CONFIG.baseFee +
    Math.ceil(distanceKm - SHIPPING_CONFIG.baseDistanceKm) *
      SHIPPING_CONFIG.additionalFeePerKm
  );
}

export async function calculateShippingQuote(
  latitude: number,
  longitude: number,
): Promise<ShippingQuote> {
  if (!validateCoordinates(latitude, longitude))
    throw new Error("Tọa độ giao hàng không hợp lệ.");
  const route = await getDrivingRoute(
    SHOP_LOCATION.latitude,
    SHOP_LOCATION.longitude,
    latitude,
    longitude,
  );
  const distanceKm = route.distanceMeters / 1_000;
  return {
    distanceMeters: route.distanceMeters,
    distanceKm,
    roundedDistanceKm: Math.ceil(distanceKm * 10) / 10,
    estimatedDurationSeconds: route.estimatedDurationSeconds,
    estimatedDurationMinutes: route.estimatedDurationMinutes,
    shippingFee: calculateShippingFee(distanceKm),
    currency: "VND",
  };
}

export async function getDrivingRoute(
  originLatitude: number,
  originLongitude: number,
  destinationLatitude: number,
  destinationLongitude: number,
): Promise<ShippingRoute> {
  if (
    !validateCoordinates(originLatitude, originLongitude) ||
    !validateCoordinates(destinationLatitude, destinationLongitude)
  ) {
    throw new Error("Tọa độ giao hàng không hợp lệ.");
  }
  const url = new URL(`${GEOAPIFY_BASE_URL}/routing`);
  url.searchParams.set(
    "waypoints",
    `${originLatitude},${originLongitude}|${destinationLatitude},${destinationLongitude}`,
  );
  url.searchParams.set("mode", "drive");
  url.searchParams.set("apiKey", apiKey());

  const response = await fetch(url, {
    signal: timeoutSignal(8_000),
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!response.ok)
    throw new Error(`Geoapify routing failed (${response.status}).`);
  const body = (await response.json()) as {
    features?: Array<{ properties?: { distance?: unknown; time?: unknown } }>;
  };
  const properties = body.features?.[0]?.properties;
  const distanceMeters = numberProperty(properties?.distance);
  const estimatedDurationSeconds = numberProperty(properties?.time);
  if (
    distanceMeters === null ||
    estimatedDurationSeconds === null ||
    distanceMeters < 0
  ) {
    throw new Error("Không tìm được tuyến đường đến địa chỉ này.");
  }
  return {
    distanceMeters: Math.round(distanceMeters),
    estimatedDurationSeconds: Math.round(estimatedDurationSeconds),
    estimatedDurationMinutes: Math.ceil(estimatedDurationSeconds / 60),
  };
}
