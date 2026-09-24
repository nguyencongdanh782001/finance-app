import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateShippingFee,
  createFallbackShippingCalculation,
  defaultShippingConfig,
  roundDistance,
  selectShippingPromotion,
} from "./shipping.ts";

test("uses the configured fallback fee when distance is unavailable", () => {
  const result = createFallbackShippingCalculation({
    config: { ...defaultShippingConfig, fallbackShippingFee: 42000 },
    reason: "Geoapify timeout",
  });
  assert.equal(result.calculation.finalShippingFee, 42000);
  assert.equal(result.isFallback, true);
  assert.equal(result.fallbackReason, "Geoapify timeout");
  assert.equal(result.route, null);
});

test("rounds shipping distance upward by the configured step", () => {
  assert.equal(roundDistance(7.1, "UP_TO_0_5_KM"), 7.5);
  assert.equal(roundDistance(7.1, "UP_TO_1_KM"), 8);
  assert.equal(roundDistance(7.1, "EXACT"), 7.1);
});

test("selects the promotion with the highest customer benefit", () => {
  const selected = selectShippingPromotion(
    [
      {
        id: 1,
        name: "3km",
        minimumOrderValue: 300000,
        freeDistanceKm: 3,
        priority: 10,
      },
      {
        id: 2,
        name: "5km",
        minimumOrderValue: 500000,
        freeDistanceKm: 5,
        priority: 0,
      },
    ],
    700000,
  );
  assert.equal(selected?.id, 2);
});

test("a fully covered route has a zero shipping fee", () => {
  const result = calculateShippingFee({
    config: { ...defaultShippingConfig, baseFee: 10000, pricePerKm: 5000 },
    distanceMeters: 4800,
    eligibleOrderValue: 500000,
    promotions: [
      {
        id: 1,
        name: "Free 5km",
        minimumOrderValue: 500000,
        freeDistanceKm: 5,
        priority: 0,
      },
    ],
  });
  assert.equal(result.finalShippingFee, 0);
  assert.equal(result.chargeableDistanceKm, 0);
});

test("shipping fee is never negative and respects a discount cap", () => {
  const result = calculateShippingFee({
    config: { ...defaultShippingConfig, baseFee: 10000, pricePerKm: 5000 },
    distanceMeters: 8000,
    eligibleOrderValue: 500000,
    promotions: [
      {
        id: 1,
        name: "Cap",
        minimumOrderValue: 500000,
        freeDistanceKm: 5,
        maximumShippingDiscount: 10000,
        priority: 0,
      },
    ],
  });
  assert.equal(result.finalShippingFee, 15000);
  assert.ok(result.finalShippingFee >= 0);
});
