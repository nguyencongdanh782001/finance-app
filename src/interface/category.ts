import { LucideIcon } from "lucide-react";

export interface CategoryItemData {
  id: number;
  name: string;
  description?: string;
  color: string;
  icon: string;
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
}

export interface CategoryApiItem {
  id: number;
  name: string;
  color: string;
  icon: string;
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
}
