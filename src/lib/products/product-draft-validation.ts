import type {
  ProductColorGroupFormValue,
  ProductFormStep,
  ProductFormValues,
  ProductImageDraftValue,
} from "@/interface/product";
import { isProductStatus } from "./product-status.ts";
import {
  normalizedVariantKey,
  resolveSizeCost,
  resolveSizePrice,
} from "./variant-groups.ts";

export type ProductValidationError = {
  path: string;
  message: string;
  step: ProductFormStep;
};
export type ProductDraftData = ProductFormValues & {
  images: ProductImageDraftValue[];
};

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const integer = (value: string) => /^\d+$/.test(value.trim());
const variantName = (color: string, size: string) =>
  [color, size].filter(Boolean).join(" / ") || "chưa đặt tên";
const colorPattern = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

function validateColorGroups(
  data: ProductDraftData,
  add: (path: string, message: string) => void,
) {
  const groups = data.colorGroups || [];
  const activeCount = groups.reduce(
    (total, group) =>
      total + group.sizes.filter((size) => size.isActive).length,
    0,
  );
  if (groups.length > 0 && activeCount === 0)
    add(
      "colorGroups",
      "Vui lòng tạo ít nhất một biến thể sản phẩm đang hoạt động.",
    );

  const colorSeen = new Set<string>();
  const skuSeen = new Set<string>();
  groups.forEach((group: ProductColorGroupFormValue) => {
    const groupBase = `colorGroups.${group.clientId}`;
    const colorName = group.colorName.trim();
    const colorKey = normalizedVariantKey(colorName);
    if (!colorName) add(`${groupBase}.colorName`, "Vui lòng nhập tên màu.");
    else if (colorSeen.has(colorKey))
      add(`${groupBase}.colorName`, `Màu “${colorName}” đang bị trùng.`);
    else colorSeen.add(colorKey);
    if (group.colorCode.trim() && !colorPattern.test(group.colorCode.trim()))
      add(
        `${groupBase}.colorCode`,
        "Mã màu phải có dạng #RGB hoặc #RRGGBB.",
      );
    if (!group.sizes.some((size) => size.isActive))
      add(
        `${groupBase}.sizes`,
        `Màu ${colorName || "chưa đặt tên"} chưa có kích thước đang hoạt động.`,
      );

    const sizeSeen = new Set<string>();
    group.sizes.forEach((size) => {
      const sizeBase = `${groupBase}.sizes.${size.clientId}`;
      const sizeName = size.sizeName.trim();
      const name = variantName(colorName, sizeName);
      const sizeKey = normalizedVariantKey(sizeName);
      if (sizeName && sizeSeen.has(sizeKey))
        add(`${sizeBase}.sizeName`, `Size “${sizeName}” đang bị trùng trong màu này.`);
      else if (sizeName) sizeSeen.add(sizeKey);
      if (!size.isActive) return;
      if (!sizeName)
        add(`${sizeBase}.sizeName`, `Vui lòng nhập size cho ${name}.`);

      const sku = size.sku.trim().toLocaleUpperCase("vi");
      if (!sku) add(`${sizeBase}.sku`, `Vui lòng nhập SKU cho ${name}.`);
      else if (skuSeen.has(sku))
        add(`${sizeBase}.sku`, `SKU “${sku}” đang bị trùng trong sản phẩm.`);
      else skuSeen.add(sku);

      const price = resolveSizePrice(group, size, data.sellPrice);
      if (!price.trim() || !integer(price) || Number(price) <= 0)
        add(`${sizeBase}.price`, `Vui lòng nhập giá bán hợp lệ cho ${name}.`);
      const cost = resolveSizeCost(group, size, data.importPrice);
      if (!cost.trim() || !integer(cost))
        add(`${sizeBase}.cost`, `Vui lòng nhập giá vốn cho ${name}.`);
      if (!size.stock.trim() || !integer(size.stock))
        add(`${sizeBase}.stock`, `Vui lòng nhập tồn kho cho ${name}.`);
      if (
        [...group.sharedImages, ...size.images].some(
          (image) => !image.url || !image.publicId,
        )
      )
        add(`${sizeBase}.images`, `Ảnh của ${name} chưa tải lên hoàn tất.`);
    });
  });
}

