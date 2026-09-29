import type {
  ProductApiItem,
  ProductImageApiItem,
  ProductVariantApiItem,
} from "../../interface/product.ts";
import { foldSearchText } from "../search.ts";

export type ShopOrderLineOption = {
  productId: number;
  variantId: number | null;
  title: string;
  imageUrl: string;
  categoryName: string;
  sku: string | null;
  barcode: string | null;
  color: string;
  colorCode: string;
  size: string;
  variantLabel: string;
  originalUnitPrice: number;
  unitCost: number;
  availableStock: number;
  productStatus: "PUBLIC" | "PRIVATE";
};

export type ShopOrderColorOption = {
  key: string;
  label: string;
  colorCode: string;
  variants: ShopOrderLineOption[];
};

export type ShopOrderProductOption = {
  productId: number;
  title: string;
  imageUrl: string;
  categoryName: string;
  productStatus: "PUBLIC" | "PRIVATE";
  baseOption: ShopOrderLineOption | null;
  colors: ShopOrderColorOption[];
  searchableText: string;
  totalAvailableStock: number;
};

const toNumber = (value: unknown) => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? Math.round(parsed) : 0;
};

const normalizeLabel = (value: string | null | undefined) =>
  String(value || "")
    .trim()
    .replace(/\s+/g, " ");

const imageUrlFrom = (
  images: ProductImageApiItem[] | undefined,
  fallback = "",
) => {
  const image = [...(images || [])]
    .filter((candidate) => Boolean(candidate.url))
    .sort(
      (left, right) =>
        Number(right.isPrimary) - Number(left.isPrimary) ||
        left.position - right.position,
    )[0];

  return image?.url || fallback;
};

const getProductStatus = (product: ProductApiItem) =>
  product.productStatus === "PRIVATE" ? "PRIVATE" : "PUBLIC";

const getColorKey = (variant: ProductVariantApiItem) => {
  const colorCode = normalizeLabel(variant.colorCode).toLowerCase();
  const color = normalizeLabel(variant.color).toLocaleLowerCase("vi");

  if (colorCode) return `code:${colorCode}`;
  if (color) return `name:${color}`;
  return "__default_color__";
};

const getVariantLabel = (variant: ProductVariantApiItem) =>
  [normalizeLabel(variant.color), normalizeLabel(variant.size)]
    .filter(Boolean)
    .join(" / ") ||
  normalizeLabel(variant.sku) ||
  "Biến thể";

const compareSize = (left: ShopOrderLineOption, right: ShopOrderLineOption) =>
  left.size.localeCompare(right.size, "vi", {
    numeric: true,
    sensitivity: "base",
  });

const toVariantOption = (
  product: ProductApiItem,
  variant: ProductVariantApiItem,
  productImageUrl: string,
): ShopOrderLineOption => ({
  productId: product.id,
  variantId: variant.id,
  title: product.title,
  imageUrl: imageUrlFrom(variant.images, productImageUrl),
  categoryName: product.category.name,
  sku: normalizeLabel(variant.sku) || null,
  barcode: normalizeLabel(variant.barcode) || null,
  color: normalizeLabel(variant.color) || "Mặc định",
  colorCode: normalizeLabel(variant.colorCode),
  size: normalizeLabel(variant.size) || "Mặc định",
  variantLabel: getVariantLabel(variant),
  originalUnitPrice: toNumber(
    variant.sellPrice ?? variant.price ?? product.sellPrice,
  ),
  unitCost: toNumber(variant.importPrice ?? product.importPrice),
  availableStock: Math.max(0, toNumber(variant.quantity)),
  productStatus: getProductStatus(product),
});

export function mapShopOrderProducts(
  products: ProductApiItem[],
): ShopOrderProductOption[] {
  return products
    .filter((product) => product.productStatus !== "DISCONTINUED")
    .map((product) => {
      const productImageUrl = imageUrlFrom(product.images, product.imageUrl);
      const sourceVariants = product.variants || [];
      const activeVariants = sourceVariants.filter(
        (variant) => variant.isActive,
      );
      const colorMap = new Map<string, ShopOrderColorOption>();

      activeVariants.forEach((variant) => {
        const option = toVariantOption(product, variant, productImageUrl);
        const key = getColorKey(variant);
        const current = colorMap.get(key);

        if (current) {
          current.variants.push(option);
          return;
        }

        colorMap.set(key, {
          key,
          label: option.color,
          colorCode: option.colorCode,
          variants: [option],
        });
      });

      const colors = [...colorMap.values()].map((color) => ({
        ...color,
        variants: color.variants.sort(compareSize),
      }));
      const baseOption: ShopOrderLineOption | null = sourceVariants.length
        ? null
        : {
            productId: product.id,
            variantId: null,
            title: product.title,
            imageUrl: productImageUrl,
            categoryName: product.category.name,
            sku: null,
            barcode: null,
            color: "",
            colorCode: "",
            size: "",
            variantLabel: "",
            originalUnitPrice: toNumber(product.sellPrice),
            unitCost: toNumber(product.importPrice),
            availableStock: Math.max(0, toNumber(product.quantity)),
            productStatus: getProductStatus(product),
          };
      const allOptions = colors.flatMap((color) => color.variants);
      const searchableText = [
        product.title,
        product.category.name,
        `#${product.id}`,
        ...allOptions.flatMap((option) => [
          option.sku,
          option.barcode,
          option.color,
          option.size,
        ]),
      ]
        .filter(Boolean)
        .join(" ");

      return {
        productId: product.id,
        title: product.title,
        imageUrl: productImageUrl,
        categoryName: product.category.name,
        productStatus: getProductStatus(product),
        baseOption,
        colors,
        searchableText: foldSearchText(searchableText),
        totalAvailableStock: baseOption
          ? baseOption.availableStock
          : allOptions.reduce(
              (total, option) => total + option.availableStock,
              0,
            ),
      };
    });
}

export const findShopOrderProduct = (
  products: ShopOrderProductOption[],
  productId: number,
) => products.find((product) => product.productId === productId) || null;

export const findShopOrderLineOption = (
  products: ShopOrderProductOption[],
  productId: number,
  variantId: number | null,
) => {
  const product = findShopOrderProduct(products, productId);
  if (!product) return null;
  if (variantId === null) return product.baseOption;

  return (
    product.colors
      .flatMap((color) => color.variants)
      .find((variant) => variant.variantId === variantId) || null
  );
};

export const getDefaultShopOrderVariant = (product: ShopOrderProductOption) => {
  const variants = product.colors.flatMap((color) => color.variants);
  return (
    variants.find((variant) => variant.availableStock > 0) ||
    variants[0] ||
    product.baseOption
  );
};

export const getShopOrderColorForVariant = (
  product: ShopOrderProductOption,
  variantId: number | null,
) =>
  product.colors.find((color) =>
    color.variants.some((variant) => variant.variantId === variantId),
  ) || null;
