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
        name: "10%",
        minimumOrderValue: 300000,
        discountPercent: 10,
        priority: 10,
      },
      {
        id: 2,
        name: "20%",
        minimumOrderValue: 500000,
        discountPercent: 20,
        priority: 0,
      },
    ],
    700000,
  );
  assert.equal(selected?.id, 2);
});

test("selects the promotion with the highest actual discount after its cap", () => {
  const selected = selectShippingPromotion(
    [
      {
        id: 1,
        name: "50% capped",
        minimumOrderValue: 300000,
        discountPercent: 50,
        maximumShippingDiscount: 10000,
        priority: 10,
      },
      {
        id: 2,
        name: "20% uncapped",
        minimumOrderValue: 300000,
        discountPercent: 20,
        priority: 0,
      },
    ],
    700000,
    new Date(),
    100000,
  );
  assert.equal(selected?.id, 2);
});

test("a 100% promotion makes the shipping fee zero", () => {
  const result = calculateShippingFee({
    config: { ...defaultShippingConfig, baseFee: 10000, pricePerKm: 5000 },
    distanceMeters: 4800,
    eligibleOrderValue: 500000,
    promotions: [
      {
        id: 1,
        name: "Free shipping",
        minimumOrderValue: 500000,
        discountPercent: 100,
        priority: 0,
      },
    ],
  });
  assert.equal(result.finalShippingFee, 0);
  assert.equal(result.chargeableDistanceKm, 5);
});

test("shipping fee applies the percentage and respects a discount cap", () => {
  const result = calculateShippingFee({
    config: { ...defaultShippingConfig, baseFee: 10000, pricePerKm: 5000 },
    distanceMeters: 8000,
    eligibleOrderValue: 500000,
    promotions: [
      {
        id: 1,
        name: "Cap",
        minimumOrderValue: 500000,
        discountPercent: 50,
        maximumShippingDiscount: 10000,
        priority: 0,
      },
    ],
  });
  assert.equal(result.shippingFeeBeforePromotion, 50000);
  assert.equal(result.shippingDiscount, 10000);
  assert.equal(result.finalShippingFee, 40000);
  assert.ok(result.finalShippingFee >= 0);
});
