import assert from "node:assert/strict";
import test from "node:test";

import type { SoldProductListItem } from "./daily-sold-products.ts";
import { calculateNetOrderItemAmount } from "./order-item-revenue.ts";
import {
  filterSoldProductGroups,
  groupSoldProducts,
  paginateSoldProductGroups,
} from "./group-sold-products.ts";
import { isSoldOrderEligible } from "./sold-order-eligibility.ts";
import { updateExpandedGroupKeys } from "../../components/DailyDetail/sold-product-expanded-state.ts";

const createSale = (
  overrides: Partial<SoldProductListItem> = {},
): SoldProductListItem => ({
  id: "order-item-1",
  recordType: "ORDER_ITEM",
  date: "2026-08-27T03:30:00.000Z",
  productId: 10,
  productVariantId: 101,
  productName: "Áo thun nam nữ",
  variantName: "Đen / XL",
  sku: "AT-DEN-XL",
  imageUrl: null,
  categoryName: "Áo thun",
  quantity: 1,
  unitPrice: 50_000,
  unitCost: 30_000,
  totalAmount: 50_000,
  totalCost: 30_000,
  profit: 20_000,
  orderId: 1,
  orderCode: "ORD-001",
  orderSource: "OFFLINE",
  readOnly: true,
  createdAt: "2026-08-27T03:30:00.000Z",
  ...overrides,
});

test("groups variants and prices by parent product without merging sale rows", () => {
  const groups = groupSoldProducts([
    createSale(),
    createSale({
      id: "order-item-2",
      productVariantId: 102,
      variantName: "Trắng / M",
      quantity: 2,
      unitPrice: 55_000,
      totalAmount: 110_000,
      totalCost: 60_000,
      profit: 50_000,
      orderId: 2,
      orderCode: "ORD-002",
      orderSource: "ONLINE",
    }),
    createSale({
      id: "legacy-1-0",
      recordType: "LEGACY_MANUAL",
      productVariantId: null,
      variantName: null,
      quantity: 1,
      unitPrice: 60_000,
      totalAmount: 60_000,
      totalCost: 30_000,
      profit: 30_000,
      orderId: null,
      orderCode: null,
      orderSource: null,
    }),
  ]);

  assert.equal(groups.length, 3);
  assert.equal(groups[0].groupKey, "product:10:OFFLINE");
  assert.equal(groups[0].totalQuantity, 1);
  assert.equal(groups[0].totalAmount, 50_000);
  assert.equal(groups[0].totalCost, 30_000);
  assert.equal(groups[0].totalProfit, 20_000);
  assert.equal(groups[1].groupKey, "product:10:ONLINE");
  assert.equal(groups[1].totalQuantity, 2);
  assert.equal(groups[1].totalAmount, 110_000);
  assert.equal(groups[1].totalCost, 60_000);
  assert.equal(groups[1].totalProfit, 50_000);
  assert.equal(groups[2].groupKey, "product:10:LEGACY_MANUAL");
  assert.equal(groups[2].totalQuantity, 1);
  assert.equal(groups[2].totalAmount, 60_000);
  assert.equal(groups[2].totalCost, 30_000);
  assert.equal(groups[2].totalProfit, 30_000);
  assert.equal(groups[0].minUnitPrice, 50_000);
  assert.equal(groups[0].maxUnitPrice, 50_000);
});

test("keeps different products separate", () => {
  const groups = groupSoldProducts([
    createSale(),
    createSale({ id: "order-item-2", productId: 11, productName: "Quần jean" }),
  ]);

  assert.deepEqual(
    groups.map((group) => group.groupKey),
    ["product:10:OFFLINE", "product:11:OFFLINE"],
  );
});

test("uses normalized legacy fallback and isolates unlinked order snapshots", () => {
  const groups = groupSoldProducts([
    createSale({
      id: "legacy-1-0",
      recordType: "LEGACY_MANUAL",
      productId: null,
      productName: "  Áo   Thun  ",
      orderId: null,
      orderCode: null,
      orderSource: null,
    }),
    createSale({
      id: "legacy-2-0",
      recordType: "LEGACY_MANUAL",
      productId: null,
      productName: "ao thun",
      orderId: null,
      orderCode: null,
      orderSource: null,
    }),
    createSale({ id: "order-item-unlinked", productId: null }),
  ]);

  assert.equal(groups.length, 2);
  assert.equal(groups[0].groupKey, "legacy:ao thun");
  assert.equal(groups[0].saleCount, 2);
  assert.equal(groups[1].groupKey, "unlinked:order-item-unlinked");
});

