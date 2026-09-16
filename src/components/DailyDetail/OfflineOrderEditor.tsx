"use client";

import { AdminSelect } from "@/components/Admin/AdminFields";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { NumericInput } from "@/components/ui/numberInput";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrencyVND } from "@/helper/convertCurrency";
import type { DailyOrder, OfflineOrderPayload } from "@/interface/financeAPI";
import {
  findShopOrderLineOption,
  type ShopOrderLineOption,
  type ShopOrderProductOption,
} from "@/lib/orders/shop-order-products";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Check,
  ImageOff,
  Loader2,
  Minus,
  PackageCheck,
  Phone,
  Plus,
  Search,
  ShoppingBag,
  TicketPercent,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import QrScanner from "qr-scanner";

export type OfflineOrderEditorMode = "create" | "edit";

type EditableOrderItem = ShopOrderLineOption & {
  unitPrice: string;
  quantity: string;
};

type OrderFormState = {
  paymentMethod: "CASH" | "BANK_TRANSFER" | "MOMO";
  paymentStatus: "PAID" | "UNPAID";
  items: EditableOrderItem[];
  couponCode: string;
  customerPhone: string;
  userId: number | null;
};

type Customer = {
  id: number;
  phone: string | null;
  displayName: string | null;
  membership: {
    name: string;
    color: string | null;
    discountRate: number;
  } | null;
};

type SubmitOrder = (
  payload: OfflineOrderPayload,
  orderId?: number,
) => Promise<boolean>;

const COLORS = {
  accent: "#D96C8A",
  accentHover: "#C85B7B",
  accentSoft: "#FCEEF3",
  background: "#F8F5F6",
  border: "#EAE1E4",
  text: "#2D2226",
  muted: "#65545B",
} as const;

const formatMoney = (value: number) => `${formatCurrencyVND(value)}đ`;

const parseMoney = (value: string) => {
  const parsed = Number(value.replace(/[^\d]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

const itemKey = (item: { productId: number; variantId: number | null }) =>
  `${item.productId}:${item.variantId ?? "product"}`;

const createIdempotencyKey = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const emptyForm = (): OrderFormState => ({
  paymentMethod: "CASH",
  paymentStatus: "PAID",
  items: [],
  couponCode: "",
  customerPhone: "",
  userId: null,
});

const snapshotColorCode = (snapshot: unknown) => {
  if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) {
    return "";
  }
  const value = (snapshot as { colorCode?: unknown }).colorCode;
  return typeof value === "string" ? value : "";
};

function ProductThumbnail({
  src,
  alt,
  size = "md",
}: {
  src: string | null;
  alt: string;
  size?: "sm" | "md" | "lg";
}) {
  const [visible, setVisible] = useState(Boolean(src));
  const sizeClass =
    size === "sm" ? "size-11" : size === "lg" ? "size-20" : "size-14";

  useEffect(() => setVisible(Boolean(src)), [src]);

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#F3EFF0] text-[#9B8C91]",
        sizeClass,
      )}
    >
      {src && visible ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="size-full object-cover"
          onError={() => setVisible(false)}
        />
      ) : (
        <ImageOff className="size-4" />
      )}
    </div>
  );
}

const getProductOptions = (product: ShopOrderProductOption) =>
  product.baseOption
    ? [product.baseOption]
    : product.colors.flatMap((color) => color.variants);

const getPriceLabel = (product: ShopOrderProductOption) => {
  const prices = getProductOptions(product)
    .map((option) => option.originalUnitPrice)
    .filter((price) => price >= 0);
  if (!prices.length) return "Chưa có giá";
  const minimum = Math.min(...prices);
  const maximum = Math.max(...prices);
  return minimum === maximum
    ? formatMoney(minimum)
    : `${formatMoney(minimum)} – ${formatMoney(maximum)}`;
};

function ProductResultRow({
  product,
  selectedItems,
  onChoose,
}: {
  product: ShopOrderProductOption;
  selectedItems: EditableOrderItem[];
  onChoose: (product: ShopOrderProductOption) => void;
}) {
  const options = getProductOptions(product);
  const sizes = new Set(options.map((option) => option.size).filter(Boolean));
  const selected = selectedItems.filter(
    (item) => item.productId === product.productId,
  );
  const isUnavailable =
    (!selected.length && product.totalAvailableStock <= 0) || !options.length;
  const selectedQuantity = selected.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0,
  );
  const isMaxedOut =
    selected.length > 0 && selectedQuantity >= product.totalAvailableStock;

  return (
    <button
      type="button"
      disabled={isUnavailable || isMaxedOut}
      onClick={() => onChoose(product)}
      className={cn(
        "group flex min-h-20 w-full min-w-0 items-center gap-3 overflow-hidden border-b border-[#EAE1E4] px-2 py-3 text-left outline-none transition last:border-b-0 hover:bg-[#FCFAFB] focus-visible:bg-[#FCEEF3] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#D96C8A]/35 disabled:cursor-not-allowed disabled:opacity-50 max-sm:mb-2 max-sm:rounded-xl max-sm:border max-sm:bg-white max-sm:p-3",
        selected.length && "border-[#D96C8A] bg-[#FCEEF3] hover:bg-[#FCEEF3]",
      )}
    >
      <ProductThumbnail src={product.imageUrl} alt={product.title} />
      <div className="min-w-0 flex-1">
        <p
          className="truncate text-sm font-bold text-[#2D2226]"
          title={product.title}
        >
          {product.title}
        </p>
        {selected.length ? (
          <p className="mt-1 flex min-w-0 items-center gap-1 text-10px font-bold text-[#A43E5F]">
            <Check className="size-3 shrink-0" />
            <span className="truncate">Đã chọn {selectedQuantity} món</span>
          </p>
        ) : null}
        <p className="mt-1 text-sm font-semibold text-[#65545B]">
          {getPriceLabel(product)}
        </p>
        <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#8B7A80]">
          {product.colors.length ? (
            <span>{product.colors.length} màu</span>
          ) : null}
          {sizes.size ? <span>{sizes.size} size</span> : null}
          <span>Còn {product.totalAvailableStock.toLocaleString("vi-VN")}</span>
          {product.productStatus === "PRIVATE" ? (
            <span className="inline-flex items-center gap-1 text-[#9B6A3E]">
              <AlertTriangle className="size-3" /> Riêng tư
            </span>
          ) : null}
        </div>
      </div>
      <span
        className={cn(
          "flex min-h-10 shrink-0 items-center gap-1 rounded-lg px-3 py-2 text-xs font-bold transition",
          selected.length
            ? "bg-white text-[#A43E5F]"
            : "text-[#D96C8A] group-hover:bg-[#FCEEF3]",
        )}
      >
        {isUnavailable ? "Hết hàng" : isMaxedOut ? "Đủ số lượng" : "Chọn"}
      </span>
    </button>
  );
}

