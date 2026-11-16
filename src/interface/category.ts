import { LucideIcon } from "lucide-react";
import type { TryOnCategory } from "@/interface/product";

export interface CategoryItemData {
  id: number;
  name: string;
  slug?: string | null;
  parentId?: number | null;
  description?: string;
  color: string;
  icon: string;
  tryOnCategory?: TryOnCategory;
  productCount: number;
}

export interface CategoryColorOption {
  value: string;
  label: string;
  className: string;
  ringClassName: string;
}

export interface CategoryIconOption {
  value: string;
  label: string;
  icon: LucideIcon;
}

export interface CategoryFormValues {
  name: string;
  color: string;
  icon: string;
  tryOnCategory: TryOnCategory;
}

export interface CategoryApiItem {
  id: number;
  name: string;
  color: string;
  icon: string;
  tryOnCategory?: TryOnCategory;
  _count?: {
    products: number;
  };
  parentId?: number | null;
  parent?: { id: number; name: string } | null;
  children?: CategoryApiItem[];
  isActive?: boolean;
  slug?: string | null;
}

export interface CategoryPayload {
  name: string;
  color: string;
  icon: string;
  slug?: string;
  parentId?: number | null;
  description?: string;
  tryOnCategory?: TryOnCategory;
}
