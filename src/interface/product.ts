import { CategoryApiItem } from "@/interface/category";
import type { RichTextDocument } from "@/lib/rich-text";

export type ProductStatus = "PUBLIC" | "PRIVATE" | "DISCONTINUED";
export type TryOnCategory =
  | "UPPER_BODY"
  | "LOWER_BODY"
  | "DRESSES"
  | "SHOES"
  | "ACCESSORIES"
  | "NOT_SUPPORTED";

export interface ProductApiItem {
  id: number;
  title: string;
  imageUrl: string;
  imagePublicId: string;
  categoryId: number;
  importPrice: number | string;
  sellPrice: number | string;
  quantity: number;
  organicFavoriteCount?: number;
  favoriteCountAdjustment?: number;
  displayFavoriteCount?: number;
  isFavorited?: boolean;
  totalAvailableStock?: number;
  category: CategoryApiItem;
  variants?: ProductVariantApiItem[];
  description?: string | null;
  descriptionContent?: RichTextDocument | null;
  descriptionHtml?: string | null;
  slug?: string | null;
  productStatus?: ProductStatus | null;
  gender?: "WOMEN" | "MEN" | "UNISEX" | "KIDS" | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  images?: ProductImageApiItem[];
}

export interface ProductImageApiItem {
  id: number;
  url: string;
  publicId?: string | null;
  altText?: string | null;
  position: number;
  isPrimary: boolean;
}

export interface ProductVariantApiItem {
  id: number;
  sku: string;
  barcode?: string | null;
  size: string | null;
  color: string | null;
  colorCode?: string | null;
  price?: number | string | null;
  sellPrice: number | string;
  importPrice: number | string;
  quantity: number;
  reservedQuantity?: number;
  isActive: boolean;
  comparePrice?: number | string | null;
  images?: ProductImageApiItem[];
}

export interface ProductListResponse {
  data: ProductApiItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
}

export interface ProductPayload {
  title: string;
  imageUrl: string;
  imagePublicId: string;
  categoryId: number;
  importPrice: number;
  sellPrice: number;
  quantity: number;
  slug?: string;
  description?: string;
  descriptionContent?: RichTextDocument | null;
  productStatus?: ProductStatus;
  gender?: "WOMEN" | "MEN" | "UNISEX" | "KIDS";
  seoTitle?: string;
  seoDescription?: string;
  images?: Array<{
    id?: number;
    url: string;
    publicId?: string;
    isPrimary: boolean;
    position: number;
  }>;
  variants?: Array<{
    id?: number;
    clientId?: string;
    sku: string;
    size?: string;
    color?: string;
    colorCode?: string;
    price: number;
    importPrice: number;
    quantity: number;
    isActive: boolean;
    images?: Array<{
      id?: number;
      url: string;
      publicId?: string;
      isPrimary: boolean;
      position: number;
    }>;
  }>;
}

export interface ProductItemData {
  id: number;
  title: string;
  imageUrl: string;
  imagePublicId: string;
  categoryId: number;
  categoryName: string;
  importPrice: number;
  sellPrice: number;
  quantity: number;
  totalAvailableStock: number;
  productStatus: ProductStatus;
  organicFavoriteCount?: number;
  favoriteCountAdjustment?: number;
  displayFavoriteCount?: number;
}

export interface ProductFormValues {
  title: string;
  categoryId: string;
  importPrice: string;
  sellPrice: string;
  quantity: string;
  slug: string;
  description: string;
  descriptionContent?: RichTextDocument | null;
  gender: "" | "WOMEN" | "MEN" | "UNISEX" | "KIDS";
  productStatus: ProductStatus;
  seoTitle: string;
  seoDescription: string;
  variants: ProductVariantFormValue[];
  colorGroups?: ProductColorGroupFormValue[];
}

export interface ProductColorGroupFormValue {
  clientId: string;
  colorName: string;
  colorCode: string;
  sourceColorName?: string;
  defaultPrice: string;
  defaultCost: string;
  sharedImages: ProductImageDraftValue[];
  sizes: ProductSizeVariantFormValue[];
}

export interface ProductSizeVariantFormValue {
  id?: number;
  clientId: string;
  sizeName: string;
  sku: string;
  priceOverride: string;
  costOverride: string;
  inheritsPrice: boolean;
  inheritsCost: boolean;
  stock: string;
  isActive: boolean;
  images: ProductImageDraftValue[];
  removedImageIds?: number[];
}

export interface ProductVariantFormValue {
  id?: number;
  clientId: string;
  sku: string;
  size: string;
  color: string;
  colorCode?: string;
  price: string;
  importPrice: string;
  quantity: string;
  isActive: boolean;
  images?: ProductImageDraftValue[];
}

export interface ProductImageDraftValue {
  id?: number;
  clientId: string;
  url: string;
  publicId?: string;
  isPrimary: boolean;
  position: number;
}

export type ProductFormStep =
  "info" | "category" | "images" | "variants" | "review";
export interface ProductDraftApiItem {
  id: number;
  mode: "CREATE" | "EDIT";
  status: "ACTIVE" | "APPLIED" | "DISCARDED";
  originalProductId: number | null;
  currentStep: ProductFormStep | null;
  data: Partial<ProductFormValues> & { images?: ProductImageDraftValue[] };
  version: number;
  updatedAt: string;
  createdAt: string;
  originalProduct?: { id: number; title: string } | null;
}
