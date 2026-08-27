import { CategoryApiItem } from "@/interface/category";

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
}

export interface ProductFormValues {
  title: string;
  categoryId: string;
  importPrice: string;
  sellPrice: string;
  quantity: string;
}
