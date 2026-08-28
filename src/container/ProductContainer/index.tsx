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
import { Plus } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

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

const DEFAULT_FORM_VALUES: ProductFormValues = {
  title: "",
  categoryId: "",
  importPrice: "",
  sellPrice: "",
  quantity: "1",
  slug: "",
  description: "",
  gender: "",
  productStatus: "DRAFT",
  visibility: "PUBLIC",
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
  productStatus: product.productStatus || "DRAFT",
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
  const [sortBy, setSortBy] = useState<ProductSortValue>(
    (searchParams.get("sort") as ProductSortValue) || DEFAULT_SORT,
  );
  const [isInitialLoading, setIsInitialLoading] = useState(true);
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
      sort: sortBy,
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
  }, [search, categoryFilter, sortBy]);

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

    if (sortBy !== DEFAULT_SORT) {
      params.set("sort", sortBy);
    } else {
      params.delete("sort");
    }

    const nextQuery = params.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false,
    });
  }, [search, categoryFilter, sortBy, pathname, router]);

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
    sortBy,
  ]);

  const handleOpenCreate = () => {
    router.push("/admin/products/new");
  };

  const handleOpenEdit = (product: ProductItemData) => {
    router.push(`/admin/products/${product.id}/edit`);
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
      visibility: values.visibility,
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
          productStatus: productDetail?.productStatus || "DRAFT",
          visibility: productDetail?.visibility || "PUBLIC",
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
          <Button
            type="button"
            variant="adminPrimary"
            className="h-10 rounded-lg"
            onClick={handleOpenCreate}
          >
            <Plus className="size-4" />
            Thêm sản phẩm
          </Button>
        }
      />

      <AdminSection>
        <AdminToolbar
          search={
            <AdminSearchInput
              value={search}
              onChange={setSearch}
              placeholder="Tìm theo tên sản phẩm"
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
            </>
          }
          activeFilterCount={
            Number(Boolean(search)) +
            Number(Boolean(categoryFilter)) +
            Number(sortBy !== DEFAULT_SORT)
          }
          onReset={() => {
            setSearch("");
            setCategoryFilter("");
            setSortBy(DEFAULT_SORT);
          }}
          desktopClassName="sm:grid-cols-[minmax(220px,1fr)_minmax(160px,220px)_minmax(140px,160px)_auto]"
        />

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-(--admin-border) pt-4">
          <h2 className="text-base font-semibold text-(--admin-text)">
            Danh sách sản phẩm
          </h2>
          <p className="whitespace-nowrap text-sm text-(--admin-text-secondary)">
            {products.length} sản phẩm
          </p>
        </div>

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
