import assert from "node:assert/strict";
import test from "node:test";
import type { ProductApiItem } from "../../interface/product.ts";
import {
  findShopOrderLineOption,
  getDefaultShopOrderVariant,
  mapShopOrderProducts,
} from "./shop-order-products.ts";

const product = (overrides: Partial<ProductApiItem> = {}): ProductApiItem => ({
  id: 10,
  title: "Áo thun",
  imageUrl: "https://example.com/general-legacy.jpg",
  imagePublicId: "general",
  categoryId: 1,
  category: { id: 1, name: "Áo", color: "pink", icon: "shirt" },
  importPrice: 100000,
  sellPrice: 200000,
  quantity: 7,
  productStatus: "PRIVATE",
  images: [
    {
      id: 1,
      url: "https://example.com/general.jpg",
      position: 0,
      isPrimary: true,
    },
  ],
  variants: [],
  ...overrides,
});

test("groups active variants by color and sorts sizes naturally", () => {
  const [mapped] = mapShopOrderProducts([
    product({
      variants: [
        {
          id: 2,
          sku: "BLACK-10",
          size: "10",
          color: "Đen",
          colorCode: "#000000",
          sellPrice: 240000,
          importPrice: 110000,
          quantity: 3,
          isActive: true,
          images: [],
        },
        {
          id: 1,
          sku: "BLACK-2",
          size: "2",
          color: "Đen",
          colorCode: "#000000",
          sellPrice: 220000,
          importPrice: 105000,
          quantity: 0,
          isActive: true,
          images: [
            {
              id: 4,
              url: "https://example.com/black-2.jpg",
              position: 0,
              isPrimary: true,
            },
          ],
        },
        {
          id: 3,
          sku: "HIDDEN",
          size: "S",
          color: "Trắng",
          sellPrice: 200000,
          importPrice: 100000,
          quantity: 9,
          isActive: false,
        },
      ],
    }),
  ]);

  assert.equal(mapped.colors.length, 1);
  assert.deepEqual(
    mapped.colors[0].variants.map((variant) => variant.size),
    ["2", "10"],
  );
  assert.equal(
    mapped.colors[0].variants[0].imageUrl,
    "https://example.com/black-2.jpg",
  );
  assert.equal(
    mapped.colors[0].variants[1].imageUrl,
    "https://example.com/general.jpg",
  );
  assert.equal(getDefaultShopOrderVariant(mapped)?.variantId, 2);
});

test("resolves exact variant id and preserves price, cost and SKU", () => {
  const mapped = mapShopOrderProducts([
    product({
      variants: [
        {
          id: 21,
          sku: "RED-M",
          barcode: "8938505974198",
          size: "M",
          color: "Đỏ",
          sellPrice: 275000,
          importPrice: 125000,
          quantity: 4,
          isActive: true,
        },
      ],
    }),
  ]);
  const selected = findShopOrderLineOption(mapped, 10, 21);

  assert.equal(selected?.sku, "RED-M");
  assert.equal(selected?.barcode, "8938505974198");
  assert.equal(selected?.originalUnitPrice, 275000);
  assert.equal(selected?.unitCost, 125000);
  assert.equal(selected?.availableStock, 4);
  assert.match(mapped[0].searchableText, /8938505974198/);
  assert.match(mapped[0].searchableText, /ao thun/);
});

test("keeps products without variants as a base order option", () => {
  const [mapped] = mapShopOrderProducts([product()]);

  assert.equal(mapped.baseOption?.variantId, null);
  assert.equal(mapped.baseOption?.availableStock, 7);
  assert.equal(mapped.baseOption?.imageUrl, "https://example.com/general.jpg");
  assert.equal(mapped.productStatus, "PRIVATE");
});

test("excludes discontinued products", () => {
  assert.deepEqual(
    mapShopOrderProducts([product({ productStatus: "DISCONTINUED" })]),
    [],
  );
});

test("does not turn a product with only inactive variants into a base product", () => {
  const [mapped] = mapShopOrderProducts([
    product({
      variants: [
        {
          id: 30,
          sku: "INACTIVE-S",
          size: "S",
          color: "Đen",
          sellPrice: 200000,
          importPrice: 100000,
          quantity: 5,
          isActive: false,
        },
      ],
    }),
  ]);

  assert.equal(mapped.baseOption, null);
  assert.deepEqual(mapped.colors, []);
  assert.equal(mapped.totalAvailableStock, 0);
});
