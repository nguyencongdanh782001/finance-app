"use client";

import ProductItem from "@/components/Product/ProductList/ProductItem";
import { ProductItemData, ProductStatus } from "@/interface/product";

interface ProductListProps {
  products: ProductItemData[];
  onEdit: (product: ProductItemData) => void;
  onDelete: (product: ProductItemData) => void;
  onStatusChange: (product: ProductItemData, status: ProductStatus) => void;
  updatingStatusIds: Set<number>;
}

export default function ProductList({
  products,
  onEdit,
  onDelete,
  onStatusChange,
  updatingStatusIds,
}: ProductListProps) {
  return (
    <div className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => (
        <ProductItem
          key={product.id}
          product={product}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
          isStatusUpdating={updatingStatusIds.has(product.id)}
        />
      ))}
    </div>
  );
}
