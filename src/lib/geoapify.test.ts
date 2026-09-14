import assert from "node:assert/strict";
import test from "node:test";
import { calculateShippingFee, validateCoordinates } from "./geoapify.ts";

test("shipping fee uses configured distance boundaries", () => {
  assert.equal(calculateShippingFee(3), 15000);
  assert.equal(calculateShippingFee(3.01), 20000);
  assert.equal(calculateShippingFee(5), 25000);
  assert.throws(() => calculateShippingFee(50.01));
});

test("coordinates are validated by latitude and longitude ranges", () => {
  assert.equal(validateCoordinates(11.2, 106.5), true);
  assert.equal(validateCoordinates(91, 106.5), false);
  assert.equal(validateCoordinates(11.2, 181), false);
});
