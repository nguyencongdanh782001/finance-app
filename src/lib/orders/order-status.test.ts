import assert from "node:assert/strict";
import test from "node:test";
import {
  CUSTOMER_ORDER_FILTER_STATUSES,
  CUSTOMER_ORDER_TIMELINE,
  ONLINE_STATUS_FLOW,
  ORDER_STATUS_CONFIG,
  getCustomerTimelineStep,
} from "./order-status.ts";

test("online order flow follows the customer tracking stages", () => {
  assert.deepEqual(ONLINE_STATUS_FLOW, {
    PENDING: "CONFIRMED",
    CONFIRMED: "PREPARING",
    PREPARING: "SHIPPING",
    READY_TO_SHIP: "SHIPPING",
    PROCESSING: "SHIPPING",
    SHIPPING: "DELIVERED",
    SHIPPED: "DELIVERED",
  });
});

test("customer status configuration uses the expected Vietnamese labels", () => {
  assert.equal(ORDER_STATUS_CONFIG.PENDING.label, "Đặt hàng thành công");
  assert.equal(ORDER_STATUS_CONFIG.CONFIRMED.label, "Đã xác nhận");
  assert.equal(ORDER_STATUS_CONFIG.PREPARING.label, "Đang chuẩn bị");
  assert.equal(ORDER_STATUS_CONFIG.SHIPPING.label, "Đang giao");
  assert.equal(ORDER_STATUS_CONFIG.DELIVERED.label, "Đã giao");
  assert.equal(ORDER_STATUS_CONFIG.CANCELLED.label, "Đã hủy");
});

test("legacy statuses map to the same customer timeline stage", () => {
  assert.equal(getCustomerTimelineStep("PROCESSING"), 2);
  assert.equal(getCustomerTimelineStep("SHIPPED"), 3);
  assert.equal(getCustomerTimelineStep("COMPLETED"), 4);
  assert.equal(getCustomerTimelineStep("CANCELLED"), null);
  assert.equal(CUSTOMER_ORDER_TIMELINE.length, 5);
});

test("customer filters group legacy statuses without inventing new states", () => {
  assert.deepEqual(CUSTOMER_ORDER_FILTER_STATUSES.SHIPPING, [
    "READY_TO_SHIP",
    "SHIPPING",
    "SHIPPED",
  ]);
  assert.deepEqual(CUSTOMER_ORDER_FILTER_STATUSES.DELIVERED, [
    "DELIVERED",
    "COMPLETED",
  ]);
});
