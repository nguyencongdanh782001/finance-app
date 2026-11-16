"use client";

import ProductList from "@/components/Product/ProductList";
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
import { CategoryItemData, CategoryApiItem } from "@/interface/category";
import {
  ProductApiItem,
  ProductFormValues,
  ProductItemData,
  ProductStatus,
} from "@/interface/product";
import { ProductImageDraft } from "@/components/Product/ProductFormDialog";
import { FileSpreadsheet, LoaderCircle, Plus } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useDebouncedValue } from "@/hook/use-debounced-value";

const ProductFormDialog = dynamic(
  () => import("@/components/Product/ProductFormDialog"),
  {
    ssr: false,
  },
);

const ProductDeleteDialog = dynamic(
  () => import("@/components/Product/ProductDeleteDialog"),
  {
    ssr: false,
  },
);

const PRODUCT_SORT_OPTIONS = [
  { value: "createdAt-desc", label: "Mới nhất" },
  { value: "createdAt-asc", label: "Cũ nhất" },
  { value: "title-asc", label: "A-Z" },
  { value: "title-desc", label: "Z-A" },
] as const;

type ProductSortValue = (typeof PRODUCT_SORT_OPTIONS)[number]["value"];

const DEFAULT_SORT: ProductSortValue = "createdAt-desc";
const PRODUCT_LIST_RETURN_STATE = "admin-products-return-state";
const PRICE_FILTER_DEBOUNCE_MS = 300;

const DEFAULT_FORM_VALUES: ProductFormValues = {
  title: "",
  categoryId: "",
  importPrice: "",
  sellPrice: "",
  quantity: "1",
  slug: "",
  description: "",
  gender: "",
  productStatus: "PRIVATE",
  seoTitle: "",
  seoDescription: "",
  variants: [],
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
  totalAvailableStock: product.totalAvailableStock ?? product.quantity,
  productStatus: product.productStatus || "PRIVATE",
  organicFavoriteCount: product.organicFavoriteCount ?? 0,
  favoriteCountAdjustment: product.favoriteCountAdjustment ?? 0,
  displayFavoriteCount:
    product.displayFavoriteCount ??
    (product.organicFavoriteCount ?? 0) +
      (product.favoriteCountAdjustment ?? 0),
});

