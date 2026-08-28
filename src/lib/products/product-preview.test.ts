import test from "node:test";
import assert from "node:assert/strict";
import type {
  ProductColorGroupFormValue,
  ProductFormValues,
  ProductImageDraftValue,
} from "../../interface/product.ts";
import {
  draftProductToPreviewViewModel,
  formatPreviewPrice,
  getDefaultPreviewSelection,
  getPreviewSizesForColor,
  resolvePreviewImages,
  resolvePreviewVariant,
} from "./product-preview.ts";

const image = (name: string): ProductImageDraftValue => ({
  clientId: name,
  url: `https://example.com/${name}.jpg`,
  publicId: name,
  position: 0,
  isPrimary: true,
});

const size = (
  clientId: string,
  sizeName: string,
  stock: string,
  overrides: Record<string, unknown> = {},
) => ({
  clientId,
  sizeName,
  sku: `SKU-${clientId}`,
  priceOverride: "",
  costOverride: "",
  inheritsPrice: true,
  inheritsCost: true,
  stock,
  isActive: true,
  images: [],
  ...overrides,
});

const group = (
  clientId: string,
  colorName: string,
  sizes: ReturnType<typeof size>[],
): ProductColorGroupFormValue => ({
  clientId,
  colorName,
  colorCode: colorName === "Đen" ? "#000000" : "#ffffff",
  defaultPrice: colorName === "Đen" ? "150000" : "180000",
  defaultCost: "80000",
  sharedImages: [],
  sizes,
});

const values = (): ProductFormValues => ({
  title: "Áo thun",
  slug: "ao-thun",
  description: "Mô tả",
  categoryId: "1",
  importPrice: "80000",
  sellPrice: "150000",
  quantity: "4",
  gender: "UNISEX",
  productStatus: "PRIVATE",
  seoTitle: "",
  seoDescription: "",
  variants: [],
  colorGroups: [
    group("black", "Đen", [size("black-s", "S", "0"), size("black-m", "M", "8")]),
    group("white", "Trắng", [
      size("white-s", "S", "2"),
      size("white-l", "L", "5", { isActive: false }),
    ]),
  ],
});

test("draft conversion preserves product, category and active color variants", () => {
  const product = draftProductToPreviewViewModel({
    values: values(),
    images: [image("general")],
    category: {
      id: 1,
      name: "Áo",
      color: "pink",
      icon: "shirt",
      parent: { id: 2, name: "Quần áo" },
    },
  });
  assert.equal(product.title, "Áo thun");
  assert.deepEqual(product.categoryPath, ["Quần áo", "Áo"]);
  assert.equal(product.colors.length, 2);
  assert.deepEqual(
    product.colors[1].variants.map((variant) => variant.sizeName),
    ["S"],
  );
});

test("default selection chooses first color and first in-stock active size", () => {
  const product = draftProductToPreviewViewModel({
    values: values(),
    images: [],
  });
  assert.deepEqual(getDefaultPreviewSelection(product), {
    colorId: "black",
    variantClientId: "black-m",
  });
  assert.deepEqual(
    getPreviewSizesForColor(product, "white").map((variant) => variant.sizeName),
    ["S"],
  );
});

test("size images override color images and color overrides general images", () => {
  const draft = values();
  const black = draft.colorGroups?.[0];
  assert.ok(black);
  black.sharedImages = [image("black")];
  const product = draftProductToPreviewViewModel({
    values: draft,
    images: [image("general")],
  });
  const selection = { colorId: "black", variantClientId: "black-m" };
  assert.equal(resolvePreviewImages(product, selection)[0].clientId, "black");
  black.sizes[1].images = [image("black-m")];
  const withOverride = draftProductToPreviewViewModel({
    values: draft,
    images: [image("general")],
  });
  assert.equal(
    resolvePreviewImages(withOverride, selection)[0].clientId,
    "black-m",
  );
  black.sizes[1].images = [];
  black.sharedImages = [];
  const generalFallback = draftProductToPreviewViewModel({
    values: draft,
    images: [image("general")],
  });
  assert.equal(
    resolvePreviewImages(generalFallback, selection)[0].clientId,
    "general",
  );
});

test("selection resolves exact SKU, stock and effective price range", () => {
  const product = draftProductToPreviewViewModel({ values: values(), images: [] });
  const selected = resolvePreviewVariant(product, {
    colorId: "white",
    variantClientId: "white-s",
  });
  assert.equal(selected?.sku, "SKU-white-s");
  assert.equal(selected?.stock, 2);
  assert.equal(selected?.price, 180000);
  assert.equal(formatPreviewPrice(product), "150.000đ – 180.000đ");
  assert.equal(
    formatPreviewPrice(product, {
      colorId: "white",
      variantClientId: "white-s",
    }),
    "180.000đ",
  );
});

test("incomplete draft produces safe placeholders without variants or images", () => {
  const draft = values();
  draft.title = "";
  draft.colorGroups = [];
  const product = draftProductToPreviewViewModel({ values: draft, images: [] });
  assert.equal(product.title, "Tên sản phẩm chưa được nhập");
  assert.deepEqual(getDefaultPreviewSelection(product), {
    colorId: null,
    variantClientId: null,
  });
  assert.deepEqual(resolvePreviewImages(product, { colorId: null, variantClientId: null }), []);
});
