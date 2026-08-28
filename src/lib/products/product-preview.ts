import type { CategoryApiItem } from "../../interface/category.ts";
import type {
  ProductColorGroupFormValue,
  ProductFormValues,
  ProductImageDraftValue,
  ProductStatus,
} from "../../interface/product.ts";
import { formatCurrencyVND } from "../../helper/convertCurrency.ts";
import {
  groupVariantsByColor,
  resolveSizeCost,
  resolveSizePrice,
} from "./variant-groups.ts";

export type ProductPreviewImage = {
  clientId: string;
  url: string;
  alt: string;
};

export type ProductPreviewVariant = {
  id?: number;
  clientId: string;
  sizeName: string;
  sku: string;
  price: number;
  cost: number;
  stock: number;
  isActive: boolean;
  images: ProductPreviewImage[];
};

export type ProductPreviewColor = {
  clientId: string;
  name: string;
  code: string;
  images: ProductPreviewImage[];
  variants: ProductPreviewVariant[];
};

export type ProductPreviewViewModel = {
  title: string;
  slug: string;
  brand: string;
  categoryPath: string[];
  status: ProductStatus;
  description: string;
  gender: ProductFormValues["gender"];
  generalImages: ProductPreviewImage[];
  colors: ProductPreviewColor[];
  basePrice: number;
  baseStock: number;
  minPrice: number;
  maxPrice: number;
  hasVariants: boolean;
};

export type ProductPreviewSelection = {
  colorId: string | null;
  variantClientId: string | null;
};

const numberOrZero = (value: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toPreviewImages = (
  images: ProductImageDraftValue[],
  title: string,
): ProductPreviewImage[] =>
  [...images]
    .filter((image) => Boolean(image.url))
    .sort((left, right) => left.position - right.position)
    .map((image, index) => ({
      clientId: image.clientId,
      url: image.url,
      alt: `${title || "Sản phẩm"} ${index + 1}`,
    }));

export function draftProductToPreviewViewModel({
  values,
  images,
  category,
}: {
  values: ProductFormValues;
  images: ProductImageDraftValue[];
  category?: CategoryApiItem;
}): ProductPreviewViewModel {
  const title = values.title.trim() || "Tên sản phẩm chưa được nhập";
  const sourceGroups: ProductColorGroupFormValue[] = Array.isArray(
    values.colorGroups,
  )
    ? values.colorGroups
    : groupVariantsByColor(values.variants || []);
  const colors = sourceGroups.flatMap<ProductPreviewColor>((group) => {
    const variants = group.sizes
      .filter((size) => size.isActive)
      .map((size) => ({
        id: size.id,
        clientId: size.clientId,
        sizeName: size.sizeName.trim() || "Chưa đặt size",
        sku: size.sku.trim(),
        price: numberOrZero(resolveSizePrice(group, size, values.sellPrice)),
        cost: numberOrZero(resolveSizeCost(group, size, values.importPrice)),
        stock: Math.max(0, numberOrZero(size.stock)),
        isActive: size.isActive,
        images: toPreviewImages(size.images, title),
      }));
    if (!variants.length) return [];
    return [
      {
        clientId: group.clientId,
        name: group.colorName.trim() || "Màu chưa đặt tên",
        code: group.colorCode.trim(),
        images: toPreviewImages(group.sharedImages, title),
        variants,
      },
    ];
  });
  const prices = colors.flatMap((color) =>
    color.variants.map((variant) => variant.price).filter((price) => price > 0),
  );
  const basePrice = numberOrZero(values.sellPrice);
  const effectivePrices = prices.length ? prices : [basePrice];

  return {
    title,
    slug: values.slug.trim(),
    brand: "",
    categoryPath: category
      ? [category.parent?.name, category.name].filter(
          (part): part is string => Boolean(part),
        )
      : [],
    status: values.productStatus,
    description: values.description.trim(),
    gender: values.gender,
    generalImages: toPreviewImages(images, title),
    colors,
    basePrice,
    baseStock: Math.max(0, numberOrZero(values.quantity)),
    minPrice: Math.min(...effectivePrices),
    maxPrice: Math.max(...effectivePrices),
    hasVariants: colors.length > 0,
  };
}

export const getPreviewColor = (
  product: ProductPreviewViewModel,
  colorId: string | null,
) => product.colors.find((color) => color.clientId === colorId) || null;

export const getPreviewSizesForColor = (
  product: ProductPreviewViewModel,
  colorId: string | null,
) => getPreviewColor(product, colorId)?.variants || [];

export const resolvePreviewVariant = (
  product: ProductPreviewViewModel,
  selection: ProductPreviewSelection,
) =>
  getPreviewSizesForColor(product, selection.colorId).find(
    (variant) => variant.clientId === selection.variantClientId,
  ) || null;

export function getDefaultPreviewSelection(
  product: ProductPreviewViewModel,
): ProductPreviewSelection {
  const color = product.colors[0];
  if (!color) return { colorId: null, variantClientId: null };
  const variant =
    color.variants.find((candidate) => candidate.stock > 0) || color.variants[0];
  return {
    colorId: color.clientId,
    variantClientId: variant?.clientId || null,
  };
}

export function resolvePreviewImages(
  product: ProductPreviewViewModel,
  selection: ProductPreviewSelection,
) {
  const color = getPreviewColor(product, selection.colorId);
  const variant = resolvePreviewVariant(product, selection);
  if (variant?.images.length) return variant.images;
  if (color?.images.length) return color.images;
  return product.generalImages;
}

export function resolvePreviewPrice(
  product: ProductPreviewViewModel,
  selection: ProductPreviewSelection,
) {
  const selected = resolvePreviewVariant(product, selection);
  return selected?.price || null;
}

export const formatPreviewVnd = (value: number) =>
  `${formatCurrencyVND(value)}đ`;

export function formatPreviewPrice(
  product: ProductPreviewViewModel,
  selection?: ProductPreviewSelection,
) {
  const selectedPrice = selection
    ? resolvePreviewPrice(product, selection)
    : null;
  if (selectedPrice) return formatPreviewVnd(selectedPrice);
  if (product.minPrice !== product.maxPrice)
    return `${formatPreviewVnd(product.minPrice)} – ${formatPreviewVnd(product.maxPrice)}`;
  return formatPreviewVnd(product.minPrice);
}
