"use client";

import CategoryDeleteDialog from "@/components/Category/CategoryDeleteDialog";
import CategoryFormDialog from "@/components/Category/CategoryFormDialog";
import CategoryList from "@/components/Category/CategoryList";
import Navbar from "@/components/common/Navbar";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import { RESPONSE_CODES } from "@/constant/codes";
import { financeAPI } from "@/endpoint/financeAPI";
import { toast } from "@/hook/use-toast";
import {
  CategoryApiItem,
  CategoryFormValues,
  CategoryItemData,
} from "@/interface/category";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

const DEFAULT_FORM_VALUES: CategoryFormValues = {
  name: "",
  description: "",
  color: "#9EE9C8",
  icon: "shirt",
};

const CATEGORY_DESCRIPTION_FALLBACK =
  "Danh mục đang được quản lý bằng dữ liệu lấy trực tiếp từ API.";

const mapCategoryFromApi = (category: CategoryApiItem): CategoryItemData => ({
  id: category.id,
  name: category.name,
  color: category.color,
  icon: category.icon,
  productCount: category._count?.products ?? 0,
  description: CATEGORY_DESCRIPTION_FALLBACK,
});

export default function CategoryContainer() {
  const [categories, setCategories] = useState<CategoryItemData[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryItemData | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCategories = async (showLoading = false) => {
    if (showLoading) {
      setIsLoading(true);
    }

    const res = await financeAPI.getCategoryList();

    if (res.code === RESPONSE_CODES.success && res.data) {
      setCategories(res.data.map(mapCategoryFromApi));
    } else {
      toast({
        title: "Không tải được danh mục",
        className: "bg-red-1 text-white text-sm font-medium w-fit",
        duration: 3000,
      });
    }

    if (showLoading) {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories(true);
  }, []);

  const handleCreate = () => {
    setFormMode("create");
    setSelectedCategory(null);
    setIsFormOpen(true);
  };

  const handleEdit = (category: CategoryItemData) => {
    setFormMode("edit");
    setSelectedCategory(category);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (category: CategoryItemData) => {
    setSelectedCategory(category);
    setIsDeleteOpen(true);
  };

  const handleDeleteFromForm = () => {
    if (!selectedCategory) {
      return;
    }

    setIsFormOpen(false);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (values: CategoryFormValues) => {
    const payload = {
      name: values.name,
      color: values.color,
      icon: values.icon,
    };

    if (formMode === "create") {
      const res = await financeAPI.createCategory(payload);

      if (res.code !== RESPONSE_CODES.success || !res.data) {
        toast({
          title: "Tạo danh mục thất bại",
          className: "bg-red-1 text-white text-sm font-medium w-fit",
          duration: 3000,
        });
        return;
      }
    } else if (selectedCategory) {
      const res = await financeAPI.updateCategory(selectedCategory.id, payload);

      if (res.code !== RESPONSE_CODES.success || !res.data) {
        toast({
          title: "Cập nhật danh mục thất bại",
          className: "bg-red-1 text-white text-sm font-medium w-fit",
          duration: 3000,
        });
        return;
      }
    }

    setIsFormOpen(false);
    setSelectedCategory(null);
    await fetchCategories();
  };

  const handleConfirmDelete = async () => {
    if (!selectedCategory) {
      return;
    }

    setIsDeleting(true);
    const res = await financeAPI.deleteCategory(selectedCategory.id);

    if (res.code !== RESPONSE_CODES.success) {
      toast({
        title: "Xóa danh mục thất bại",
        className: "bg-red-1 text-white text-sm font-medium w-fit",
        duration: 3000,
      });
      setIsDeleting(false);
      return;
    }

    setIsDeleteOpen(false);
    setIsFormOpen(false);
    setSelectedCategory(null);
    await fetchCategories();
    setIsDeleting(false);
  };

  const initialValues =
    formMode === "edit" && selectedCategory
      ? {
          name: selectedCategory.name,
          description: selectedCategory.description || "",
          color: selectedCategory.color,
          icon: selectedCategory.icon,
        }
      : DEFAULT_FORM_VALUES;

  return (
    <div className="sm:max-w-191.25 mx-auto">
      <div className="sticky top-0 z-10 bg-white py-6 border-b border-blue-1 shadow flex items-center justify-between px-5">
        <p className="text-lg font-extrabold text-slate-700">
          Danh mục sản phẩm
        </p>

        <Button
          type="button"
          onClick={handleCreate}
          className="h-9 rounded-full bg-green-18 px-3 text-green-15 hover:bg-green-14"
        >
          <Plus className="size-4" />
        </Button>
      </div>
      <Container className="pb-32 min-h-[calc(100svh-117px)]!">
        <div className="overflow-hidden py-0 border-0 shadow-none bg-none">
          <div className="py-5">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="rounded-[26px] border border-[#edf2f7] bg-white px-4 py-4 shadow-[0_12px_30px_rgba(148,163,184,0.08)]"
                  >
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-14 w-14 rounded-[18px]" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-28 rounded-full" />
                        <Skeleton className="h-3 w-20 rounded-full" />
                      </div>
                      <Skeleton className="h-9 w-9 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <CategoryList
                categories={categories}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
              />
            )}
          </div>
        </div>
      </Container>

      <CategoryFormDialog
        open={isFormOpen}
        mode={formMode}
        initialValues={initialValues}
        isDeleting={isDeleting}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmit}
        onDelete={formMode === "edit" ? handleDeleteFromForm : undefined}
      />

      <CategoryDeleteDialog
        open={isDeleteOpen}
        category={selectedCategory}
        isDeleting={isDeleting}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleConfirmDelete}
      />

      <Navbar />
    </div>
  );
}