export default function ProductContainer() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const productRequestId = useRef(0);
  const [products, setProducts] = useState<ProductItemData[]>([]);
  const [categories, setCategories] = useState<CategoryItemData[]>([]);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const debouncedSearch = useDebouncedValue(search.trim(), 300);
  const [categoryFilter, setCategoryFilter] = useState(
    searchParams.get("categoryId") || "",
  );
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [stockFilter, setStockFilter] = useState(
    searchParams.get("stockStatus") || "",
  );
  const debouncedMinPrice = useDebouncedValue(
    minPrice.trim(),
    PRICE_FILTER_DEBOUNCE_MS,
  );
  const debouncedMaxPrice = useDebouncedValue(
    maxPrice.trim(),
    PRICE_FILTER_DEBOUNCE_MS,
  );
  const [sortBy, setSortBy] = useState<ProductSortValue>(
    (searchParams.get("sort") as ProductSortValue) || DEFAULT_SORT,
  );
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updatingStatusIds, setUpdatingStatusIds] = useState<Set<number>>(
    () => new Set(),
  );
  const [selectedProduct, setSelectedProduct] =
    useState<ProductItemData | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [productDetail, setProductDetail] = useState<ProductApiItem | null>(
    null,
  );
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
    const requestId = ++productRequestId.current;
    const showLoading = options?.showLoading ?? false;
    const append = options?.append ?? false;
    const refresh = !showLoading && !append;

    if (showLoading) {
      setIsInitialLoading(true);
    }

    if (append) {
      setIsFetchingMore(true);
    }

    if (refresh) {
      setIsRefreshing(true);
    }

    const res = await financeAPI.getProductList({
      search: debouncedSearch || undefined,
      categoryId: categoryFilter ? Number(categoryFilter) : undefined,
      minPrice: debouncedMinPrice ? Number(debouncedMinPrice) : undefined,
      maxPrice: debouncedMaxPrice ? Number(debouncedMaxPrice) : undefined,
      stockStatus:
        stockFilter === "IN_STOCK" || stockFilter === "OUT_OF_STOCK"
          ? stockFilter
          : undefined,
      sort: sortBy,
      page: nextPage,
      limit,
    });

    if (requestId !== productRequestId.current) return;

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

    if (refresh) {
      setIsRefreshing(false);
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

    setPage(1);
    void fetchProducts(1);
  }, [
    debouncedSearch,
    categoryFilter,
    debouncedMinPrice,
    debouncedMaxPrice,
    stockFilter,
    sortBy,
  ]);

  useEffect(() => {
    if (isInitialLoading) return;

    try {
      const stored = sessionStorage.getItem(PRODUCT_LIST_RETURN_STATE);
      if (!stored) return;
      const state = JSON.parse(stored) as { scrollY?: number };
      const scrollY = Number(state.scrollY);
      if (!Number.isFinite(scrollY)) {
        sessionStorage.removeItem(PRODUCT_LIST_RETURN_STATE);
        return;
      }

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo({ top: scrollY, behavior: "instant" });
          sessionStorage.removeItem(PRODUCT_LIST_RETURN_STATE);
        });
      });
    } catch {
      sessionStorage.removeItem(PRODUCT_LIST_RETURN_STATE);
    }
  }, [isInitialLoading]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    } else {
      params.delete("search");
    }

    if (categoryFilter) {
      params.set("categoryId", categoryFilter);
    } else {
      params.delete("categoryId");
    }

    if (debouncedMinPrice) {
      params.set("minPrice", debouncedMinPrice);
    } else {
      params.delete("minPrice");
    }

    if (debouncedMaxPrice) {
      params.set("maxPrice", debouncedMaxPrice);
    } else {
      params.delete("maxPrice");
    }

    if (stockFilter) {
      params.set("stockStatus", stockFilter);
    } else {
      params.delete("stockStatus");
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
  }, [
    debouncedSearch,
    categoryFilter,
    debouncedMinPrice,
    debouncedMaxPrice,
    stockFilter,
    sortBy,
    pathname,
    router,
  ]);

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
    debouncedMinPrice,
    debouncedMaxPrice,
    stockFilter,
    sortBy,
  ]);

  const handleOpenCreate = () => {
    router.push("/admin/products/new");
  };

  const handleOpenEdit = (product: ProductItemData) => {
    const returnQuery = searchParams.toString();
    try {
      sessionStorage.setItem(
        PRODUCT_LIST_RETURN_STATE,
        JSON.stringify({ scrollY: window.scrollY }),
      );
    } catch {
      // Navigation still works when sessionStorage is unavailable.
    }
    router.push(
      `/admin/products/${product.id}/edit${returnQuery ? `?returnQuery=${encodeURIComponent(returnQuery)}` : ""}`,
    );
  };

  const handleDeleteClick = (product: ProductItemData) => {
    setSelectedProduct(product);
    setIsDeleteOpen(true);
  };

  const handleStatusChange = async (
    product: ProductItemData,
    productStatus: ProductStatus,
  ) => {
    if (
      product.productStatus === productStatus ||
      updatingStatusIds.has(product.id)
    ) {
      return;
    }

    const previousStatus = product.productStatus;
    setUpdatingStatusIds((current) => new Set(current).add(product.id));
    setProducts((current) =>
      current.map((item) =>
        item.id === product.id ? { ...item, productStatus } : item,
      ),
    );

    const rollbackStatus = () =>
      setProducts((current) =>
        current.map((item) =>
          item.id === product.id
            ? { ...item, productStatus: previousStatus }
            : item,
        ),
      );

    const showUpdateError = () =>
      toast({
        title: "Không thể đổi trạng thái sản phẩm",
        description: `Trạng thái của “${product.title}” đã được hoàn tác.`,
        className: "bg-red-1 text-white text-sm font-medium w-fit",
        duration: 3000,
      });

    try {
      const response = await financeAPI.updateProductStatus(
        product.id,
        productStatus,
      );

      if (response.code !== RESPONSE_CODES.success || !response.data) {
        rollbackStatus();
        showUpdateError();
        return;
      }

      const confirmedStatus = response.data.productStatus;
      setProducts((current) =>
        current.map((item) =>
          item.id === product.id
            ? { ...item, productStatus: confirmedStatus }
            : item,
        ),
      );
      toast({
        title: "Đã cập nhật trạng thái sản phẩm",
        description: `Thay đổi cho “${product.title}” đã được lưu.`,
        className: "bg-green-16 text-white text-sm font-medium w-fit",
        duration: 2500,
      });
    } catch {
      rollbackStatus();
      showUpdateError();
    } finally {
      setUpdatingStatusIds((current) => {
        const next = new Set(current);
        next.delete(product.id);
        return next;
      });
    }
  };

  const handleAdjustFavorites = async (product: ProductItemData) => {
    const current = product.displayFavoriteCount ?? 0;
    const value = window.prompt(
      `Lượt yêu thích hiển thị cho “${product.title}”:`,
      String(current),
    );
    if (value === null) return;
    const desiredDisplayCount = Number(value);
    if (!Number.isInteger(desiredDisplayCount) || desiredDisplayCount < 0) {
      toast({
        title: "Giá trị không hợp lệ",
        description: "Vui lòng nhập một số nguyên không âm.",
        className: "bg-red-1 text-white text-sm font-medium w-fit",
        duration: 3000,
      });
      return;
    }
    const response = await fetch(
      `/api/admin/products/${product.id}/favorites`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ desiredDisplayCount }),
      },
    );
    if (!response.ok) {
      toast({
        title: "Không thể điều chỉnh lượt yêu thích",
        className: "bg-red-1 text-white text-sm font-medium w-fit",
        duration: 3000,
      });
      return;
    }
    const updated = (await response.json()) as ProductItemData;
    setProducts((currentProducts) =>
      currentProducts.map((item) =>
        item.id === product.id
          ? {
              ...item,
              organicFavoriteCount: updated.organicFavoriteCount,
              favoriteCountAdjustment: updated.favoriteCountAdjustment,
              displayFavoriteCount: updated.displayFavoriteCount,
            }
          : item,
      ),
    );
    toast({
      title: "Đã cập nhật lượt yêu thích",
      className: "bg-green-16 text-white text-sm font-medium w-fit",
      duration: 2500,
    });
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
    imageFiles: File[],
    imageDrafts: ProductImageDraft[],
  ) => {
    const isCreating = formMode === "create";
    const productTitle = values.title;
    let imageUrl = selectedProduct?.imageUrl || "";
    let imagePublicId = selectedProduct?.imagePublicId || "";
    const uploadedImagePublicIds: string[] = [];

    const cleanupUploadedImage = async () => {
      if (!uploadedImagePublicIds.length) {
        return;
      }

      try {
        await Promise.all(
          uploadedImagePublicIds.map((publicId) =>
            financeAPI.deleteUploadedImage(publicId),
          ),
        );
      } catch (error) {
        console.error("Cleanup uploaded product image failed", {
          publicIds: uploadedImagePublicIds,
          error,
        });
      }
    };

    const uploadedDrafts: ProductImageDraft[] = [];
    for (const draft of imageDrafts) {
      if (!draft.file) {
        uploadedDrafts.push(draft);
        continue;
      }
      const uploadRes = await financeAPI.uploadImage(draft.file);

      if (
        uploadRes.code !== RESPONSE_CODES.success ||
        !uploadRes.data?.url ||
        !uploadRes.data?.publicId
      ) {
        toast({
          title: "Upload ảnh thất bại",
          description: productTitle
            ? `Không thể tải ảnh cho "${productTitle}". Vui lòng thử lại.`
            : "Không thể tải ảnh sản phẩm. Vui lòng thử lại.",
          className: "bg-red-1 text-white text-sm font-medium w-fit",
          duration: 3000,
        });
        await cleanupUploadedImage();
        return false;
      }

      uploadedDrafts.push({
        ...draft,
        url: uploadRes.data.url,
        publicId: uploadRes.data.publicId,
        file: undefined,
      });
      uploadedImagePublicIds.push(uploadRes.data.publicId);
    }

    const primary =
      uploadedDrafts.find((image) => image.isPrimary) || uploadedDrafts[0];
    imageUrl = primary?.url || imageUrl;
    imagePublicId = primary?.publicId || imagePublicId;

    const payload = {
      title: values.title,
      imageUrl: imageUrl || "",
      imagePublicId: imagePublicId || "",
      categoryId: Number(values.categoryId),
      importPrice: Number(values.importPrice),
      sellPrice: Number(values.sellPrice),
      quantity: Number(values.quantity),
      slug: values.slug || undefined,
      description: values.description || undefined,
      productStatus: values.productStatus,
      gender: values.gender || undefined,
      seoTitle: values.seoTitle || undefined,
      seoDescription: values.seoDescription || undefined,
      images: uploadedDrafts.map((image, position) => ({
        id: image.id,
        url: image.url,
        publicId: image.publicId,
        isPrimary: image.isPrimary,
        position,
      })),
      variants: values.variants.map((variant) => ({
        id: variant.id,
        sku: variant.sku,
        size: variant.size,
        color: variant.color,
        price: Number(variant.price),
        importPrice: Number(variant.importPrice),
        quantity: Number(variant.quantity),
        isActive: variant.isActive,
      })),
    };

    if (formMode === "create") {
      const res = await financeAPI.createProduct(payload);

      if (res.code !== RESPONSE_CODES.success || !res.data) {
        await cleanupUploadedImage();
        toast({
          title: "Tạo sản phẩm thất bại",
          description: productTitle
            ? `Không thể tạo "${productTitle}". Vui lòng kiểm tra lại thông tin.`
            : "Không thể tạo sản phẩm. Vui lòng kiểm tra lại thông tin.",
          className: "bg-red-1 text-white text-sm font-medium w-fit",
          duration: 3000,
        });
        return false;
      }
    } else if (selectedProduct) {
      const res = await financeAPI.updateProduct(selectedProduct.id, payload);

      if (res.code !== RESPONSE_CODES.success) {
        await cleanupUploadedImage();
        toast({
          title: "Cập nhật sản phẩm thất bại",
          description: productTitle
            ? `Không thể cập nhật "${productTitle}". Vui lòng thử lại.`
            : "Không thể cập nhật sản phẩm. Vui lòng thử lại.",
          className: "bg-red-1 text-white text-sm font-medium w-fit",
          duration: 3000,
        });
        return false;
      }
    }

    setIsFormOpen(false);
    setSelectedProduct(null);
    setProductDetail(null);
    await fetchProducts(1);
    await fetchCategories();
    toast({
      title: isCreating
        ? "Tạo sản phẩm thành công"
        : "Cập nhật sản phẩm thành công",
      description: productTitle
        ? isCreating
          ? `Đã thêm "${productTitle}" vào danh sách sản phẩm`
          : `Đã cập nhật "${productTitle}"`
        : undefined,
      className: "bg-green-16 text-white text-sm font-medium w-fit",
      duration: 3000,
    });
    return true;
  };

  const handleConfirmDelete = async () => {
    if (!selectedProduct) {
      return;
    }

    const deletedProductTitle = selectedProduct.title;

    setIsDeleting(true);
    const res = await financeAPI.deleteProduct(selectedProduct.id);

    if (res.code !== RESPONSE_CODES.success) {
      toast({
        title: "Xóa sản phẩm thất bại",
        description:
          res.data?.message ||
          (deletedProductTitle
            ? `Không thể xóa "${deletedProductTitle}". Vui lòng thử lại.`
            : "Không thể xóa sản phẩm. Vui lòng thử lại."),
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
    toast({
      title: "Xóa sản phẩm thành công",
      description: deletedProductTitle
        ? `Đã xóa "${deletedProductTitle}" khỏi danh sách sản phẩm`
        : undefined,
      className: "bg-green-16 text-white text-sm font-medium w-fit",
      duration: 3000,
    });
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
          slug: productDetail?.slug || "",
          description: productDetail?.description || "",
          gender: (productDetail?.gender || "") as ProductFormValues["gender"],
          productStatus: productDetail?.productStatus || "PRIVATE",
          seoTitle: productDetail?.seoTitle || "",
          seoDescription: productDetail?.seoDescription || "",
          variants: (productDetail?.variants || []).map((variant) => ({
            id: variant.id,
            clientId: String(variant.id),
            sku: variant.sku,
            size: variant.size || "",
            color: variant.color || "",
            price: String(variant.sellPrice ?? variant.price ?? 0),
            importPrice: String(variant.importPrice),
            quantity: String(variant.quantity),
            isActive: variant.isActive,
          })),
        }
      : DEFAULT_FORM_VALUES;
  const initialImages = useMemo(
    () =>
      (productDetail?.images || []).map((image) => ({
        id: image.id,
        url: image.url,
        publicId: image.publicId || undefined,
        isPrimary: image.isPrimary,
        position: image.position,
      })),
    [productDetail?.images],
  );

  return (
    <AdminPageContainer>
      <AdminPageHeader
        title="Sản phẩm"
        description="Quản lý danh mục hàng hóa, giá bán và tồn kho."
        actions={
          <>
            <Button
              type="button"
              variant="ghost"
              className="h-10 rounded-lg border border-(--admin-primary-border) text-(--admin-primary) hover:bg-(--admin-primary-soft)"
              onClick={() => router.push("/admin/products/import")}
            >
              <FileSpreadsheet className="size-4" />
              Nhập từ Excel
            </Button>
            <Button
              type="button"
              variant="adminPrimary"
              className="h-10 rounded-lg"
              onClick={handleOpenCreate}
            >
              <Plus className="size-4" />
              Thêm sản phẩm
            </Button>
          </>
        }
      />

      <AdminSection>
        <AdminToolbar
          search={
            <AdminSearchInput
              value={search}
              onChange={setSearch}
              placeholder="Tìm tên, SKU, mã vạch, màu hoặc size"
              loading={isRefreshing || debouncedSearch !== search.trim()}
            />
          }
          filters={
            <>
              <AdminSelect
                name="productCategory"
                value={categoryFilter}
                options={[
                  { value: "", label: "Tất cả danh mục" },
                  ...categories.map((category) => ({
                    value: String(category.id),
                    label: category.name,
                  })),
                ]}
                placeholder="Tất cả danh mục"
                onChange={setCategoryFilter}
                searchable
              />
              <AdminSelect
                name="productSort"
                value={sortBy}
                options={[...PRODUCT_SORT_OPTIONS]}
                placeholder="Sắp xếp"
                onChange={(value) => setSortBy(value as ProductSortValue)}
              />
              <div className="flex h-10 min-w-0 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2">
                <input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={minPrice}
                  onChange={(event) => setMinPrice(event.target.value)}
                  placeholder="Giá từ"
                  aria-label="Giá bán từ"
                  className="min-w-0 w-1/2 bg-transparent px-1 text-sm outline-none placeholder:text-(--admin-text-muted)"
                />
                <span className="text-slate-300">–</span>
                <input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={maxPrice}
                  onChange={(event) => setMaxPrice(event.target.value)}
                  placeholder="Giá đến"
                  aria-label="Giá bán đến"
                  className="min-w-0 w-1/2 bg-transparent px-1 text-sm outline-none placeholder:text-(--admin-text-muted)"
                />
              </div>
              <AdminSelect
                name="productStock"
                value={stockFilter}
                options={[
                  { value: "", label: "Tất cả tồn kho" },
                  { value: "IN_STOCK", label: "Còn hàng" },
                  { value: "OUT_OF_STOCK", label: "Hết hàng" },
                ]}
                placeholder="Tất cả tồn kho"
                onChange={setStockFilter}
              />
            </>
          }
          activeFilterCount={
            Number(Boolean(search)) +
            Number(Boolean(categoryFilter)) +
            Number(Boolean(debouncedMinPrice)) +
            Number(Boolean(debouncedMaxPrice)) +
            Number(Boolean(stockFilter)) +
            Number(sortBy !== DEFAULT_SORT)
          }
          onReset={() => {
            setSearch("");
            setCategoryFilter("");
            setMinPrice("");
            setMaxPrice("");
            setStockFilter("");
            setSortBy(DEFAULT_SORT);
          }}
          desktopClassName="sm:grid-cols-[minmax(220px,1fr)_minmax(150px,190px)_minmax(140px,170px)_minmax(190px,240px)_minmax(140px,180px)_auto]"
        />

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-(--admin-border) pt-4">
          <h2 className="text-base font-semibold text-(--admin-text)">
            Danh sách sản phẩm
          </h2>
          <p className="whitespace-nowrap text-sm text-(--admin-text-secondary)">
            {products.length} sản phẩm
          </p>
        </div>

        {isRefreshing || debouncedSearch !== search.trim() ? (
          <div className="mt-3 flex items-center gap-2 text-xs font-medium text-(--admin-primary)">
            <LoaderCircle className="size-3.5 animate-spin" />
            Đang tìm sản phẩm...
          </div>
        ) : null}

        <div className="mt-4">
          {isInitialLoading ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <Skeleton key={item} className="h-44 rounded-xl" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <AdminEmptyState
              title="Chưa có sản phẩm phù hợp"
              description="Thử thay đổi bộ lọc hoặc thêm sản phẩm mới vào cửa hàng."
            />
          ) : (
            <>
              <ProductList
                products={products}
                onEdit={handleOpenEdit}
                onDelete={handleDeleteClick}
                onStatusChange={handleStatusChange}
                onAdjustFavorites={handleAdjustFavorites}
                updatingStatusIds={updatingStatusIds}
              />
              <div ref={loadMoreRef} className="h-0 w-full" />
              {isFetchingMore ? (
                <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {[1, 2, 3].map((item) => (
                    <Skeleton key={item} className="h-44 rounded-xl" />
                  ))}
                </div>
              ) : null}
            </>
          )}
        </div>
      </AdminSection>

      <ProductFormDialog
        open={isFormOpen}
        mode={formMode}
        categories={categories}
        initialValues={initialValues}
        initialImages={initialImages}
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
    </AdminPageContainer>
  );
}
