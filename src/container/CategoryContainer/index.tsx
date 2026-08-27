"use client";

import CategoryList from "@/components/Category/CategoryList";
import {
  AdminSearchInput,
  AdminSelect,
  AdminToolbar,
} from "@/components/Admin/AdminFields";
import {
  AdminPageContainer,
  AdminPageHeader,
  AdminSection,
} from "@/components/Admin/AdminPage";
import { AdminEmptyState } from "@/components/Admin/AdminState";
import { Button } from "@/components/ui/button";
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
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

const CategoryFormDialog = dynamic(
  () => import("@/components/Category/CategoryFormDialog"),
  {
    ssr: false,
  },
);

const CategoryDeleteDialog = dynamic(
  () => import("@/components/Category/CategoryDeleteDialog"),
  {
    ssr: false,
  },
);

const DEFAULT_FORM_VALUES: CategoryFormValues = {
  name: "",
  color: "#9EE9C8",
  icon: "shirt",
};

const CATEGORY_SORT_OPTIONS = [
  { value: "name-asc", label: "A-Z" },
  { value: "name-desc", label: "Z-A" },
  { value: "products-desc", label: "Nhiều SP" },
  { value: "products-asc", label: "Ít SP" },
] as const;

type CategorySortValue = (typeof CATEGORY_SORT_OPTIONS)[number]["value"];

const DEFAULT_SORT: CategorySortValue = "name-asc";

const mapCategoryFromApi = (category: CategoryApiItem): CategoryItemData => ({
  id: category.id,
  name: category.name,
  color: category.color,
  icon: category.icon,
  productCount: category._count?.products ?? 0,
});

export default function CategoryContainer() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<CategoryItemData[]>([]);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [sortBy, setSortBy] = useState<CategorySortValue>(
    (searchParams.get("sort") as CategorySortValue) || DEFAULT_SORT,
  );
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

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }

    if (sortBy !== DEFAULT_SORT) {
      params.set("sort", sortBy);
    } else {
      params.delete("sort");
    }

    const nextQuery = params.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false,
    });
  }, [search, sortBy, pathname, router]);

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
    const isCreating = formMode === "create";
    const categoryName = values.name;
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
          description: categoryName
            ? `Không thể tạo "${categoryName}". Vui lòng kiểm tra lại thông tin.`
            : "Không thể tạo danh mục. Vui lòng kiểm tra lại thông tin.",
          className: "bg-red-1 text-white text-sm font-medium w-fit",
          duration: 3000,
        });
        return false;
      }
    } else if (selectedCategory) {
      const res = await financeAPI.updateCategory(selectedCategory.id, payload);

      if (res.code !== RESPONSE_CODES.success || !res.data) {
        toast({
          title: "Cập nhật danh mục thất bại",
          description: categoryName
            ? `Không thể cập nhật "${categoryName}". Vui lòng thử lại.`
            : "Không thể cập nhật danh mục. Vui lòng thử lại.",
          className: "bg-red-1 text-white text-sm font-medium w-fit",
          duration: 3000,
        });
        return false;
      }
    }

    setIsFormOpen(false);
    setSelectedCategory(null);
    await fetchCategories();
    toast({
      title: isCreating
        ? "Tạo danh mục thành công"
        : "Cập nhật danh mục thành công",
      description: categoryName
        ? isCreating
          ? `Đã thêm "${categoryName}" vào danh mục`
          : `Đã cập nhật "${categoryName}"`
        : undefined,
      className: "bg-green-16 text-white text-sm font-medium w-fit",
      duration: 3000,
    });
    return true;
  };

  const handleConfirmDelete = async () => {
    if (!selectedCategory) {
      return;
    }

    const deletedCategoryName = selectedCategory.name;

    setIsDeleting(true);
    const res = await financeAPI.deleteCategory(selectedCategory.id);

    if (res.code !== RESPONSE_CODES.success) {
      toast({
        title: "Xóa danh mục thất bại",
        description: deletedCategoryName
          ? `Không thể xóa "${deletedCategoryName}". Vui lòng thử lại.`
          : "Không thể xóa danh mục. Vui lòng thử lại.",
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
    toast({
      title: "Xóa danh mục thành công",
      description: deletedCategoryName
        ? `Đã xóa "${deletedCategoryName}" khỏi danh mục`
        : undefined,
      className: "bg-green-16 text-white text-sm font-medium w-fit",
      duration: 3000,
    });
    setIsDeleting(false);
  };

  const initialValues =
    formMode === "edit" && selectedCategory
      ? {
          name: selectedCategory.name,
          color: selectedCategory.color,
          icon: selectedCategory.icon,
        }
      : DEFAULT_FORM_VALUES;

  const filteredCategories = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const nextCategories = normalizedSearch
      ? categories.filter((category) =>
          category.name.toLowerCase().includes(normalizedSearch),
        )
      : categories;

    return [...nextCategories].sort((first, second) => {
      switch (sortBy) {
        case "name-desc":
          return second.name.localeCompare(first.name, "vi");
        case "products-desc":
          return second.productCount - first.productCount;
        case "products-asc":
          return first.productCount - second.productCount;
        case "name-asc":
        default:
          return first.name.localeCompare(second.name, "vi");
      }
    });
  }, [categories, search, sortBy]);

  return (
    <AdminPageContainer>
      <AdminPageHeader
        title="Danh mục sản phẩm"
        description="Tổ chức sản phẩm theo nhóm để quản lý và tìm kiếm nhanh hơn."
        actions={
          <Button
            type="button"
            variant="adminPrimary"
            className="h-10 rounded-lg"
            onClick={handleCreate}
          >
            <Plus className="size-4" />
            Thêm danh mục
          </Button>
        }
      />

      <AdminSection>
        <AdminToolbar
          search={
            <AdminSearchInput
              value={search}
              onChange={setSearch}
              placeholder="Tìm theo tên danh mục"
            />
          }
          filters={
            <AdminSelect
              name="categorySort"
              value={sortBy}
              options={[...CATEGORY_SORT_OPTIONS]}
              placeholder="Sắp xếp"
              onChange={(value) => setSortBy(value as CategorySortValue)}
            />
          }
          activeFilterCount={
            Number(Boolean(search)) + Number(sortBy !== DEFAULT_SORT)
          }
          onReset={() => {
            setSearch("");
            setSortBy(DEFAULT_SORT);
          }}
          desktopClassName="sm:grid-cols-[minmax(220px,1fr)_minmax(140px,180px)_auto]"
        />

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-[var(--admin-border)] pt-4">
          <h2 className="text-base font-semibold text-[var(--admin-text)]">
            Danh sách danh mục
          </h2>
          <p className="whitespace-nowrap text-sm text-[var(--admin-text-secondary)]">
            {filteredCategories.length} danh mục
          </p>
        </div>

        <div className="mt-4">
          {isLoading ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <Skeleton key={item} className="h-20 rounded-xl" />
              ))}
            </div>
          ) : filteredCategories.length === 0 ? (
            <AdminEmptyState
              title="Chưa có danh mục phù hợp"
              description="Thử thay đổi từ khóa hoặc tạo danh mục đầu tiên."
            />
          ) : (
            <CategoryList
              categories={filteredCategories}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
            />
          )}
        </div>
      </AdminSection>

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
    </AdminPageContainer>
  );
}
