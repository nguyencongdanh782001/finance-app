import test from "node:test";
import assert from "node:assert/strict";
import type {
  ProductColorGroupFormValue,
  ProductImageDraftValue,
  ProductVariantFormValue,
} from "../../interface/product.ts";
import {
  SIZE_PRESETS,
  addSizesToColorGroup,
  applySizesToColorGroups,
  compareNaturalSizes,
  flattenColorGroups,
  generateVariantSku,
  groupVariantsByColor,
  resolveSizeCost,
  resolveSizeImages,
  resolveSizePrice,
  summarizeVariantsByColor,
} from "./variant-groups.ts";

const image = (url: string): ProductImageDraftValue => ({
  clientId: url,
  url,
  publicId: url,
  position: 0,
  isPrimary: true,
});

const flatVariant = (
  id: number,
  color: string,
  size: string,
  overrides: Partial<ProductVariantFormValue> = {},
): ProductVariantFormValue => ({
  id,
  clientId: `variant-${id}`,
  color,
  size,
  sku: `SKU-${id}`,
  price: "150000",
  importPrice: "80000",
  quantity: "10",
  isActive: true,
  images: [],
  ...overrides,
});

const colorGroup = (): ProductColorGroupFormValue => ({
  clientId: "black",
  colorName: "Black",
  colorCode: "#000000",
  defaultPrice: "150000",
  defaultCost: "80000",
  sharedImages: [],
  sizes: [],
});

test("groups Black/S, Black/M and Black/L while preserving IDs", () => {
  const groups = groupVariantsByColor([
    flatVariant(1, "Black", "S"),
    flatVariant(2, " black ", "M"),
    flatVariant(3, "BLACK", "L"),
    flatVariant(4, "White", "S"),
  ]);
  assert.equal(groups.length, 2);
  assert.deepEqual(groups[0].sizes.map((size) => size.id), [1, 2, 3]);
  assert.deepEqual(groups[1].sizes.map((size) => size.id), [4]);
});

test("flatten restores every independent color-size variant", () => {
  const original = [
    flatVariant(1, "Black", "S"),
    flatVariant(2, "Black", "M", { price: "155000" }),
  ];
  const flattened = flattenColorGroups(groupVariantsByColor(original), {
    productPrice: "140000",
    productCost: "70000",
  });
  assert.deepEqual(
    flattened.map(({ id, color, size, sku, price }) => ({ id, color, size, sku, price })),
    original.map(({ id, color, size, sku, price }) => ({ id, color, size, sku, price })),
  );
});

test("stored color code survives flat-grouped-flat editing", () => {
  const original = flatVariant(1, "Hồng pastel", "M", {
    colorCode: "#f5b6c8",
  });
  const groups = groupVariantsByColor([original]);
  assert.equal(groups[0].colorCode, "#f5b6c8");
  assert.equal(
    flattenColorGroups(groups, {
      productPrice: "140000",
      productCost: "70000",
    })[0].colorCode,
    "#f5b6c8",
  );
});

test("adds multiple/custom sizes and prevents duplicates", () => {
  const first = addSizesToColorGroup(colorGroup(), ["S", "M", "L", " M "]);
  assert.equal(first.added, 3);
  const second = addSizesToColorGroup(first.group, ["m", "Freesize", "30ml"]);
  assert.equal(second.added, 2);
  assert.equal(second.group.sizes.filter((size) => size.sizeName.toLowerCase() === "m").length, 1);
});

test("size presets and applying sizes across colors preserve existing data", () => {
  const black = addSizesToColorGroup(colorGroup(), ["S"]).group;
  black.sizes[0].sku = "MANUAL-S";
  const white = { ...colorGroup(), clientId: "white", colorName: "White" };
  const result = applySizesToColorGroups(
    [black, white],
    ["black", "white"],
    [...SIZE_PRESETS["Thời trang"]],
  );
  assert.equal(result.added, 11);
  assert.equal(result.groups[0].sizes.find((size) => size.sizeName === "S")?.sku, "MANUAL-S");
});

test("natural size ordering handles clothing, numbers and volume", () => {
  assert.ok(compareNaturalSizes("S", "XL") < 0);
  assert.ok(compareNaturalSizes("27", "30") < 0);
  assert.ok(compareNaturalSizes("5ml", "100ml") < 0);
});

test("price/cost inheritance and overrides remain explicit", () => {
  const group = addSizesToColorGroup(colorGroup(), ["M"]).group;
  const size = group.sizes[0];
  assert.equal(resolveSizePrice(group, size, "100000"), "150000");
  assert.equal(resolveSizeCost(group, size, "50000"), "80000");
  size.inheritsPrice = false;
  size.priceOverride = "175000";
  group.defaultPrice = "160000";
  assert.equal(resolveSizePrice(group, size, "100000"), "175000");
});

test("size images override color images and color overrides general images", () => {
  const group = addSizesToColorGroup(colorGroup(), ["M"]).group;
  const size = group.sizes[0];
  const general = [image("general")];
  group.sharedImages = [image("black")];
  assert.equal(resolveSizeImages(general, group, size)[0].url, "black");
  size.images = [image("black-m")];
  assert.equal(resolveSizeImages(general, group, size)[0].url, "black-m");
  size.images = [];
  group.sharedImages = [];
  assert.equal(resolveSizeImages(general, group, size)[0].url, "general");
});

test("flattened apply payload persists shared color and size override images", () => {
  const group = addSizesToColorGroup(colorGroup(), ["S", "M"]).group;
  group.sharedImages = [image("black-shared")];
  group.sizes[1].images = [image("black-m")];
  const flattened = flattenColorGroups([group], {
    productPrice: "150000",
    productCost: "80000",
    includeGeneralImageFallback: false,
  });
  assert.deepEqual(
    flattened.map((variant) => ({
      size: variant.size,
      images: variant.images?.map((item) => item.url),
    })),
    [
      { size: "S", images: ["black-shared"] },
      { size: "M", images: ["black-m"] },
    ],
  );
});

test("identical existing variant image sets load as shared color images", () => {
  const groups = groupVariantsByColor([
    flatVariant(1, "Black", "S", { images: [image("black")] }),
    flatVariant(2, "Black", "M", { images: [image("black")] }),
  ]);
  assert.equal(groups[0].sharedImages[0].url, "black");
  assert.equal(groups[0].sizes.every((size) => size.images.length === 0), true);
});

test("SKU generation normalizes Vietnamese labels", () => {
  assert.equal(generateVariantSku("AT", "Đen", "Freesize"), "AT-DEN-FREESIZE");
});

test("Excel preview summaries group repeated colors without merging sizes", () => {
  assert.deepEqual(
    summarizeVariantsByColor([
      { color: " Đen ", size: "L" },
      { color: "đen", size: "S" },
      { color: "Trắng", size: "M" },
    ]),
    [
      { color: "Đen", sizes: ["S", "L"] },
      { color: "Trắng", sizes: ["M"] },
    ],
  );
});