function ProductResultSkeleton() {
  return (
    <div className="flex items-center gap-3 border-b border-[#EAE1E4] px-2 py-3">
      <Skeleton className="size-14 rounded-xl" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

function VariantPicker({
  product,
  existingItems,
  onClose,
  onAdd,
}: {
  product: ShopOrderProductOption | null;
  existingItems: EditableOrderItem[];
  onClose: () => void;
  onAdd: (option: ShopOrderLineOption, quantity: number) => void;
}) {
  const [colorKey, setColorKey] = useState<string | null>(null);
  const [variantId, setVariantId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState("1");
  const color = product?.colors.find((item) => item.key === colorKey) || null;
  const selected =
    product?.baseOption ||
    color?.variants.find((variant) => variant.variantId === variantId) ||
    null;

  useEffect(() => {
    if (!product) return;
    const existing = existingItems.find(
      (item) => item.productId === product.productId,
    );
    const existingColor = product.colors.find((item) =>
      item.variants.some(
        (variant) => variant.variantId === existing?.variantId,
      ),
    );
    setColorKey(existingColor?.key || null);
    setVariantId(existing?.variantId || null);
    setQuantity(existing?.quantity || "1");
  }, [existingItems, product]);

  useEffect(() => {
    if (!selected) {
      setQuantity("1");
      return;
    }
    const existing = existingItems.find(
      (item) => itemKey(item) === itemKey(selected),
    );
    setQuantity(existing?.quantity || "1");
  }, [existingItems, selected]);

  const parsedQuantity = Number(quantity || 0);
  const maxQuantity = selected?.availableStock || 0;
  const canConfirm =
    Boolean(selected) &&
    Number.isInteger(parsedQuantity) &&
    parsedQuantity >= 0 &&
    parsedQuantity <= maxQuantity;

  return (
    <Dialog open={Boolean(product)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex h-dvh max-h-dvh max-w-none flex-col overflow-hidden bg-white p-0 shadow-xl sm:h-auto sm:max-h-[85dvh] sm:w-[min(92vw,560px)] sm:rounded-2xl sm:border sm:border-[#EAE1E4]">
        <div className="flex items-start justify-between border-b border-[#EAE1E4] px-4 py-4 sm:px-5">
          <div className="min-w-0">
            <DialogTitle className="truncate text-lg font-bold text-[#2D2226]">
              Chọn biến thể
            </DialogTitle>
            <DialogDescription className="mt-1 truncate text-sm text-[#65545B]">
              {product?.title}
            </DialogDescription>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="rounded-lg text-[#65545B] focus-visible:ring-[#D96C8A]/30"
            onClick={onClose}
            aria-label="Đóng chọn biến thể"
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-5">
          <div className="flex items-center gap-3 border-b border-[#EAE1E4] pb-4">
            <ProductThumbnail
              src={selected?.imageUrl || product?.imageUrl || ""}
              alt={product?.title || "Sản phẩm"}
              size="lg"
            />
            <div className="min-w-0">
              <p className="line-clamp-2 text-base font-bold text-[#2D2226]">
                {product?.title}
              </p>
              <p className="mt-1 text-base font-bold text-[#2D2226]">
                {selected
                  ? formatMoney(selected.originalUnitPrice)
                  : product
                    ? getPriceLabel(product)
                    : ""}
              </p>
              {selected ? (
                <p className="mt-1 text-xs text-[#65545B]">
                  SKU: {selected.sku || "—"} · Còn {selected.availableStock}
                </p>
              ) : null}
            </div>
          </div>

          {product?.colors.length ? (
            <fieldset className="mt-5">
              <legend className="text-sm font-bold text-[#2D2226]">
                Màu sắc
              </legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {product?.colors.map((item) => {
                  const active = item.key === colorKey;
                  return (
                    <Button
                      key={item.key}
                      type="button"
                      variant="ghost"
                      aria-pressed={active}
                      onClick={() => {
                        setColorKey(item.key);
                        setVariantId(null);
                      }}
                      className={cn(
                        "h-10 rounded-lg border px-3 focus-visible:ring-[#D96C8A]/30",
                        active
                          ? "border-[#D96C8A] bg-[#FCEEF3] text-[#A43E5F]"
                          : "border-[#EAE1E4] bg-white text-[#65545B] hover:bg-[#FCFAFB]",
                      )}
                    >
                      {item.colorCode ? (
                        <span
                          className="size-3 rounded-full border border-black/10"
                          style={{ backgroundColor: item.colorCode }}
                        />
                      ) : null}
                      {item.label}
                    </Button>
                  );
                })}
              </div>
            </fieldset>
          ) : null}

          {product?.colors.length ? (
            <fieldset className="mt-5" disabled={!color}>
              <legend className="text-sm font-bold text-[#2D2226]">
                Kích thước
              </legend>
              {!color ? (
                <p className="mt-2 text-sm text-[#8B7A80]">
                  Chọn màu để xem kích thước phù hợp.
                </p>
              ) : (
                <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {color.variants.map((variant) => {
                    const active = variant.variantId === variantId;
                    const unavailable =
                      variant.availableStock <= 0 &&
                      !existingItems.some(
                        (item) => itemKey(item) === itemKey(variant),
                      );
                    return (
                      <Button
                        key={variant.variantId}
                        type="button"
                        variant="ghost"
                        disabled={unavailable}
                        aria-pressed={active}
                        onClick={() => setVariantId(variant.variantId)}
                        className={cn(
                          "h-auto min-h-12 flex-col gap-0 rounded-lg border px-2 py-2 focus-visible:ring-[#D96C8A]/30",
                          active
                            ? "border-[#D96C8A] bg-[#FCEEF3] text-[#A43E5F]"
                            : "border-[#EAE1E4] bg-white text-[#65545B] hover:bg-[#FCFAFB]",
                        )}
                      >
                        <span className="font-bold">{variant.size}</span>
                        <span className="text-10px opacity-70">
                          {unavailable
                            ? "Hết hàng"
                            : `Còn ${variant.availableStock}`}
                        </span>
                      </Button>
                    );
                  })}
                </div>
              )}
            </fieldset>
          ) : null}

          {selected ? (
            <fieldset className="mt-5">
              <legend className="text-sm font-bold text-[#2D2226]">
                Số lượng
              </legend>
              <div className="mt-2 flex items-center gap-3">
                <QuantityControl
                  value={quantity}
                  stock={maxQuantity}
                  onChange={setQuantity}
                  allowZero
                />
                <p className="text-xs leading-5 text-[#8B7A80]">
                  Hiện tại:{" "}
                  <strong className="text-[#65545B]">{quantity} món</strong>
                  <br />
                  Tối đa: {maxQuantity} món · đưa về 0 để xóa.
                </p>
              </div>
            </fieldset>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-2 border-t border-[#EAE1E4] bg-white px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))] sm:px-5">
          <Button
            type="button"
            variant="ghost"
            className="h-11 rounded-lg border border-[#EAE1E4] text-[#65545B]"
            onClick={onClose}
          >
            Hủy
          </Button>
          <Button
            type="button"
            className="h-11 rounded-lg bg-[#D96C8A] text-white hover:bg-[#C85B7B] focus-visible:ring-[#D96C8A]/35"
            disabled={!canConfirm}
            onClick={() => selected && onAdd(selected, parsedQuantity)}
          >
            {selected &&
            existingItems.some((item) => itemKey(item) === itemKey(selected))
              ? "Cập nhật"
              : "Thêm vào đơn"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ProductSearchPanel({
  products,
  selectedItems,
  loading,
  onAdd,
  onRemoveProduct,
  onSearchChange,
}: {
  products: ShopOrderProductOption[];
  selectedItems: EditableOrderItem[];
  loading: boolean;
  onAdd: (option: ShopOrderLineOption, quantity?: number) => void;
  onRemoveProduct: (productId: number) => void;
  onSearchChange?: (search: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [variantProduct, setVariantProduct] =
    useState<ShopOrderProductOption | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(search), 200);
    return () => window.clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    onSearchChange?.(debouncedSearch.trim());
  }, [debouncedSearch, onSearchChange]);

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  const categories = useMemo(
    () => [
      { value: "ALL", label: "Tất cả danh mục" },
      ...[...new Set(products.map((product) => product.categoryName))]
        .sort((left, right) => left.localeCompare(right, "vi"))
        .map((name) => ({ value: name, label: name })),
    ],
    [products],
  );
  const normalizedSearch = debouncedSearch.trim().toLocaleLowerCase("vi");
  const searchTokens = normalizedSearch.split(/\s+/).filter(Boolean);
  const isSearching = loading || search.trim() !== debouncedSearch.trim();
  const filtered = products.filter(
    (product) =>
      (category === "ALL" || product.categoryName === category) &&
      (!searchTokens.length ||
        searchTokens.every((token) => product.searchableText.includes(token))),
  );

  const chooseProduct = (product: ShopOrderProductOption) => {
    const options = getProductOptions(product);
    const alreadySelected = selectedItems.some(
      (item) => item.productId === product.productId,
    );
    if (alreadySelected) {
      if (options.length > 1) {
        setVariantProduct(product);
        return;
      }
      const selectedOption = options[0];
      const currentQuantity = selectedItems
        .filter((item) => itemKey(item) === itemKey(selectedOption))
        .reduce((total, item) => total + Number(item.quantity || 0), 0);
      onAdd(selectedOption, currentQuantity + 1);
      return;
    }
    if (
      !alreadySelected &&
      options.length === 1 &&
      options[0].availableStock > 0
    ) {
      onAdd(options[0]);
      return;
    }
    setVariantProduct(product);
  };

  return (
    <section className="flex h-full min-h-0 flex-1 flex-col bg-white xl:border-r xl:border-[#EAE1E4]">
      <div className="border-b border-[#EAE1E4] px-4 py-4 sm:px-5">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#2D2226]">
              Chọn sản phẩm
            </h3>
            <p className="mt-0.5 text-xs text-[#8B7A80]">
              Tìm nhanh theo tên, SKU, màu hoặc kích thước
            </p>
          </div>
          <span className="text-xs font-semibold text-[#8B7A80]">
            {filtered.length} kết quả
          </span>
        </div>
        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_220px]">
          <Input
            ref={searchRef}
            standalone
            value={search}
            onManualChange={setSearch}
            onManualClear={() => setSearch("")}
            clearable
            icon={
              isSearching ? (
                <Loader2 className="ml-3 size-4 shrink-0 animate-spin text-[#D96C8A]" />
              ) : (
                <Search className="ml-3 size-4 shrink-0 text-[#9B8C91]" />
              )
            }
            placeholder="Tìm tên sản phẩm, SKU hoặc mã vạch..."
            aria-label="Tìm sản phẩm"
            classNameContainer="h-10 rounded-lg border border-[#EAE1E4] bg-white focus-within:border-[#D96C8A] focus-within:ring-2 focus-within:ring-[#D96C8A]/15"
            className="h-9! rounded-lg! border-0! bg-transparent! px-2! pr-10! text-sm! text-[#2D2226] placeholder:text-[#9B8C91]"
          />
          <AdminSelect
            name="offlineOrderCategory"
            value={category}
            options={categories}
            placeholder="Danh mục"
            searchable
            onChange={setCategory}
          />
        </div>
      </div>

      <div className="h-0 min-h-0 flex-1 overflow-y-auto overscroll-contain bg-white px-2 py-1 touch-pan-y sm:px-4 max-sm:bg-[#F8F5F6] max-sm:p-3 max-sm:pb-36">
        {isSearching ? (
          Array.from({ length: 6 }, (_, index) => (
            <ProductResultSkeleton key={index} />
          ))
        ) : filtered.length ? (
          filtered.map((product) => (
            <ProductResultRow
              key={product.productId}
              product={product}
              selectedItems={selectedItems}
              onChoose={chooseProduct}
            />
          ))
        ) : (
          <div className="flex min-h-48 items-center justify-center text-center">
            <div>
              <Search className="mx-auto size-5 text-[#B7A9AE]" />
              <p className="mt-2 text-sm font-semibold text-[#65545B]">
                Không tìm thấy sản phẩm phù hợp.
              </p>
              <p className="mt-1 text-xs text-[#9B8C91]">
                Thử từ khóa khác hoặc đổi danh mục.
              </p>
            </div>
          </div>
        )}
      </div>

      <VariantPicker
        product={variantProduct}
        existingItems={selectedItems}
        onClose={() => setVariantProduct(null)}
        onAdd={(option) => {
          onAdd(option, 1);
          setVariantProduct(null);
        }}
      />
    </section>
  );
}

function QuantityControl({
  value,
  stock,
  onChange,
  allowZero = false,
}: {
  value: string;
  stock: number;
  onChange: (value: string) => void;
  allowZero?: boolean;
}) {
  const quantity = Number(value || 0);
  const minimum = allowZero ? 0 : 1;
  const invalidMinimum = !Number.isInteger(quantity) || quantity < minimum;
  const invalidStock = quantity > stock;

  const normalize = () => {
    if (!Number.isInteger(quantity) || quantity < minimum)
      onChange(String(minimum));
    else if (quantity > stock) onChange(String(stock));
  };

  return (
    <div>
      <div className="grid h-9 w-full grid-cols-[30px_1fr_30px] overflow-hidden rounded-lg border border-[#EAE1E4] bg-white">
        <Button
          type="button"
          variant="ghost"
          className="h-9 rounded-none p-0 text-[#65545B] hover:bg-[#F8F5F6]"
          disabled={quantity <= minimum}
          onClick={() => onChange(String(Math.max(minimum, quantity - 1)))}
          aria-label="Giảm số lượng"
        >
          <Minus className="size-3.5" />
        </Button>
        <input
          value={value}
          inputMode="numeric"
          aria-label="Số lượng"
          onChange={(event) =>
            onChange(event.target.value.replace(/[^\d]/g, ""))
          }
          onBlur={normalize}
          className="flex-1 w-full min-w-0 border-x border-[#EAE1E4] bg-transparent text-center text-sm font-bold text-[#2D2226] outline-none focus:bg-[#FCEEF3]"
        />
        <Button
          type="button"
          variant="ghost"
          className="h-9 rounded-none p-0 text-[#65545B] hover:bg-[#F8F5F6]"
          disabled={quantity >= stock}
          onClick={() => onChange(String(Math.min(stock, quantity + 1)))}
          aria-label="Tăng số lượng"
        >
          <Plus className="size-3.5" />
        </Button>
      </div>
      {invalidMinimum || invalidStock ? (
        <p className="mt-1 text-11px font-medium text-[#B3475E]">
          {invalidStock
            ? `Chỉ còn ${stock} sản phẩm trong kho.`
            : "Số lượng tối thiểu là 1."}
        </p>
      ) : null}
    </div>
  );
}

function SellingPriceInput({
  value,
  originalPrice,
  onChange,
}: {
  value: string;
  originalPrice: number;
  onChange: (value: string) => void;
}) {
  const price = parseMoney(value);
  const changed = price !== originalPrice;

  return (
    <div className="min-w-0">
      <p className="mb-1.5 text-11px font-semibold text-[#65545B]">Giá bán</p>
      <div className="relative">
        <NumericInput
          standalone
          value={value}
          onManualChange={onChange}
          onBlur={() => onChange(String(Math.max(0, Math.round(price))))}
          inputMode="numeric"
          aria-label="Giá bán thực tế"
          classNameContainer="w-full"
          className="py-0! h-9! w-full! rounded-lg! border-[#EAE1E4]! bg-white! px-2! pr-6! text-right! text-sm! font-bold! text-[#2D2226] focus:border-[#D96C8A]! focus:ring-2! focus:ring-[#D96C8A]/15!"
        />
        <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-xs font-semibold text-[#8B7A80]">
          đ
        </span>
      </div>
      <p className="mt-1 truncate text-11px text-[#8B7A80]">
        Giá gốc:{" "}
        <span className="font-semibold">{formatMoney(originalPrice)}</span>
        {changed ? (
          <span className="ml-1.5 font-semibold text-[#A43E5F]">
            · Đã điều chỉnh
          </span>
        ) : null}
      </p>
    </div>
  );
}

function OrderCartItem({
  item,
  onUpdate,
  onRemove,
}: {
  item: EditableOrderItem;
  onUpdate: (
    patch: Partial<Pick<EditableOrderItem, "quantity" | "unitPrice">>,
  ) => void;
  onRemove: () => void;
}) {
  const quantity = Number(item.quantity || 0);
  const lineTotal = parseMoney(item.unitPrice) * quantity;

  return (
    <div className="group border-b border-[#EAE1E4] py-3.5 last:border-b-0">
      <div className="flex min-w-0 items-start gap-3">
        <ProductThumbnail src={item.imageUrl} alt={item.title} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-[#2D2226]">
                {item.title}
              </p>
              <div className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-[#65545B]">
                {item.colorCode ? (
                  <span
                    className="size-2.5 shrink-0 rounded-full border border-black/10"
                    style={{ backgroundColor: item.colorCode }}
                  />
                ) : null}
                <span className="truncate">
                  {item.variantLabel || item.categoryName}
                </span>
              </div>
              {item.sku ? (
                <p className="mt-0.5 truncate text-11px text-[#9B8C91]">
                  SKU: {item.sku}
                </p>
              ) : null}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="shrink-0 text-[#9B8C91] opacity-70 hover:bg-[#FFF0F2] hover:text-[#B3475E] focus:opacity-100 group-hover:opacity-100 xl:opacity-0"
              onClick={onRemove}
              aria-label={`Xóa ${item.title}`}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-[112px_minmax(0,1fr)] items-start gap-x-3 gap-y-2 sm:grid-cols-[112px_minmax(130px,1fr)_110px]">
        <div>
          <div className="mb-1.5 flex items-center justify-between gap-1 text-11px font-semibold">
            <span className="text-[#65545B]">Số lượng</span>
            <span
              className="truncate text-[#8B7A80]"
              title={`Còn ${item.availableStock.toLocaleString("vi-VN")} sản phẩm`}
            >
              Còn {item.availableStock.toLocaleString("vi-VN")}
            </span>
          </div>
          <QuantityControl
            value={item.quantity}
            stock={item.availableStock}
            onChange={(quantityValue) => onUpdate({ quantity: quantityValue })}
          />
        </div>
        <SellingPriceInput
          value={item.unitPrice}
          originalPrice={item.originalUnitPrice}
          onChange={(priceValue) => onUpdate({ unitPrice: priceValue })}
        />
        <div className="col-span-2 flex items-center justify-between border-t border-[#F0E9EB] pt-2 sm:col-span-1 sm:block sm:border-0 sm:pt-0 sm:text-right">
          <p className="text-11px font-semibold text-[#65545B]">Thành tiền</p>
          <p className="mt-0.5 text-sm font-extrabold text-[#2D2226]">
            {formatMoney(lineTotal)}
          </p>
        </div>
      </div>
    </div>
  );
}

function PaymentSection({
  form,
  onChange,
}: {
  form: OrderFormState;
  onChange: (patch: Partial<OrderFormState>) => void;
}) {
  return (
    <div className="grid gap-3 border-t border-[#EAE1E4] py-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
      <label className="block min-w-0">
        <span className="mb-1.5 block text-xs font-semibold text-[#65545B]">
          Phương thức thanh toán
        </span>
        <AdminSelect
          name="offlinePaymentMethod"
          value={form.paymentMethod}
          options={[
            { value: "CASH", label: "Tiền mặt" },
            { value: "BANK_TRANSFER", label: "Chuyển khoản" },
            { value: "MOMO", label: "MoMo" },
          ]}
          placeholder="Phương thức"
          onChange={(paymentMethod) =>
            onChange({
              paymentMethod: paymentMethod as OrderFormState["paymentMethod"],
            })
          }
        />
      </label>
      <label className="block min-w-0">
        <span className="mb-1.5 block text-xs font-semibold text-[#65545B]">
          Trạng thái thanh toán
        </span>
        <AdminSelect
          name="offlinePaymentStatus"
          value={form.paymentStatus}
          options={[
            { value: "PAID", label: "Đã thanh toán" },
            { value: "UNPAID", label: "Chưa thanh toán" },
          ]}
          placeholder="Trạng thái"
          onChange={(paymentStatus) =>
            onChange({
              paymentStatus: paymentStatus as OrderFormState["paymentStatus"],
            })
          }
        />
      </label>
    </div>
  );
}

type DiscountPreview = {
  code: string;
  name: string;
  discountAmount: number;
  total: number;
};

function CouponSection({
  items,
  value,
  onChange,
  onApplied,
}: {
  items: EditableOrderItem[];
  value: DiscountPreview | null;
  onChange: (code: string) => void;
  onApplied: (preview: DiscountPreview | null) => void;
}) {
  const [code, setCode] = useState(value?.code || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!scannerOpen || !videoRef.current) return;
    let scanner: QrScanner | null = null;
    let cancelled = false;
    scanner = new QrScanner(
      videoRef.current,
      (result) => {
        if (cancelled) return;
        const raw = typeof result === "string" ? result : result.data;
        const tokenMatch = raw.match(/\/voucher\/([^/?#]+)/);
        setScannerOpen(false);
        if (tokenMatch) {
          void fetch(`/api/vouchers/${tokenMatch[1]}`)
            .then((response) => response.json())
            .then((data) => {
              if (!data.code) throw new Error("Voucher không hợp lệ.");
              setCode(data.code);
              setMessage("Đã nhận voucher từ QR, nhấn Áp dụng để kiểm tra.");
            })
            .catch(() =>
              setMessage(
                "Không thể đọc voucher từ QR. Vui lòng nhập mã thủ công.",
              ),
            );
        } else {
          setCode(raw.trim());
          setMessage("Đã nhận mã QR, nhấn Áp dụng để kiểm tra.");
        }
      },
      { highlightScanRegion: true, highlightCodeOutline: true },
    );
    void scanner
      .start()
      .catch(() =>
        setMessage("Không thể sử dụng camera. Vui lòng nhập mã thủ công."),
      );
    return () => {
      cancelled = true;
      scanner?.stop();
      scanner?.destroy();
    };
  }, [scannerOpen]);

  const apply = async () => {
    if (loading) return;
    const normalized = code.toUpperCase().replace(/\s+/g, "");
    if (!normalized) return;
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/discounts/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: normalized,
          items: items.map((item) => ({
            productId: item.productId,
            unitPrice: parseMoney(item.unitPrice),
            quantity: Number(item.quantity),
          })),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      onChange(data.code);
      onApplied(data);
    } catch (error) {
      onApplied(null);
      setMessage(error instanceof Error ? error.message : "Mã không hợp lệ.");
    } finally {
      setLoading(false);
    }
  };

  if (value) {
    return (
      <div className="border-t border-[#EAE1E4] py-3">
        <div className="flex items-center justify-between gap-3 rounded-lg bg-[#FCEEF3] px-3 py-2">
          <div className="flex min-w-0 items-center gap-2">
            <TicketPercent className="size-4 shrink-0 text-[#D96C8A]" />
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-[#A43E5F]">
                {value.code}
              </p>
              <p className="truncate text-10px text-[#8B7A80]">{value.name}</p>
            </div>
          </div>
          <button
            type="button"
            className="shrink-0 text-xs font-semibold text-[#A43E5F] hover:underline"
            onClick={() => {
              onChange("");
              onApplied(null);
            }}
          >
            Xóa
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-[#EAE1E4] py-3">
      <label className="mb-1.5 block text-xs font-semibold text-[#65545B]">
        Mã giảm giá
      </label>
      <div className="flex min-w-0 gap-2">
        <div className="relative min-w-0 flex-1">
          <TicketPercent className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9B8C91]" />
          <input
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            onKeyDown={(event) =>
              event.key === "Enter" && !loading && void apply()
            }
            placeholder="Nhập mã giảm giá"
            className="h-10 w-full min-w-0 rounded-lg border border-[#EAE1E4] bg-white pl-9 pr-3 text-sm uppercase outline-none focus:border-[#D96C8A] focus:ring-2 focus:ring-[#D96C8A]/15"
          />
        </div>
        <Button
          type="button"
          variant="ghost"
          className="h-10 shrink-0 border border-[#EAE1E4] px-3 text-[#65545B]"
          onClick={() => setScannerOpen(true)}
        >
          Quét QR
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="h-10 min-w-20 shrink-0 border border-[#D96C8A] px-3 text-[#A43E5F]"
          aria-label={
            loading ? "Đang áp dụng mã giảm giá" : "Áp dụng mã giảm giá"
          }
          disabled={loading || !code.trim()}
          onClick={() => void apply()}
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : "Áp dụng"}
        </Button>
      </div>
      {message ? (
        <p className="mt-1.5 text-xs font-medium text-[#B3475E]">{message}</p>
      ) : null}
      {scannerOpen ? (
        <div className="fixed inset-0 z-(--z-dialog) flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="font-bold text-[#2D2226]">Quét mã QR</p>
              <button
                type="button"
                className="p-2 text-[#65545B]"
                onClick={() => setScannerOpen(false)}
                aria-label="Đóng quét QR"
              >
                ✕
              </button>
            </div>
            <video
              ref={videoRef}
              className="mt-3 aspect-square w-full rounded-xl bg-black object-cover"
              muted
              playsInline
            />
            <p className="mt-3 text-center text-xs text-[#8B7A80]">
              Đưa mã QR vào khung hình
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function OrderCart({
  mode,
  form,
  error,
  submitting,
  onChange,
  onUpdateItem,
  onRemoveItem,
  onSubmit,
  discountPreview,
  onCouponChange,
  onDiscountPreviewChange,
  customer,
  customerLoading,
  onLookupCustomer,
}: {
  mode: OfflineOrderEditorMode;
  form: OrderFormState;
  error: string;
  submitting: boolean;
  onChange: (patch: Partial<OrderFormState>) => void;
  onUpdateItem: (
    index: number,
    patch: Partial<Pick<EditableOrderItem, "quantity" | "unitPrice">>,
  ) => void;
  onRemoveItem: (index: number) => void;
  onSubmit: () => void;
  discountPreview: DiscountPreview | null;
  onCouponChange: (code: string) => void;
  onDiscountPreviewChange: (preview: DiscountPreview | null) => void;
  customer: Customer | null;
  customerLoading: boolean;
  onLookupCustomer: () => void;
}) {
  const totals = form.items.reduce(
    (result, item) => {
      const quantity = Number(item.quantity || 0);
      result.quantity += Number.isFinite(quantity) ? quantity : 0;
      result.amount += parseMoney(item.unitPrice) * quantity;
      return result;
    },
    { quantity: 0, amount: 0 },
  );
  const invalid = form.items.some((item) => {
    const quantity = Number(item.quantity);
    const price = parseMoney(item.unitPrice);
    return (
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > item.availableStock ||
      !Number.isInteger(price) ||
      price < 0
    );
  });

  return (
    <section className="flex h-full min-h-0 flex-col bg-white">
      <div className="flex items-center justify-between border-b border-[#EAE1E4] py-4 pl-4 pr-12 sm:pl-5 xl:pr-5">
        <div>
          <h3 className="text-base font-bold text-[#2D2226]">
            Đơn hàng hiện tại
          </h3>
          <p className="mt-0.5 text-xs text-[#8B7A80]">
            {form.items.length
              ? `${form.items.length} sản phẩm/biến thể`
              : "Chưa có sản phẩm"}
          </p>
        </div>
        {form.paymentStatus === "UNPAID" ? (
          <span className="rounded-md bg-[#FFF5E5] px-2 py-1 text-xs font-semibold text-[#946317]">
            Chưa thanh toán
          </span>
        ) : (
          <span className="rounded-md bg-[#ECF7F0] px-2 py-1 text-xs font-semibold text-[#397354]">
            Đã thanh toán
          </span>
        )}
      </div>

      <div className="max-h-[32dvh] min-h-0 flex-none overflow-y-auto px-4 sm:px-5 xl:min-h-48 xl:flex-[1_1_40%]">
        {form.items.length ? (
          form.items.map((item, index) => (
            <OrderCartItem
              key={itemKey(item)}
              item={item}
              onUpdate={(patch) => onUpdateItem(index, patch)}
              onRemove={() => onRemoveItem(index)}
            />
          ))
        ) : (
          <div className="flex h-full min-h-40 items-center justify-center text-center xl:min-h-56">
            <div>
              <PackageCheck className="mx-auto size-6 text-[#B7A9AE]" />
              <p className="mt-2 text-sm font-semibold text-[#65545B]">
                Chưa có sản phẩm trong đơn
              </p>
              <p className="mt-1 text-xs text-[#9B8C91]">
                Tìm và chọn sản phẩm để bắt đầu.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="min-h-0 flex-[1_1_60%] overflow-y-auto border-t border-[#EAE1E4] bg-white px-4 pb-[max(16px,env(safe-area-inset-bottom))] sm:px-5">
        <div className="border-b border-[#EAE1E4] py-3">
          <label className="text-xs font-bold text-[#2D2226]">
            Khách hàng / số điện thoại
            <div className="mt-1.5 flex gap-2">
              <Input
                standalone
                value={form.customerPhone}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                onManualChange={(value) =>
                  onChange({ customerPhone: value, userId: null })
                }
                placeholder="Nhập số điện thoại khách hàng"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    onLookupCustomer();
                  }
                }}
                icon={<Phone className="ml-3 size-4 shrink-0 text-[#9B8C91]" />}
                classNameContainer="h-10 min-w-0 flex-1 rounded-lg border border-[#EAE1E4] bg-white focus-within:border-[#D96C8A] focus-within:ring-2 focus-within:ring-[#D96C8A]/15"
                className="h-9! rounded-lg! border-0! bg-transparent! px-2! text-sm! text-[#2D2226] placeholder:text-[#9B8C91]"
              />
              <Button
                type="button"
                variant="ghost"
                className="h-10 shrink-0 rounded-lg border border-[#EAE1E4] px-3 text-[#A43E5F] hover:bg-[#FCEEF3] focus-visible:ring-[#D96C8A]/30"
                disabled={customerLoading}
                onClick={onLookupCustomer}
              >
                {customerLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Search className="size-4" />
                )}
                <span className="sr-only">Tìm khách hàng</span>
              </Button>
            </div>
          </label>
          {customer ? (
            <div className="mt-2 rounded-lg bg-[#FCEEF3] px-3 py-2 text-xs text-[#65545B]">
              <p className="font-bold text-[#2D2226]">
                {customer.displayName || customer.phone}
              </p>
              <p className="mt-0.5">
                {customer.membership
                  ? `${customer.membership.name} · Giảm mặc định ${customer.membership.discountRate}%`
                  : "Chưa có hạng membership"}
              </p>
            </div>
          ) : null}
        </div>
        <CouponSection
          items={form.items}
          value={discountPreview}
          onChange={onCouponChange}
          onApplied={onDiscountPreviewChange}
        />
        <PaymentSection form={form} onChange={onChange} />
        <div className="space-y-2 pb-4 text-sm">
          {discountPreview ? (
            <>
              <div className="flex items-center justify-between text-[#65545B]">
                <span>Tạm tính</span>
                <span>{formatMoney(totals.amount)}</span>
              </div>
              <div className="flex items-center justify-between text-[#397354]">
                <span>Mã {discountPreview.code}</span>
                <span>-{formatMoney(discountPreview.discountAmount)}</span>
              </div>
            </>
          ) : null}
          <div className="flex items-center justify-between text-[#65545B]">
            <span>Tổng số lượng</span>
            <span className="font-bold text-[#2D2226]">
              {totals.quantity.toLocaleString("vi-VN")}
            </span>
          </div>
          <div className="flex items-end justify-between gap-3">
            <span className="font-semibold text-[#2D2226]">
              Tổng thanh toán
            </span>
            <span className="text-xl font-extrabold tracking-tight text-[#2D2226]">
              {formatMoney(discountPreview?.total ?? totals.amount)}
            </span>
          </div>
        </div>
        {error ? (
          <p className="mb-3 rounded-lg bg-[#FFF0F2] px-3 py-2 text-sm font-medium text-[#B3475E]">
            {error}
          </p>
        ) : null}
        <Button
          type="button"
          className="h-12 w-full rounded-lg bg-[#D96C8A] text-base font-bold text-white hover:bg-[#C85B7B] focus-visible:ring-[#D96C8A]/35"
          disabled={!form.items.length || invalid || submitting}
          onClick={onSubmit}
        >
          {submitting ? (
            <span className="inline-flex items-center gap-2">
              <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Đang lưu đơn
            </span>
          ) : (
            `${mode === "edit" ? "Lưu đơn" : "Tạo đơn"} · ${formatMoney(discountPreview?.total ?? totals.amount)}`
          )}
        </Button>
      </div>
    </section>
  );
}

export function OfflineOrderEditor({
  open,
  mode,
  products,
  productsLoading,
  order,
  onOpenChange,
  onSubmit,
  onProductSearchChange,
}: {
  open: boolean;
  mode: OfflineOrderEditorMode;
  products: ShopOrderProductOption[];
  productsLoading: boolean;
  order: DailyOrder | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: SubmitOrder;
  onProductSearchChange?: (search: string) => void;
}) {
  const [form, setForm] = useState<OrderFormState>(emptyForm);
  const [cartOpen, setCartOpen] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [discountPreview, setDiscountPreview] =
    useState<DiscountPreview | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState(createIdempotencyKey);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!open) {
      initializedRef.current = false;
      setCartOpen(false);
      setForm(emptyForm());
      setDiscountPreview(null);
      setCustomer(null);
      setError("");
      return;
    }
    if (initializedRef.current || productsLoading) return;

    if (mode === "edit" && order) {
      setForm({
        paymentMethod:
          order.paymentMethod === "BANK_TRANSFER" ||
          order.paymentMethod === "MOMO"
            ? order.paymentMethod
            : "CASH",
        paymentStatus: order.paymentStatus === "UNPAID" ? "UNPAID" : "PAID",
        couponCode: "",
        customerPhone: order.customer?.phone || "",
        userId: order.customer?.id || null,
        items: order.items
          .filter((item) => item.productId)
          .map((item) => {
            const productId = item.productId || 0;
            const live = findShopOrderLineOption(
              products,
              productId,
              item.variantId,
            );
            const color = item.color || live?.color || "";
            const size = item.size || live?.size || "";
            return {
              productId,
              variantId: item.variantId,
              title: item.productTitle,
              imageUrl: live?.imageUrl || item.productImageUrl || "",
              categoryName: live?.categoryName || "",
              sku: item.sku || live?.sku || null,
              barcode: live?.barcode || null,
              color,
              colorCode:
                live?.colorCode ||
                snapshotColorCode(item.variantOptionsSnapshot),
              size,
              variantLabel: [color, size].filter(Boolean).join(" / "),
              originalUnitPrice: item.originalUnitPrice,
              unitCost: item.unitCost,
              availableStock: (live?.availableStock || 0) + item.quantity,
              productStatus: live?.productStatus || "PUBLIC",
              unitPrice: String(item.unitPrice),
              quantity: String(item.quantity),
            };
          }),
      });
    } else {
      setForm(emptyForm());
      setCustomer(null);
      setIdempotencyKey(createIdempotencyKey());
    }
    setError("");
    initializedRef.current = true;
  }, [mode, open, order, products, productsLoading]);

  const lookupCustomer = async () => {
    const phone = form.customerPhone.trim();
    if (!phone) {
      setCustomer(null);
      setForm((current) => ({ ...current, userId: null }));
      setError("Vui lòng nhập số điện thoại khách hàng.");
      return;
    }
    setCustomerLoading(true);
    setError("");
    try {
      const response = await fetch(
        `/api/customers/lookup?phone=${encodeURIComponent(phone)}`,
      );
      const data = await response.json();
      if (!response.ok) {
        setCustomer(null);
        setForm((current) => ({ ...current, userId: null }));
        setError(data.message || "Không tìm thấy khách hàng.");
        return;
      }
      setCustomer(data);
      setForm((current) => ({ ...current, userId: data.id }));
    } catch {
      setCustomer(null);
      setForm((current) => ({ ...current, userId: null }));
      setError("Không thể tìm khách hàng. Vui lòng thử lại.");
    } finally {
      setCustomerLoading(false);
    }
  };

  const totals = form.items.reduce(
    (result, item) => {
      const quantity = Number(item.quantity || 0);
      result.quantity += Number.isFinite(quantity) ? quantity : 0;
      result.amount += parseMoney(item.unitPrice) * quantity;
      return result;
    },
    { quantity: 0, amount: 0 },
  );

  const addItem = (option: ShopOrderLineOption, requestedQuantity = 1) => {
    setError("");
    setDiscountPreview(null);
    setForm((current) => ({ ...current, couponCode: "" }));
    setForm((current) => {
      const index = current.items.findIndex(
        (item) => itemKey(item) === itemKey(option),
      );
      if (index >= 0) {
        if (requestedQuantity <= 0) {
          return {
            ...current,
            items: current.items.filter((_, itemIndex) => itemIndex !== index),
          };
        }
        const items = [...current.items];
        items[index] = {
          ...items[index],
          quantity: String(
            Math.min(requestedQuantity, items[index].availableStock),
          ),
        };
        return { ...current, items };
      }
      if (requestedQuantity <= 0) return current;
      return {
        ...current,
        items: [
          ...current.items,
          {
            ...option,
            quantity: String(
              Math.min(requestedQuantity, option.availableStock),
            ),
            unitPrice: String(option.originalUnitPrice),
          },
        ],
      };
    });
  };

  const updateItem = (
    index: number,
    patch: Partial<Pick<EditableOrderItem, "quantity" | "unitPrice">>,
  ) => {
    setDiscountPreview(null);
    setForm((current) => ({ ...current, couponCode: "" }));
    setForm((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    }));
  };

  const submit = async () => {
    try {
      setError("");
      const items = form.items.map((item) => {
        const quantity = Number(item.quantity);
        const unitPrice = parseMoney(item.unitPrice);
        if (!Number.isInteger(quantity) || quantity < 1) {
          throw new Error("Số lượng phải là số nguyên lớn hơn 0.");
        }
        if (quantity > item.availableStock) {
          throw new Error(
            `Chỉ còn ${item.availableStock} sản phẩm "${item.title}" trong kho.`,
          );
        }
        if (!Number.isInteger(unitPrice) || unitPrice < 0) {
          throw new Error("Giá bán phải là số nguyên và không được âm.");
        }
        return {
          productId: item.productId,
          variantId: item.variantId,
          unitPrice,
          quantity,
        };
      });

      setSubmitting(true);
      const success = await onSubmit(
        {
          paymentMethod: form.paymentMethod,
          paymentStatus: form.paymentStatus,
          userId: form.userId,
          idempotencyKey: mode === "create" ? idempotencyKey : undefined,
          couponCode: form.couponCode || undefined,
          items,
        },
        order?.id,
      );
      if (success) onOpenChange(false);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Không thể lưu đơn hàng. Vui lòng thử lại.",
      );
      setCartOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  const cart = (
    <OrderCart
      mode={mode}
      form={form}
      error={error}
      submitting={submitting}
      onChange={(patch) => setForm((current) => ({ ...current, ...patch }))}
      onUpdateItem={updateItem}
      onRemoveItem={(index) =>
        setForm((current) => ({
          ...current,
          items: current.items.filter((_, itemIndex) => itemIndex !== index),
        }))
      }
      onSubmit={() => void submit()}
      discountPreview={discountPreview}
      onCouponChange={(couponCode) =>
        setForm((current) => ({ ...current, couponCode }))
      }
      onDiscountPreviewChange={setDiscountPreview}
      customer={customer}
      customerLoading={customerLoading}
      onLookupCustomer={() => void lookupCustomer()}
    />
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="shop-order-modal flex h-dvh max-h-dvh max-w-none flex-col overflow-hidden bg-[#F8F5F6] p-0 shadow-none xl:h-[min(94dvh,900px)] xl:w-[min(95vw,1440px)] xl:rounded-2xl xl:border xl:border-[#EAE1E4] xl:shadow-xl"
        style={
          {
            "--pos-background": COLORS.background,
            "--pos-border": COLORS.border,
            "--pos-text": COLORS.text,
            "--pos-muted": COLORS.muted,
            "--pos-accent": COLORS.accent,
            "--pos-accent-hover": COLORS.accentHover,
            "--pos-accent-soft": COLORS.accentSoft,
          } as React.CSSProperties
        }
      >
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#EAE1E4] bg-white px-4 sm:px-5">
          <div className="min-w-0">
            <DialogTitle className="truncate text-lg font-bold text-[#2D2226] sm:text-xl">
              {mode === "edit" ? "Sửa đơn tại shop" : "Tạo đơn tại shop"}
            </DialogTitle>
            <DialogDescription className="mt-0.5 hidden text-xs text-[#8B7A80] sm:block">
              Chọn sản phẩm bên trái và hoàn tất đơn ở giỏ hàng.
            </DialogDescription>
          </div>
          <DialogClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="rounded-lg text-[#65545B] hover:bg-[#F8F5F6] focus-visible:ring-[#D96C8A]/30"
              aria-label="Đóng trình tạo đơn"
            >
              <X className="size-4" />
            </Button>
          </DialogClose>
        </header>

        <div className="grid h-full min-h-0 flex-1 xl:grid-cols-[minmax(0,3fr)_minmax(430px,2fr)]">
          <div className="flex h-full min-h-0 flex-col xl:pb-0">
            <ProductSearchPanel
              products={products}
              selectedItems={form.items}
              loading={productsLoading}
              onAdd={addItem}
              onRemoveProduct={(productId) => (
                setDiscountPreview(null),
                setForm((current) => ({
                  ...current,
                  items: current.items.filter(
                    (item) => item.productId !== productId,
                  ),
                  couponCode: "",
                }))
              )}
              onSearchChange={onProductSearchChange}
            />
          </div>
          <div className="hidden min-h-0 xl:block">{cart}</div>
        </div>

        <div className="fixed inset-x-0 bottom-0 z-10 border-t border-[#EAE1E4] bg-white px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))] xl:hidden">
          <div className="mx-auto flex max-w-3xl flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <p className="truncate text-xs font-semibold text-[#65545B]">
                {form.items.length
                  ? `${form.items.length} sản phẩm · ${totals.quantity} món`
                  : "Chưa chọn sản phẩm"}
              </p>
              <p className="shrink-0 text-base font-extrabold text-[#2D2226]">
                {formatMoney(totals.amount)}
              </p>
            </div>
            <Button
              type="button"
              className="h-11 w-full rounded-lg bg-[#D96C8A] font-bold text-white hover:bg-[#C85B7B] focus-visible:ring-[#D96C8A]/35"
              disabled={!form.items.length || submitting}
              onClick={() => setCartOpen(true)}
            >
              <ShoppingBag className="size-4" />
              Xem đơn
            </Button>
          </div>
        </div>

        <Sheet open={cartOpen} onOpenChange={setCartOpen}>
          <SheetContent
            side="right"
            className="shop-order-modal z-(--z-dialog) h-dvh w-full! max-w-full! overflow-hidden p-0 sm:w-[min(92vw,560px)]!"
          >
            <SheetTitle className="sr-only">Đơn hàng hiện tại</SheetTitle>
            <SheetDescription className="sr-only">
              Chỉnh sản phẩm, thanh toán và hoàn tất đơn tại shop.
            </SheetDescription>
            {cart}
          </SheetContent>
        </Sheet>
      </DialogContent>
    </Dialog>
  );
}
