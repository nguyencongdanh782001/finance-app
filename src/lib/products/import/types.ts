import type { ProductStatus } from "@/interface/product";

export const PRODUCT_IMPORT_LIMITS = {
  maxFileSize: 10 * 1024 * 1024,
  maxProducts: 5_000,
  maxRows: 20_000,
  maxCategoryDepth: 5,
  maxImagesPerProduct: 20,
  batchSize: 25,
} as const;

export const PRODUCT_IMPORT_SHEETS = {
  instructions: "Hướng dẫn",
  categories: "Danh mục",
  products: "Sản phẩm",
  variants: "Biến thể",
  images: "Hình ảnh",
} as const;

export const PRODUCT_IMPORT_HEADERS = {
  categories: ["category_key", "name", "slug", "parent_category_key"],
  products: [
    "product_key",
    "name",
    "slug",
    "category_key",
    "category_slug",
    "brand",
    "gender",
    "status",
    "short_description",
    "description",
    "has_variants",
    "default_sku",
    "default_price",
    "default_cost",
    "default_stock",
  ],
  variants: [
    "product_key",
    "color",
    "size",
    "sku",
    "price",
    "cost",
    "stock",
    "is_active",
  ],
  images: [
    "product_key",
    "variant_sku",
    "image_url",
    "sort_order",
    "is_primary",
    "alt_text",
  ],
} as const;

export const PRODUCT_PER_SHEET_HEADERS = {
  product: ["field", "value"],
  variants: ["color", "size", "sku", "price", "cost", "stock", "is_active"],
  images: ["variant_sku", "image_url", "sort_order", "is_primary", "alt_text"],
} as const;

export const PRODUCT_PER_SHEET_SECTIONS = {
  variants: "Biến thể",
  images: "Hình ảnh",
} as const;

export type ImportSeverity = "ERROR" | "WARNING";
export type ImportCellValue = string | number | boolean | null;

export type ImportCellError = {
  sheet: string;
  row: number;
  column: string;
  field: string;
  value: ImportCellValue;
  code: string;
  message: string;
  severity: ImportSeverity;
  productKey?: string;
};

const FILE_BLOCKING_CODES = new Set([
  "MISSING_SHEET",
  "MISSING_HEADER",
  "DUPLICATE_HEADER",
  "ROW_LIMIT_EXCEEDED",
  "PRODUCT_LIMIT_EXCEEDED",
  "MALFORMED_WORKBOOK",
]);

export const isFileBlockingImportError = (error: ImportCellError) =>
  error.severity === "ERROR" && FILE_BLOCKING_CODES.has(error.code);

export type ImportCategory = {
  row: number;
  key: string;
  name: string;
  slug: string;
  parentKey: string;
};

export type ImportVariant = {
  sheet?: string;
  row: number;
  productKey: string;
  color: string;
  size: string;
  sku: string;
  price: number | null;
  cost: number | null;
  stock: number | null;
  isActive: boolean | null;
};

export type ImportImage = {
  sheet?: string;
  row: number;
  productKey: string;
  variantSku: string;
  imageUrl: string;
  sortOrder: number | null;
  isPrimary: boolean | null;
  altText: string;
};

export type ImportProduct = {
  sheet?: string;
  row: number;
  key: string;
  name: string;
  slug: string;
  categoryKey: string;
  categorySlug: string;
  brand: string;
  gender: "WOMEN" | "MEN" | "UNISEX" | "KIDS" | null;
  status: ProductStatus | null;
  shortDescription: string;
  description: string;
  hasVariants: boolean | null;
  defaultSku: string;
  defaultPrice: number | null;
  defaultCost: number | null;
  defaultStock: number | null;
  variants: ImportVariant[];
  images: ImportImage[];
};

export type ImportRawRow = {
  row: number;
  values: Record<string, ImportCellValue>;
};

export type ProductImportSource = {
  version: 1;
  layout?: "legacy" | "per-product";
  categories: ImportCategory[];
  products: ImportProduct[];
  originalRows: Record<string, ImportRawRow[]>;
};

export type ProductImportValidation = {
  source: ProductImportSource;
  errors: ImportCellError[];
  totals: {
    products: number;
    valid: number;
    invalid: number;
    warnings: number;
    variants: number;
    images: number;
    categoriesToCreate: number;
  };
};

export type ProductImportDatabaseContext = {
  categorySlugs: string[];
  productSlugs: string[];
  variantSkus: string[];
};

export type ProductImportOptions = {
  createMissingCategories: boolean;
  forcePrivate: boolean;
};

export type ProductImportResultItem = {
  productKey: string;
  name: string;
  status: "SUCCESS" | "FAILED" | "SKIPPED";
  productId?: number;
  message?: string;
};
