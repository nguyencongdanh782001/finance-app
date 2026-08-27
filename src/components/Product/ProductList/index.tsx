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
    <div className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-3">
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
