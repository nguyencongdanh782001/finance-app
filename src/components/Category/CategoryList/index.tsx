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
    <div className="space-y-4">
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
