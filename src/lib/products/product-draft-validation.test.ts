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
  productStatus: "DRAFT",
  visibility: "PUBLIC",
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
test("step validation blocks required product, category and image fields", () => {
  const data = base();
  data.title = " ";
  assert.equal(validateProductStep(data, "info")[0].path, "title");
  data.categoryId = "";
  assert.equal(validateProductStep(data, "category")[0].path, "categoryId");
  data.images = [];
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
