"use client";

import CategoryDeleteDialog from "@/components/Category/CategoryDeleteDialog";
import CategoryFormDialog from "@/components/Category/CategoryFormDialog";
import CategoryList from "@/components/Category/CategoryList";
import Navbar from "@/components/common/Navbar";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { RESPONSE_CODES } from "@/constant/codes";
import { financeAPI } from "@/endpoint/financeAPI";
import { toast } from "@/hook/use-toast";
import {
  CategoryApiItem,
  CategoryFormValues,
  CategoryItemData,
} from "@/interface/category";
import { ArrowUpDown, Check, ChevronDown, Plus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

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

  const selectedSort =
    CATEGORY_SORT_OPTIONS.find((option) => option.value === sortBy) ??
    CATEGORY_SORT_OPTIONS[0];

  return (
    <div className="sm:max-w-191.25 mx-auto">
      <div className="sticky top-0 z-10 bg-white py-6 border-b border-blue-1 shadow px-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-extrabold text-slate-700">
              Danh mục sản phẩm
            </p>
            <p className="text-10px font-bold uppercase tracking-[0.08em] text-slate-300">
              Quản lý nhóm hàng
            </p>
          </div>

          <Button
            type="button"
            onClick={handleCreate}
            className="h-9 rounded-full bg-green-18 px-3 text-green-15 hover:bg-green-14"
          >
            <Plus className="size-4" />
          </Button>
        </div>

        <div className="mt-4 rounded-full bg-slate-50 px-4 py-3">
          <div className="flex items-center gap-2 text-slate-400">
            <Search className="size-4" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm kiếm theo tên danh mục..."
              className="w-full bg-transparent text-sm font-medium text-slate-600 outline-none placeholder:text-slate-300"
            />
          </div>
        </div>
      </div>
      <Container className="pb-32 min-h-[calc(100svh-117px)]!">
        <div className="overflow-hidden py-0 border-0 shadow-none bg-none">
          <div className="py-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-11px font-bold uppercase tracking-[0.08em] text-slate-300">
                Danh sách danh mục
              </p>
              <div className="flex items-center gap-2">
                <p className="text-10px font-bold text-slate-300">
                  {filteredCategories.length} danh mục
                </p>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-8 rounded-full border border-slate-200 bg-white px-2.5 text-11px! font-semibold text-slate-600 shadow-sm hover:bg-slate-50"
                    >
                      <ArrowUpDown className="size-3" />
                      {selectedSort.label}
                      <ChevronDown className="size-3 text-slate-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-36 p-1">
                    {CATEGORY_SORT_OPTIONS.map((option) => (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() => setSortBy(option.value)}
                        className={
                          sortBy === option.value
                            ? "px-2.5 py-2 text-11px bg-slate-50 text-slate-700"
                            : "px-2.5 py-2 text-11px text-slate-500"
                        }
                      >
                        <span className="flex-1">{option.label}</span>
                        {sortBy === option.value ? (
                          <Check className="size-4 text-green-16" />
                        ) : null}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

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
                categories={filteredCategories}
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
