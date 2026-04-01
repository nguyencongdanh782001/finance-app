"use client";

import ProductItem from "@/components/Product/ProductList/ProductItem";
import { ProductItemData } from "@/interface/product";

interface ProductListProps {
  products: ProductItemData[];
  onEdit: (product: ProductItemData) => void;
  onDelete: (product: ProductItemData) => void;
}

export default function ProductList({
  products,
  onEdit,
  onDelete,
}: ProductListProps) {
  return (
    <div className="space-y-4">
      {products.map((product) => (
        <ProductItem
          key={product.id}
          product={product}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
