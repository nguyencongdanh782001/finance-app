import { CategoryApiItem } from "@/interface/category";

export type ProductStatus = "DRAFT" | "ACTIVE" | "ARCHIVED" | "OUT_OF_STOCK";

export interface ProductApiItem {
  id: number;
  title: string;
  imageUrl: string;
  imagePublicId: string;
  categoryId: number;
  importPrice: number | string;
  sellPrice: number | string;
  quantity: number;
  category: CategoryApiItem;
  variants?: ProductVariantApiItem[];
  description?: string | null;
  slug?: string | null;
  productStatus?: ProductStatus | null;
  visibility?: "PUBLIC" | "HIDDEN" | "PRIVATE";
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
  size: string | null;
  color: string | null;
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
  productStatus?: ProductStatus;
  visibility?: "PUBLIC" | "HIDDEN" | "PRIVATE";
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
  productStatus: ProductStatus;
}

export interface ProductFormValues {
  title: string;
  categoryId: string;
  importPrice: string;
  sellPrice: string;
  quantity: string;
  slug: string;
  description: string;
  gender: "" | "WOMEN" | "MEN" | "UNISEX" | "KIDS";
  productStatus: ProductStatus;
  visibility: "PUBLIC" | "HIDDEN" | "PRIVATE";
  seoTitle: string;
  seoDescription: string;
  variants: ProductVariantFormValue[];
}

export interface ProductVariantFormValue {
  id?: number;
  clientId: string;
  sku: string;
  size: string;
  color: string;
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