test("source filter recalculates group totals and search keeps complete group", () => {
  const items = [
    createSale(),
    createSale({
      id: "order-item-2",
      variantName: "Trắng / M",
      sku: "AT-TRANG-M",
      quantity: 2,
      unitPrice: 55_000,
      totalAmount: 110_000,
      orderSource: "ONLINE",
      orderCode: "ORD-002",
    }),
  ];

  const onlineGroups = filterSoldProductGroups(items, { source: "ONLINE" });
  assert.equal(onlineGroups[0].totalQuantity, 2);
  assert.equal(onlineGroups[0].totalAmount, 110_000);

  const searchedGroups = filterSoldProductGroups(items, {
    search: "AT-TRANG-M",
  });
  assert.equal(searchedGroups.length, 1);
  assert.equal(searchedGroups[0].sales.length, 1);
  assert.equal(searchedGroups[0].totalAmount, 110_000);
});

test("applies sold-order eligibility rules", () => {
  assert.equal(
    isSoldOrderEligible({ source: "OFFLINE", status: "PENDING" }),
    true,
  );
  assert.equal(
    isSoldOrderEligible({ source: "OFFLINE", status: "CANCELLED" }),
    false,
  );
  assert.equal(
    isSoldOrderEligible({
      source: "ONLINE",
      status: "PENDING",
      paymentStatus: "UNPAID",
    }),
    false,
  );
  assert.equal(
    isSoldOrderEligible({
      source: "ONLINE",
      status: "CONFIRMED",
      paymentStatus: "PAID",
    }),
    false,
  );
  assert.equal(
    isSoldOrderEligible({
      source: "ONLINE",
      status: "DELIVERED",
      paymentStatus: "PAID",
    }),
    true,
  );
  assert.equal(
    isSoldOrderEligible({
      source: "ONLINE",
      status: "COMPLETED",
      paymentStatus: "PAID",
    }),
    true,
  );
  assert.equal(
    isSoldOrderEligible({
      source: "ONLINE",
      status: "DELIVERED",
      paymentStatus: "REFUNDED",
    }),
    false,
  );
});

test("paginates complete product groups instead of individual sales", () => {
  const groups = groupSoldProducts([
    createSale(),
    createSale({ id: "order-item-2", orderId: 2, orderCode: "ORD-002" }),
    createSale({ id: "order-item-3", productId: 11, productName: "Quần jean" }),
  ]);
  const firstPage = paginateSoldProductGroups(groups, 1, 1);

  assert.equal(firstPage.items.length, 1);
  assert.equal(firstPage.items[0].sales.length, 2);
  assert.equal(firstPage.pagination.totalGroups, 2);
  assert.equal(firstPage.pagination.totalPages, 2);
});

test("supports multiple expanded groups with stable keys", () => {
  let expanded = new Set<string>();

  expanded = updateExpandedGroupKeys(expanded, "product:10:OFFLINE", true);
  expanded = updateExpandedGroupKeys(expanded, "product:11:ONLINE", true);
  assert.deepEqual([...expanded], ["product:10:OFFLINE", "product:11:ONLINE"]);

  expanded = updateExpandedGroupKeys(expanded, "product:10:OFFLINE", false);
  assert.deepEqual([...expanded], ["product:11:ONLINE"]);
});

test("allocates order-level discount into product revenue", () => {
  assert.equal(
    calculateNetOrderItemAmount({
      lineSubtotal: 150_000,
      orderSubtotal: 300_000,
      discountAmount: 60_000,
    }),
    120_000,
  );
  assert.equal(
    calculateNetOrderItemAmount({
      lineSubtotal: 150_000,
      orderSubtotal: 300_000,
      discountAmount: 0,
    }),
    150_000,
  );
});
