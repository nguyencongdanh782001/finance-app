import test from "node:test";
import assert from "node:assert/strict";
import { planVariantRemovals } from "./variant-removal.ts";

test("removing a referenced variant deactivates it and preserves its identity", () => {
  assert.deepEqual(
    planVariantRemovals({
      existingIds: [1, 2, 3],
      incomingIds: [1],
      referencedIds: [2],
    }),
    { deleteIds: [3], deactivateIds: [2] },
  );
});

test("variants still present in the nested draft are never removed", () => {
  assert.deepEqual(
    planVariantRemovals({
      existingIds: [10, 11],
      incomingIds: [10, 11],
      referencedIds: [10],
    }),
    { deleteIds: [], deactivateIds: [] },
  );
});
