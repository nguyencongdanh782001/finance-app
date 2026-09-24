import assert from "node:assert/strict";
import test from "node:test";
import {
  ADMIN_CANCELLABLE_ONLINE_STATUSES,
  CUSTOMER_ORDER_FILTER_STATUSES,
  CUSTOMER_ORDER_TIMELINE,
  ONLINE_STATUS_FLOW,
  ORDER_STATUS_CONFIG,
  canAdminCancelOnlineOrder,
  canManuallyMarkOrderPaid,
  getCustomerTimelineStep,
  isValidOnlineStatusTransition,
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

test("admin cancellation is limited to stages before shipping", () => {
  assert.deepEqual(ADMIN_CANCELLABLE_ONLINE_STATUSES, [
    "PENDING",
    "CONFIRMED",
    "PREPARING",
    "PROCESSING",
  ]);
  assert.equal(canAdminCancelOnlineOrder("PENDING"), true);
  assert.equal(canAdminCancelOnlineOrder("PREPARING"), true);
  assert.equal(canAdminCancelOnlineOrder("SHIPPING"), false);
  assert.equal(canAdminCancelOnlineOrder("DELIVERED"), false);
  assert.equal(canAdminCancelOnlineOrder("CANCELLED"), false);
});

test("online transitions accept only the configured next stage", () => {
  assert.equal(isValidOnlineStatusTransition("PENDING", "CONFIRMED"), true);
  assert.equal(isValidOnlineStatusTransition("PENDING", "PREPARING"), false);
  assert.equal(isValidOnlineStatusTransition("DELIVERED", "SHIPPING"), false);
  assert.equal(isValidOnlineStatusTransition("CANCELLED", "SHIPPING"), false);
});

test("manual paid action is available only for active unpaid orders", () => {
  assert.equal(canManuallyMarkOrderPaid("PENDING", "UNPAID"), true);
  assert.equal(canManuallyMarkOrderPaid("DELIVERED", "PENDING"), true);
  assert.equal(canManuallyMarkOrderPaid("PENDING", "PAID"), false);
  assert.equal(canManuallyMarkOrderPaid("CANCELLED", "UNPAID"), false);
  assert.equal(canManuallyMarkOrderPaid("DELIVERED", "REFUNDED"), false);
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
