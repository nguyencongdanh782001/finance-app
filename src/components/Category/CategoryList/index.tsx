"use client";

import CategoryItem from "@/components/Category/CategoryList/CategoryItem";
import { CategoryItemData } from "@/interface/category";

interface CategoryListProps {
  categories: CategoryItemData[];
  onEdit: (category: CategoryItemData) => void;
  onDelete: (category: CategoryItemData) => void;
}

export default function CategoryList({
  categories,
  onEdit,
  onDelete,
}: CategoryListProps) {
  return (
    <div className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-3">
      {categories.map((category) => (
        <CategoryItem
          key={category.id}
          category={category}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
