import type { ProductStatus } from "@/interface/product";

export const PRODUCT_STATUSES = [
  "PUBLIC",
  "PRIVATE",
  "DISCONTINUED",
] as const satisfies readonly ProductStatus[];

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  PUBLIC: "Công khai",
  PRIVATE: "Riêng tư",
  DISCONTINUED: "Ngừng bán",
};

export const PRODUCT_STATUS_DESCRIPTIONS: Record<ProductStatus, string> = {
  PUBLIC: "Hiển thị và cho phép khách hàng mua sản phẩm.",
  PRIVATE: "Chỉ hiển thị trong Admin.",
  DISCONTINUED: "Giữ lại dữ liệu nhưng không cho phép tạo đơn mới.",
};

export const isProductStatus = (value: unknown): value is ProductStatus =>
  typeof value === "string" &&
  PRODUCT_STATUSES.includes(value as ProductStatus);

export const normalizeProductStatus = (
  value: unknown,
  fallback: ProductStatus = "PRIVATE",
): ProductStatus => (isProductStatus(value) ? value : fallback);

export const mapLegacyProductStatus = (
  status: "DRAFT" | "ACTIVE" | "ARCHIVED" | "OUT_OF_STOCK" | null,
  visibility: "PUBLIC" | "HIDDEN" | "PRIVATE",
): ProductStatus => {
  if (status === "ARCHIVED") return "DISCONTINUED";
  if (
    (status === "ACTIVE" || status === "OUT_OF_STOCK") &&
    visibility === "PUBLIC"
  ) {
    return "PUBLIC";
  }
  return "PRIVATE";
};

export const isVisibleOnStorefront = (status: ProductStatus) =>
  status === "PUBLIC";

export const canAddToCustomerCart = (status: ProductStatus) =>
  status === "PUBLIC";

export const canAddToOfflineOrder = (status: ProductStatus) =>
  status !== "DISCONTINUED";

export const legacyFieldsForStatus = (status: ProductStatus) => {
  if (status === "PUBLIC") {
    return {
      productStatus: "ACTIVE" as const,
      visibility: "PUBLIC" as const,
      isPublished: true,
    };
  }

  if (status === "DISCONTINUED") {
    return {
      productStatus: "ARCHIVED" as const,
      visibility: "PRIVATE" as const,
      isPublished: false,
    };
  }

  return {
    productStatus: "ACTIVE" as const,
    visibility: "PRIVATE" as const,
    isPublished: false,
  };
};

export const getTotalAvailableStock = (product: {
  quantity: number;
  variants?: Array<{
    quantity: number;
    reservedQuantity?: number | null;
    isActive: boolean;
  }>;
}) => {
  const activeVariants = (product.variants || []).filter(
    (variant) => variant.isActive,
  );

  if (!activeVariants.length) {
    return Math.max(0, Number(product.quantity));
  }

  return activeVariants.reduce(
    (total, variant) =>
      total +
      Math.max(
        0,
        Number(variant.quantity) - Number(variant.reservedQuantity || 0),
      ),
    0,
  );
};

export const toProductResponse = <
  T extends {
    status: ProductStatus;
    quantity: number;
    variants?: Array<{
      quantity: number;
      reservedQuantity?: number | null;
      isActive: boolean;
    }>;
  },
>(
  product: T,
) => {
  const response = { ...product } as Record<string, unknown>;
  delete response.status;
  delete response.visibility;
  delete response.productStatus;

  return {
    ...response,
    productStatus: product.status,
    totalAvailableStock: getTotalAvailableStock(product),
  };
};
