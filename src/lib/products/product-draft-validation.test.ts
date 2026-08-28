import test from "node:test";
import assert from "node:assert/strict";
import {
  validatePartialDraft,
  validateProductFinal,
  validateProductStep,
} from "./product-draft-validation.ts";
import type { ProductDraftData } from "./product-draft-validation.ts";

const base = (): ProductDraftData => ({
  title: "Áo thun",
  slug: "ao-thun",
  description: "",
  categoryId: "1",
  importPrice: "50000",
  sellPrice: "100000",
  quantity: "2",
  gender: "",
  productStatus: "PRIVATE",
  seoTitle: "",
  seoDescription: "",
  images: [
    {
      clientId: "image-1",
      url: "https://example.com/a.jpg",
      publicId: "a",
      isPrimary: true,
      position: 0,
    },
  ],
  variants: [],
});
test("draft autosave accepts empty and incomplete data", () => {
  assert.equal(validatePartialDraft({}), null);
  assert.equal(validatePartialDraft({ variants: [{ clientId: "v1" }] }), null);
});
test("draft autosave rejects invalid structure and entered negatives", () => {
  assert.ok(validatePartialDraft({ variants: "bad" }));
  assert.ok(validatePartialDraft({ sellPrice: "-1" }));
});
test("step validation blocks required product/category but allows no image", () => {
  const data = base();
  data.title = " ";
  assert.equal(validateProductStep(data, "info")[0].path, "title");
  data.categoryId = "";
  assert.equal(validateProductStep(data, "category")[0].path, "categoryId");
  data.images = [];
  assert.equal(validateProductStep(data, "images").length, 0);
  data.images = [
    {
      clientId: "uploading",
      url: "blob:pending",
      isPrimary: true,
      position: 0,
    },
  ];
  assert.equal(validateProductStep(data, "images")[0].path, "images");
});
test("active variants require identity and commercial data", () => {
  const data = base();
  data.variants = [
    {
      clientId: "v1",
      color: "",
      size: "",
      sku: "",
      price: "",
      importPrice: "",
      quantity: "",
      isActive: true,
      images: [],
    },
  ];
  assert.ok(validateProductStep(data, "variants").length >= 5);
});
test("inactive incomplete variants do not block final validation", () => {
  const data = base();
  data.variants = [
    {
      clientId: "v1",
      color: "",
      size: "",
      sku: "",
      price: "",
      importPrice: "",
      quantity: "",
      isActive: false,
      images: [],
    },
  ];
  assert.equal(
    validateProductFinal(data).filter((error) => error.path !== "variants")
      .length,
    0,
  );
  assert.ok(
    validateProductFinal(data).some((error) => error.path === "variants"),
  );
});
test("duplicate SKU is case insensitive", () => {
  const data = base();
  data.variants = ["v1", "v2"].map((clientId, index) => ({
    clientId,
    color: index ? "Đen" : "Trắng",
    size: "M",
    sku: index ? " sku-1 " : "SKU-1",
    price: "100",
    importPrice: "0",
    quantity: "0",
    isActive: true,
    images: [],
  }));
  assert.ok(
    validateProductStep(data, "variants").some((error) =>
      error.message.includes("trùng"),
    ),
  );
});

test("nested color groups validate inherited values and active sizes", () => {
  const data = base();
  data.colorGroups = [
    {
      clientId: "black",
      colorName: "Đen",
      colorCode: "#111111",
      defaultPrice: "120000",
      defaultCost: "60000",
      sharedImages: [],
      sizes: [
        {
          clientId: "black-m",
          sizeName: "M",
          sku: "AO-DEN-M",
          priceOverride: "",
          costOverride: "",
          inheritsPrice: true,
          inheritsCost: true,
          stock: "3",
          isActive: true,
          images: [],
        },
      ],
    },
  ];
  assert.deepEqual(validateProductStep(data, "variants"), []);
});

test("nested color groups reject normalized duplicate colors, sizes and SKUs", () => {
  const data = base();
  const size = (clientId: string, sizeName: string, sku: string) => ({
    clientId,
    sizeName,
    sku,
    priceOverride: "100000",
    costOverride: "50000",
    inheritsPrice: false,
    inheritsCost: false,
    stock: "0",
    isActive: true,
    images: [],
  });
  data.colorGroups = [
    {
      clientId: "black-1",
      colorName: " Đen ",
      colorCode: "not-a-color",
      defaultPrice: "",
      defaultCost: "",
      sharedImages: [],
      sizes: [size("m-1", "M", "SKU-1"), size("m-2", " m ", "SKU-2")],
    },
    {
      clientId: "black-2",
      colorName: "đen",
      colorCode: "",
      defaultPrice: "",
      defaultCost: "",
      sharedImages: [],
      sizes: [size("l", "L", " sku-1 ")],
    },
  ];
  const errors = validateProductStep(data, "variants");
  assert.ok(errors.some((error) => error.path.endsWith("colorName")));
  assert.ok(errors.some((error) => error.path.endsWith("colorCode")));
  assert.ok(errors.some((error) => error.path.endsWith("sizeName")));
  assert.ok(errors.some((error) => error.path.endsWith("sku")));
});

test("partial drafts accept nested color groups and reject invalid structure", () => {
  assert.equal(validatePartialDraft({ colorGroups: [] }), null);
  assert.ok(validatePartialDraft({ colorGroups: "bad" }));
});
