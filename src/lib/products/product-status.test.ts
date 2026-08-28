import test from "node:test";
import assert from "node:assert/strict";
import {
  canAddToCustomerCart,
  canAddToOfflineOrder,
  getTotalAvailableStock,
  isVisibleOnStorefront,
  mapLegacyProductStatus,
  normalizeProductStatus,
} from "./product-status.ts";

test("new and unknown product statuses default to PRIVATE", () => {
  assert.equal(normalizeProductStatus(undefined), "PRIVATE");
  assert.equal(normalizeProductStatus("DRAFT"), "PRIVATE");
});

test("storefront, cart and offline-order rules use the official status", () => {
  assert.equal(isVisibleOnStorefront("PUBLIC"), true);
  assert.equal(isVisibleOnStorefront("PRIVATE"), false);
  assert.equal(isVisibleOnStorefront("DISCONTINUED"), false);
  assert.equal(canAddToCustomerCart("PUBLIC"), true);
  assert.equal(canAddToCustomerCart("PRIVATE"), false);
  assert.equal(canAddToCustomerCart("DISCONTINUED"), false);
  assert.equal(canAddToOfflineOrder("PRIVATE"), true);
  assert.equal(canAddToOfflineOrder("DISCONTINUED"), false);
});

test("out of stock is derived and does not mutate PUBLIC status", () => {
  const status = normalizeProductStatus("PUBLIC");
  assert.equal(
    getTotalAvailableStock({
      quantity: 99,
      variants: [
        { quantity: 2, reservedQuantity: 2, isActive: true },
        { quantity: 10, reservedQuantity: 0, isActive: false },
      ],
    }),
    0,
  );
  assert.equal(status, "PUBLIC");
});

test("legacy statuses preserve previous visibility intent", () => {
  assert.equal(mapLegacyProductStatus("ACTIVE", "PUBLIC"), "PUBLIC");
  assert.equal(mapLegacyProductStatus("ACTIVE", "HIDDEN"), "PRIVATE");
  assert.equal(mapLegacyProductStatus("DRAFT", "PUBLIC"), "PRIVATE");
  assert.equal(mapLegacyProductStatus("ARCHIVED", "PUBLIC"), "DISCONTINUED");
  assert.equal(mapLegacyProductStatus("OUT_OF_STOCK", "PUBLIC"), "PUBLIC");
  assert.equal(mapLegacyProductStatus("OUT_OF_STOCK", "PRIVATE"), "PRIVATE");
});