export function validateProductStep(
  data: ProductDraftData,
  step: ProductFormStep,
): ProductValidationError[] {
  const errors: ProductValidationError[] = [];
  const add = (path: string, message: string) =>
    errors.push({ path, message, step });
  if (step === "info") {
    const title = data.title.trim().replace(/\s+/g, " ");
    if (!title) add("title", "Vui lòng nhập tên sản phẩm.");
    else if (title.length < 2)
      add("title", "Tên sản phẩm phải có ít nhất 2 ký tự.");
    else if (title.length > 150)
      add("title", "Tên sản phẩm không được vượt quá 150 ký tự.");
    if (data.slug.trim() && !slugPattern.test(data.slug.trim()))
      add("slug", "Đường dẫn sản phẩm không hợp lệ.");
    if (data.description && data.description.length > 20_000)
      add("description", "Mô tả sản phẩm quá dài.");
    if (data.variants.length === 0) {
      if (!data.sellPrice.trim()) add("sellPrice", "Vui lòng nhập giá bán.");
      else if (!integer(data.sellPrice) || Number(data.sellPrice) <= 0)
        add("sellPrice", "Giá bán phải là số nguyên lớn hơn 0.");
      if (!data.importPrice.trim())
        add("importPrice", "Vui lòng nhập giá vốn.");
      else if (!integer(data.importPrice))
        add("importPrice", "Giá vốn phải là số nguyên không âm.");
      if (!data.quantity.trim())
        add("quantity", "Vui lòng nhập số lượng tồn kho.");
      else if (!integer(data.quantity))
        add("quantity", "Tồn kho phải là số nguyên không âm.");
    }
  }
  if (step === "category") {
    if (!data.categoryId) add("categoryId", "Vui lòng chọn danh mục sản phẩm.");
    if (!isProductStatus(data.productStatus))
      add("productStatus", "Vui lòng chọn trạng thái sản phẩm.");
  }
  if (step === "images") {
    if (data.images.some((image) => !image.url || !image.publicId))
      add("images", "Vui lòng chờ hình ảnh tải lên hoàn tất.");
  }
  if (step === "variants") {
    if (Array.isArray(data.colorGroups)) {
      validateColorGroups(data, add);
      return errors;
    }
    const active = data.variants.filter((variant) => variant.isActive);
    if (data.variants.length > 0 && active.length === 0)
      add(
        "variants",
        "Vui lòng tạo ít nhất một biến thể sản phẩm đang hoạt động.",
      );
    const skuSeen = new Set<string>();
    const combinationSeen = new Set<string>();
    active.forEach((variant) => {
      const base = `variants.${variant.clientId}`;
      const name = variantName(variant.color.trim(), variant.size.trim());
      if (!variant.color.trim() || !variant.size.trim())
        add(
          `${base}.options`,
          `Vui lòng chọn đầy đủ thuộc tính cho biến thể ${name}.`,
        );
      const combination = `${variant.color.trim().toLocaleLowerCase("vi")}|${variant.size.trim().toLocaleLowerCase("vi")}`;
      if (combinationSeen.has(combination))
        add(`${base}.options`, `Biến thể ${name} đang bị trùng.`);
      else combinationSeen.add(combination);
      const sku = variant.sku.trim().toLocaleUpperCase("vi");
      if (!sku) add(`${base}.sku`, `Vui lòng nhập SKU cho biến thể ${name}.`);
      else if (skuSeen.has(sku))
        add(`${base}.sku`, `SKU “${sku}” đang bị trùng trong sản phẩm.`);
      else skuSeen.add(sku);
      if (
        !variant.price.trim() ||
        !integer(variant.price) ||
        Number(variant.price) <= 0
      )
        add(
          `${base}.price`,
          `Vui lòng nhập giá bán hợp lệ cho biến thể ${name}.`,
        );
      if (!variant.importPrice.trim() || !integer(variant.importPrice))
        add(
          `${base}.importPrice`,
          `Vui lòng nhập giá vốn cho biến thể ${name}.`,
        );
      if (!variant.quantity.trim() || !integer(variant.quantity))
        add(`${base}.quantity`, `Vui lòng nhập tồn kho cho biến thể ${name}.`);
      if ((variant.images || []).some((image) => !image.url || !image.publicId))
        add(
          `${base}.images`,
          `Ảnh của biến thể ${name} chưa tải lên hoàn tất.`,
        );
    });
  }
  return errors;
}

export function validateProductFinal(
  data: ProductDraftData,
): ProductValidationError[] {
  return (
    ["info", "category", "images", "variants"] as ProductFormStep[]
  ).flatMap((step) => validateProductStep(data, step));
}

export function validatePartialDraft(value: unknown): string | null {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return "Dữ liệu bản nháp không đúng cấu trúc.";
  const data = value as Record<string, unknown>;
  for (const key of ["sellPrice", "importPrice", "quantity"]) {
    const field = data[key];
    if (field !== undefined && typeof field !== "string")
      return `${key} phải là chuỗi số.`;
    if (
      typeof field === "string" &&
      field.trim() &&
      (!/^\d+$/.test(field.trim()) || Number(field) < 0)
    )
      return `${key} không hợp lệ.`;
  }
  if (data.variants !== undefined && !Array.isArray(data.variants))
    return "Danh sách biến thể không đúng cấu trúc.";
  if (data.colorGroups !== undefined && !Array.isArray(data.colorGroups))
    return "Danh sách nhóm màu không đúng cấu trúc.";
  return null;
}
