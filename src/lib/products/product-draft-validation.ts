import type {
  ProductFormStep,
  ProductFormValues,
  ProductImageDraftValue,
} from "@/interface/product";

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
    if (
      !(["DRAFT", "ACTIVE", "ARCHIVED", "OUT_OF_STOCK"] as string[]).includes(
        data.productStatus,
      )
    )
      add("productStatus", "Vui lòng chọn trạng thái sản phẩm.");
    if (
      !(["PUBLIC", "HIDDEN", "PRIVATE"] as string[]).includes(data.visibility)
    )
      add("visibility", "Vui lòng chọn chế độ hiển thị.");
  }
  if (step === "images") {
    if (!data.images.length)
      add("images", "Vui lòng thêm ít nhất một hình ảnh sản phẩm.");
    if (data.images.some((image) => !image.url || !image.publicId))
      add("images", "Vui lòng chờ hình ảnh tải lên hoàn tất.");
  }
  if (step === "variants") {
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
  return null;
}
