"use client";

import ProductDeleteDialog from "@/components/Product/ProductDeleteDialog";
import ProductFormDialog from "@/components/Product/ProductFormDialog";
import ProductList from "@/components/Product/ProductList";
import Navbar from "@/components/common/Navbar";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import { RESPONSE_CODES } from "@/constant/codes";
import { financeAPI } from "@/endpoint/financeAPI";
import { toast } from "@/hook/use-toast";
import { CategoryItemData, CategoryApiItem } from "@/interface/category";
import {
  ProductApiItem,
  ProductFormValues,
  ProductItemData,
} from "@/interface/product";
import { Plus, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const DEFAULT_FORM_VALUES: ProductFormValues = {
  title: "",
  categoryId: "",
  importPrice: "",
  sellPrice: "",
  quantity: "1",
};

const mapCategoryFromApi = (category: CategoryApiItem): CategoryItemData => ({
  id: category.id,
  name: category.name,
  color: category.color,
  icon: category.icon,
  productCount: category._count?.products ?? 0,
  description: "",
});

const mapProductFromApi = (product: ProductApiItem): ProductItemData => ({
  id: product.id,
  title: product.title,
  imageUrl: product.imageUrl,
  imagePublicId: product.imagePublicId,
  categoryId: product.categoryId,
  categoryName: product.category.name,
  importPrice: Number(product.importPrice),
  sellPrice: Number(product.sellPrice),
  quantity: product.quantity,
});

export default function ProductContainer() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [products, setProducts] = useState<ProductItemData[]>([]);
  const [categories, setCategories] = useState<CategoryItemData[]>([]);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [categoryFilter, setCategoryFilter] = useState(
    searchParams.get("categoryId") || "",
  );
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<ProductItemData | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const limit = 12;

  const fetchCategories = async () => {
    const res = await financeAPI.getCategoryList();

    if (res.code === RESPONSE_CODES.success && res.data) {
      setCategories(res.data.map(mapCategoryFromApi));
    }
  };

  const fetchProducts = async (
    nextPage = 1,
    options?: { showLoading?: boolean; append?: boolean },
  ) => {
    const showLoading = options?.showLoading ?? false;
    const append = options?.append ?? false;

    if (showLoading) {
      setIsInitialLoading(true);
    }

    if (append) {
      setIsFetchingMore(true);
    }

    const res = await financeAPI.getProductList({
      search: search || undefined,
      categoryId: categoryFilter ? Number(categoryFilter) : undefined,
      page: nextPage,
      limit,
    });

    if (res.code === RESPONSE_CODES.success && res.data) {
      const mappedProducts = res.data.data.map(mapProductFromApi);

      setProducts((prev) =>
        append
          ? [
              ...prev,
              ...mappedProducts.filter(
                (item) => !prev.some((prevItem) => prevItem.id === item.id),
              ),
            ]
          : mappedProducts,
      );
      setPage(res.data.pagination.page);
      setTotalPage(res.data.pagination.totalPage);
    } else {
      toast({
        title: "Không tải được sản phẩm",
        className: "bg-red-1 text-white text-sm font-medium w-fit",
        duration: 3000,
      });
    }

    if (showLoading) {
      setIsInitialLoading(false);
    }

    if (append) {
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await Promise.all([
        fetchCategories(),
        fetchProducts(1, { showLoading: true }),
      ]);
    };

    init();
  }, []);

  useEffect(() => {
    if (isInitialLoading) {
      return;
    }

    const timeout = window.setTimeout(() => {
      fetchProducts(1);
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [search, categoryFilter]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }

    if (categoryFilter) {
      params.set("categoryId", categoryFilter);
    } else {
      params.delete("categoryId");
    }

    const nextQuery = params.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false,
    });
  }, [search, categoryFilter, pathname, router]);

  useEffect(() => {
    const node = loadMoreRef.current;

    if (!node || isInitialLoading || isFetchingMore || page >= totalPage) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;

        if (entry.isIntersecting) {
          fetchProducts(page + 1, { append: true });
        }
      },
      {
        rootMargin: "120px",
      },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [
    isInitialLoading,
    isFetchingMore,
    page,
    totalPage,
    search,
    categoryFilter,
  ]);

  const handleOpenCreate = () => {
    setFormMode("create");
    setSelectedProduct(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (product: ProductItemData) => {
    setFormMode("edit");
    setSelectedProduct(product);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (product: ProductItemData) => {
    setSelectedProduct(product);
    setIsDeleteOpen(true);
  };

  const handleDeleteFromForm = () => {
    if (!selectedProduct) {
      return;
    }

    setIsFormOpen(false);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (
    values: ProductFormValues,
    imageFile?: File | null,
  ) => {
    let imageUrl = selectedProduct?.imageUrl || "";
    let imagePublicId = selectedProduct?.imagePublicId || "";

    if (imageFile) {
      const uploadRes = await financeAPI.uploadImage(imageFile);

      if (
        uploadRes.code !== RESPONSE_CODES.success ||
        !uploadRes.data?.url ||
        !uploadRes.data?.publicId
      ) {
        toast({
          title: "Upload ảnh thất bại",
          className: "bg-red-1 text-white text-sm font-medium w-fit",
          duration: 3000,
        });
        return;
      }

      imageUrl = uploadRes.data.url;
      imagePublicId = uploadRes.data.publicId;
    }

    if (formMode === "create" && (!imageUrl || !imagePublicId)) {
      toast({
        title: "Vui lòng chọn ảnh sản phẩm",
        className: "bg-red-1 text-white text-sm font-medium w-fit",
        duration: 3000,
      });
      return;
    }

    const payload = {
      title: values.title,
      imageUrl,
      imagePublicId,
      categoryId: Number(values.categoryId),
      importPrice: Number(values.importPrice),
      sellPrice: Number(values.sellPrice),
      quantity: Number(values.quantity),
    };

    if (formMode === "create") {
      const res = await financeAPI.createProduct(payload);

      if (res.code !== RESPONSE_CODES.success || !res.data) {
        toast({
          title: "Tạo sản phẩm thất bại",
          className: "bg-red-1 text-white text-sm font-medium w-fit",
          duration: 3000,
        });
        return;
      }
    } else if (selectedProduct) {
      const res = await financeAPI.updateProduct(selectedProduct.id, payload);

      if (res.code !== RESPONSE_CODES.success) {
        toast({
          title: "Cập nhật sản phẩm thất bại",
          className: "bg-red-1 text-white text-sm font-medium w-fit",
          duration: 3000,
        });
        return;
      }
    }

    setIsFormOpen(false);
    setSelectedProduct(null);
    await fetchProducts(1);
    await fetchCategories();
  };

  const handleConfirmDelete = async () => {
    if (!selectedProduct) {
      return;
    }

    setIsDeleting(true);
    const res = await financeAPI.deleteProduct(selectedProduct.id);

    if (res.code !== RESPONSE_CODES.success) {
      toast({
        title: "Xóa sản phẩm thất bại",
        className: "bg-red-1 text-white text-sm font-medium w-fit",
        duration: 3000,
      });
      setIsDeleting(false);
      return;
    }

    setIsDeleteOpen(false);
    setIsFormOpen(false);
    setSelectedProduct(null);
    await fetchProducts(1);
    await fetchCategories();
    setIsDeleting(false);
  };

  const initialValues =
    formMode === "edit" && selectedProduct
      ? {
          title: selectedProduct.title,
          categoryId: String(selectedProduct.categoryId),
          importPrice: String(selectedProduct.importPrice),
          sellPrice: String(selectedProduct.sellPrice),
          quantity: String(selectedProduct.quantity),
        }
      : DEFAULT_FORM_VALUES;

  return (
    <div className="sm:max-w-191.25 mx-auto">
      <div className="sticky top-0 z-10 bg-white py-6 border-b border-blue-1 shadow px-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-extrabold text-slate-700">Sản phẩm</p>
            <p className="text-10px font-bold uppercase tracking-[0.08em] text-slate-300">
              Quản lý kho hàng
            </p>
          </div>

          <Button
            type="button"
            onClick={handleOpenCreate}
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
              placeholder="Tìm kiếm theo tên hoặc mã sản phẩm..."
              className="w-full bg-transparent text-sm font-medium text-slate-600 outline-none placeholder:text-slate-300"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1">
          <Button
            type="button"
            onClick={() => setCategoryFilter("")}
            className={`h-8 rounded-full px-4 text-11px font-bold uppercase ${
              !categoryFilter
                ? "bg-green-2 text-white"
                : "bg-slate-100 text-slate-400 hover:bg-slate-200"
            }`}
          >
            Tất cả
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              type="button"
              onClick={() => setCategoryFilter(String(category.id))}
              className={`h-8 rounded-full px-4 text-11px font-bold uppercase ${
                categoryFilter === String(category.id)
                  ? "bg-green-2 text-white"
                  : "bg-slate-100 text-slate-400 hover:bg-slate-200"
              }`}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      <Container className="pb-32 min-h-[calc(100svh-204px)]!">
        <div className="py-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-11px font-bold uppercase tracking-[0.08em] text-slate-300">
              Danh sách mặt hàng
            </p>
            <p className="text-10px font-bold text-slate-300">
              {products.length} sản phẩm
            </p>
          </div>

          {isInitialLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="rounded-[28px] bg-white px-4 py-4 shadow-[0_16px_40px_rgba(148,163,184,0.10)]"
                >
                  <div className="flex gap-3">
                    <Skeleton className="h-23 w-23 rounded-[24px]" />
                    <div className="flex-1 space-y-3">
                      <Skeleton className="h-4 w-40 rounded-full" />
                      <Skeleton className="h-3 w-24 rounded-full" />
                      <div className="flex gap-4">
                        <Skeleton className="h-8 w-24 rounded-xl" />
                        <Skeleton className="h-8 w-24 rounded-xl" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <ProductList
                products={products}
                onEdit={handleOpenEdit}
                onDelete={handleDeleteClick}
              />

              <div ref={loadMoreRef} className="h-6 w-full" />

              {isFetchingMore && (
                <div className="mt-4 space-y-4">
                  {[1, 2].map((item) => (
                    <div
                      key={`loading-more-${item}`}
                      className="rounded-[28px] bg-white px-4 py-4 shadow-[0_16px_40px_rgba(148,163,184,0.10)]"
                    >
                      <div className="flex gap-3">
                        <Skeleton className="h-23 w-23 rounded-[24px]" />
                        <div className="flex-1 space-y-3">
                          <Skeleton className="h-4 w-40 rounded-full" />
                          <Skeleton className="h-3 w-24 rounded-full" />
                          <div className="flex gap-4">
                            <Skeleton className="h-8 w-24 rounded-xl" />
                            <Skeleton className="h-8 w-24 rounded-xl" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </Container>

      <ProductFormDialog
        open={isFormOpen}
        mode={formMode}
        categories={categories}
        initialValues={initialValues}
        initialImageUrl={selectedProduct?.imageUrl}
        isDeleting={isDeleting}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmit}
        onDelete={formMode === "edit" ? handleDeleteFromForm : undefined}
      />

      <ProductDeleteDialog
        open={isDeleteOpen}
        product={selectedProduct}
        isDeleting={isDeleting}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleConfirmDelete}
      />

      <Navbar />
    </div>
  );
}
