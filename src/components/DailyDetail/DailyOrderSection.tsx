"use client";

import CustomSelect from "@/components/common/CustomFields/CustomSelect";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NumericInput } from "@/components/ui/numberInput";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { RESPONSE_CODES } from "@/constant/codes";
import { financeAPI } from "@/endpoint/financeAPI";
import { formatCurrencyVND } from "@/helper/convertCurrency";
import { toast } from "@/hook/use-toast";
import type {
  DailyDetailResponse,
  DailyOrder,
  DailyOrderListResponse,
  OfflineOrderPayload,
  OrderSourceValue,
  OrderStatusValue,
  PaymentMethodValue,
  PaymentStatusValue,
} from "@/interface/financeAPI";
import {
  findShopOrderLineOption,
  findShopOrderProduct,
  getDefaultShopOrderVariant,
  getShopOrderColorForVariant,
  mapShopOrderProducts,
  type ShopOrderLineOption,
  type ShopOrderProductOption,
} from "@/lib/orders/shop-order-products";
import type { FieldInputProps, FieldMetaProps, FormikProps } from "formik";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronsUpDown,
  Eye,
  ImageOff,
  MoreHorizontal,
  Minus,
  PackageCheck,
  Pencil,
  Plus,
  ReceiptText,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";
import {
  type ComponentType,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type OrderTabValue = "OFFLINE" | "ONLINE";
type FilterValue = "ALL";
type OrderDialogMode = "create" | "edit";
type ProductOption = ShopOrderLineOption;
type EditableOrderItem = ProductOption & {
  unitPrice: string;
  quantity: string;
};
type OrderFormState = {
  paymentMethod: "CASH" | "BANK_TRANSFER" | "MOMO";
  paymentStatus: "PAID" | "UNPAID";
  items: EditableOrderItem[];
};
type SelectOption = { value: string; label: string; disabled?: boolean };
type RuntimeSelectProps = {
  field: FieldInputProps<string>;
  form: FormikProps<Record<string, string>>;
  meta: FieldMetaProps<string>;
  optionValue: SelectOption[];
  placeholder: string;
  searchable?: boolean;
  className?: string;
  inputClassName?: string;
  lblClassName?: string;
  popoverTrgVariant?: { variant?: string };
};
type RuntimeNumericInputProps = {
  field: FieldInputProps<string>;
  form: FormikProps<Record<string, string>>;
  meta: FieldMetaProps<string>;
  variant?: "default" | "invisible" | "gray" | "border";
  inputMode?: "numeric";
  pattern?: string;
  placeholder?: string;
  hiddenErr?: boolean;
  classNameContainer?: string;
  className?: string;
};

const RuntimeCustomSelect =
  CustomSelect as unknown as ComponentType<RuntimeSelectProps>;
const RuntimeNumericInput =
  NumericInput as unknown as ComponentType<RuntimeNumericInputProps>;

const ORDER_SOURCE_LABELS: Record<OrderSourceValue, string> = {
  OFFLINE: "Tại shop",
  ONLINE: "Online",
};

const ORDER_STATUS_LABELS: Record<OrderStatusValue, string> = {
  PENDING: "Đặt hàng",
  CONFIRMED: "Xác nhận",
  PREPARING: "Đang chuẩn bị",
  READY_TO_SHIP: "Sẵn sàng giao",
  SHIPPING: "Đang giao",
  PROCESSING: "Đang xử lý",
  SHIPPED: "Đã gửi",
  DELIVERED: "Đã giao",
  COMPLETED: "Hoàn tất",
  CANCELLED: "Đã hủy",
  REFUNDED: "Đã hoàn tiền",
};

const NEXT_ONLINE_STATUS: Partial<
  Record<OrderStatusValue, { value: OrderStatusValue; label: string }>
> = {
  PENDING: { value: "CONFIRMED", label: "Xác nhận" },
  CONFIRMED: { value: "DELIVERED", label: "Đã giao" },
};

const PAYMENT_STATUS_LABELS: Record<PaymentStatusValue, string> = {
  UNPAID: "Chưa thanh toán",
  PENDING: "Chờ thanh toán",
  PROCESSING: "Đang xử lý",
  AUTHORIZED: "Đã giữ tiền",
  PAID: "Đã thanh toán",
  FAILED: "Thất bại",
  CANCELLED: "Đã hủy",
  REFUNDED: "Đã hoàn tiền",
  PARTIALLY_REFUNDED: "Hoàn một phần",
};

const PAYMENT_METHOD_LABELS: Partial<Record<PaymentMethodValue, string>> = {
  CASH: "Tiền mặt",
  BANK_TRANSFER: "Chuyển khoản",
  MOMO: "MoMo",
  COD: "COD",
  CARD: "Thẻ",
  ZALOPAY: "ZaloPay",
  PAYPAL: "PayPal",
  STRIPE: "Stripe",
};

const createEmptyForm = (): OrderFormState => ({
  paymentMethod: "CASH",
  paymentStatus: "PAID",
  items: [],
});

const createIdempotencyKey = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const formatMoney = (value: number) => `${formatCurrencyVND(value)}đ`;

const parseMoneyInput = (value: string) => {
  const numericValue = Number(value.replace(/[^\d]/g, ""));

  return Number.isFinite(numericValue) ? numericValue : 0;
};

const getItemKey = (item: { productId: number; variantId: number | null }) =>
  `${item.productId}:${item.variantId ?? "product"}`;

const getSnapshotColorCode = (snapshot: unknown) => {
  if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) {
    return "";
  }

  const colorCode = (snapshot as { colorCode?: unknown }).colorCode;
  return typeof colorCode === "string" ? colorCode : "";
};

function ProductImage({
  imageUrl,
  title,
}: {
  imageUrl: string | null;
  title: string;
}) {
  const [showImage, setShowImage] = useState(Boolean(imageUrl));

  useEffect(() => {
    setShowImage(Boolean(imageUrl));
  }, [imageUrl]);

  if (!imageUrl || !showImage) {
    return (
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[14px] bg-slate-100 text-slate-400">
        <ImageOff className="size-4" />
      </div>
    );
  }

  return (
    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-[14px] bg-slate-100">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={title}
        className="h-full w-full object-cover"
        onError={() => setShowImage(false)}
      />
    </div>
  );
}

function ShopOrderProductPicker({
  products,
  selectedKeys,
  onSelect,
}: {
  products: ShopOrderProductOption[];
  selectedKeys: Set<string>;
  onSelect: (product: ProductOption) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [productId, setProductId] = useState<number | null>(null);
  const [colorKey, setColorKey] = useState<string | null>(null);
  const [variantId, setVariantId] = useState<number | null>(null);
  const selectedProduct = productId
    ? findShopOrderProduct(products, productId)
    : null;
  const selectedColor =
    selectedProduct?.colors.find((color) => color.key === colorKey) || null;
  const selectedOption = selectedProduct
    ? selectedProduct.baseOption ||
      selectedColor?.variants.find(
        (variant) => variant.variantId === variantId,
      ) ||
      null
    : null;
  const normalizedSearch = search.trim().toLocaleLowerCase("vi");
  const filteredProducts = normalizedSearch
    ? products.filter((product) =>
        product.searchableText.includes(normalizedSearch),
      )
    : products;

  const resetPicker = () => {
    setSearch("");
    setProductId(null);
    setColorKey(null);
    setVariantId(null);
  };

  const chooseProduct = (product: ShopOrderProductOption) => {
    const defaultOption = getDefaultShopOrderVariant(product);
    const defaultColor = defaultOption
      ? getShopOrderColorForVariant(product, defaultOption.variantId)
      : null;

    setProductId(product.productId);
    setColorKey(defaultColor?.key || null);
    setVariantId(defaultOption?.variantId ?? null);
  };

  const chooseColor = (nextColor: ShopOrderProductOption["colors"][number]) => {
    const defaultVariant =
      nextColor.variants.find((variant) => variant.availableStock > 0) ||
      nextColor.variants[0];

    setColorKey(nextColor.key);
    setVariantId(defaultVariant?.variantId ?? null);
  };

  const addSelectedOption = () => {
    if (!selectedOption || selectedOption.availableStock <= 0) return;
    onSelect(selectedOption);
    setOpen(false);
    resetPicker();
  };

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) resetPicker();
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className="h-11 w-full min-w-0 justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-600 hover:border-blue-2 hover:bg-slate-50 focus-visible:ring-blue-2/25"
        >
          <span className="flex min-w-0 items-center gap-2">
            <Search className="size-4 shrink-0 text-slate-400" />
            <span className="truncate">Tìm sản phẩm, màu, size hoặc SKU</span>
          </span>
          <ChevronsUpDown className="size-4 shrink-0 text-slate-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={6}
        className="z-90 w-(--radix-popover-trigger-width) max-w-[calc(100vw-40px)] rounded-lg border-slate-200 bg-white p-0 shadow-lg"
        onWheel={(event) => event.stopPropagation()}
        onTouchMove={(event) => event.stopPropagation()}
      >
        {selectedProduct ? (
          <div className="p-3">
            <div className="flex items-start gap-3 border-b border-slate-100 pb-3">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="rounded-full bg-slate-50 text-slate-500"
                aria-label="Quay lại danh sách sản phẩm"
                onClick={() => {
                  setProductId(null);
                  setColorKey(null);
                  setVariantId(null);
                }}
              >
                <ArrowLeft className="size-4" />
              </Button>
              <ProductImage
                imageUrl={selectedOption?.imageUrl || selectedProduct.imageUrl}
                title={selectedProduct.title}
              />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-extrabold text-slate-700">
                  {selectedProduct.title}
                </p>
                <p className="mt-1 text-xs font-semibold text-slate-400">
                  {selectedProduct.categoryName} · Tồn tổng:{" "}
                  {selectedProduct.totalAvailableStock.toLocaleString("vi-VN")}
                </p>
                {selectedProduct.productStatus === "PRIVATE" ? (
                  <p className="mt-1 inline-flex items-center gap-1 rounded-md bg-(--admin-primary-soft) px-1.5 py-0.5 text-xs font-semibold text-(--admin-primary)">
                    <AlertTriangle className="size-3" /> Riêng tư · chỉ dùng tại
                    shop
                  </p>
                ) : null}
              </div>
            </div>

            {selectedProduct.colors.length ? (
              <div className="mt-3 space-y-3">
                <div>
                  <p className="mb-2 text-xs font-bold text-slate-500">Màu</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.colors.map((color) => {
                      const isSelected = color.key === colorKey;
                      const stock = color.variants.reduce(
                        (total, variant) => total + variant.availableStock,
                        0,
                      );

                      return (
                        <Button
                          key={color.key}
                          type="button"
                          variant="ghost"
                          size="sm"
                          aria-pressed={isSelected}
                          className={`rounded-xl border px-3 ${
                            isSelected
                              ? "border-(--admin-primary) bg-(--admin-primary-soft) text-(--admin-primary)"
                              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                          }`}
                          onClick={() => chooseColor(color)}
                        >
                          {color.colorCode ? (
                            <span
                              className="size-3 rounded-full border border-black/10"
                              style={{ backgroundColor: color.colorCode }}
                            />
                          ) : null}
                          {color.label}
                          <span className="text-[10px] opacity-70">
                            ({stock})
                          </span>
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {selectedColor ? (
                  <div>
                    <p className="mb-2 text-xs font-bold text-slate-500">
                      Kích thước
                    </p>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {selectedColor.variants.map((variant) => {
                        const isSelected = variant.variantId === variantId;
                        const isOutOfStock = variant.availableStock <= 0;

                        return (
                          <Button
                            key={variant.variantId}
                            type="button"
                            variant="ghost"
                            aria-pressed={isSelected}
                            disabled={isOutOfStock}
                            className={`h-auto min-w-0 flex-col gap-0.5 rounded-xl border px-2 py-2 ${
                              isSelected
                                ? "border-(--admin-primary) bg-(--admin-primary-soft) text-(--admin-primary)"
                                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                            }`}
                            onClick={() => setVariantId(variant.variantId)}
                          >
                            <span className="max-w-full truncate font-extrabold">
                              {variant.size}
                            </span>
                            <span className="text-[10px] font-semibold opacity-70">
                              {isOutOfStock
                                ? "Hết hàng"
                                : `Còn ${variant.availableStock}`}
                            </span>
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="mt-3 rounded-xl bg-slate-50 p-3">
              {selectedOption ? (
                <div className="flex items-end justify-between gap-3">
                  <div className="min-w-0 text-xs font-semibold text-slate-500">
                    <p className="truncate">
                      {selectedOption.sku
                        ? `SKU: ${selectedOption.sku}`
                        : "Sản phẩm không có biến thể"}
                    </p>
                    <p className="mt-1">
                      Khả dụng:{" "}
                      {selectedOption.availableStock.toLocaleString("vi-VN")}
                    </p>
                  </div>
                  <p className="shrink-0 text-base font-extrabold text-slate-800">
                    {formatMoney(selectedOption.originalUnitPrice)}
                  </p>
                </div>
              ) : (
                <p className="text-sm font-semibold text-slate-500">
                  Sản phẩm chưa có biến thể đang hoạt động.
                </p>
              )}
            </div>

            <Button
              type="button"
              variant="adminPrimary"
              className="mt-3 h-11 w-full rounded-xl"
              disabled={!selectedOption || selectedOption.availableStock <= 0}
              onClick={addSelectedOption}
            >
              <Plus className="size-4" />
              {selectedOption && selectedKeys.has(getItemKey(selectedOption))
                ? "Tăng số lượng"
                : "Thêm vào đơn"}
            </Button>
          </div>
        ) : (
          <Command shouldFilter={false} className="rounded-2xl">
            <div className="border-b border-slate-100 p-2">
              <CommandInput
                value={search}
                onValueChange={setSearch}
                placeholder="Nhập tên sản phẩm, màu, size hoặc SKU"
                icon={<Search className="size-4 text-slate-400" />}
                className="h-10 text-sm text-slate-700 placeholder:text-slate-400"
              />
            </div>
            <CommandList className="max-h-80 p-1.5">
              <CommandEmpty className="px-3 py-8 text-center text-sm font-semibold text-slate-400">
                Không tìm thấy sản phẩm phù hợp
              </CommandEmpty>
              <CommandGroup className="p-0">
                {filteredProducts.map((product) => (
                  <CommandItem
                    key={product.productId}
                    value={String(product.productId)}
                    onSelect={() => chooseProduct(product)}
                    className="min-w-0 cursor-pointer gap-3 rounded-xl p-2 data-[selected=true]:bg-blue-50"
                  >
                    <ProductImage
                      imageUrl={product.imageUrl}
                      title={product.title}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-extrabold text-slate-700">
                        {product.title}
                      </p>
                      <p className="mt-1 truncate text-xs font-semibold text-slate-400">
                        {product.categoryName}
                        {product.colors.length
                          ? ` · ${product.colors.length} màu`
                          : " · Không có biến thể"}
                      </p>
                      <p className="mt-1 text-xs font-bold text-slate-500">
                        Tồn tổng:{" "}
                        {product.totalAvailableStock.toLocaleString("vi-VN")}
                      </p>
                    </div>
                    <ChevronsUpDown className="size-4 -rotate-90 text-slate-400" />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        )}
      </PopoverContent>
    </Popover>
  );
}

function SourceBadge({ source }: { source: OrderSourceValue }) {
  return (
    <span
      className={`inline-flex h-6 items-center whitespace-nowrap rounded-md px-2 text-xs font-bold ${
        source === "OFFLINE"
          ? "bg-orange-50 text-orange-600"
          : "bg-sky-50 text-sky-600"
      }`}
    >
      {ORDER_SOURCE_LABELS[source]}
    </span>
  );
}

function StatusBadge({ status }: { status: OrderStatusValue }) {
  const tone =
    status === "PENDING"
      ? "bg-amber-50 text-amber-700"
      : status === "CONFIRMED"
        ? "bg-blue-3 text-blue-6"
        : status === "DELIVERED" || status === "COMPLETED"
          ? "bg-emerald-50 text-emerald-700"
          : status === "CANCELLED" || status === "REFUNDED"
            ? "bg-rose-50 text-rose-700"
            : "bg-slate-100 text-slate-600";

  return (
    <span
      className={`inline-flex h-6 items-center whitespace-nowrap rounded-md px-2 text-xs font-bold ${tone}`}
    >
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}

function PaymentBadge({ status }: { status: PaymentStatusValue }) {
  const tone =
    status === "PAID"
      ? "bg-emerald-50 text-emerald-700"
      : status === "REFUNDED" ||
          status === "PARTIALLY_REFUNDED" ||
          status === "FAILED"
        ? "bg-rose-50 text-rose-700"
        : status === "UNPAID" || status === "PENDING"
          ? "bg-amber-50 text-amber-700"
          : "bg-slate-100 text-slate-600";

  return (
    <span
      className={`inline-flex h-6 items-center whitespace-nowrap rounded-md px-2 text-xs font-bold ${tone}`}
    >
      {PAYMENT_STATUS_LABELS[status]}
    </span>
  );
}

function OrderSelect({
  name,
  value,
  options,
  placeholder,
  onChange,
  className = "",
}: {
  name: string;
  value: string;
  options: SelectOption[];
  placeholder: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  const field = {
    name,
    value,
    onChange: () => undefined,
    onBlur: () => undefined,
  } satisfies FieldInputProps<string>;
  const form = {
    setFieldValue: (_field: string, nextValue: unknown) => {
      onChange(String(nextValue));
      return Promise.resolve();
    },
    errors: {},
    touched: {},
  } as unknown as FormikProps<Record<string, string>>;
  const meta = {} as FieldMetaProps<string>;

  return (
    <RuntimeCustomSelect
      field={field}
      form={form}
      meta={meta}
      optionValue={options}
      placeholder={placeholder}
      searchable={false}
      className={`w-full! max-w-full! min-w-0! sm:w-full! ${className}`}
      inputClassName="h-10! w-full! max-w-full! min-w-0! rounded-lg! text-sm! font-semibold!"
      lblClassName="text-sm"
      popoverTrgVariant={{ variant: "search-box--lgray" }}
    />
  );
}

function PriceNumberInput({
  name,
  value,
  onChange,
}: {
  name: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const field = {
    name,
    value,
    onChange: () => undefined,
    onBlur: () => undefined,
  } satisfies FieldInputProps<string>;
  const form = {
    setFieldValue: (_field: string, nextValue: unknown) => {
      onChange(String(nextValue));
      return Promise.resolve();
    },
    errors: {},
    touched: {},
  } as unknown as FormikProps<Record<string, string>>;

  return (
    <RuntimeNumericInput
      field={field}
      form={form}
      meta={{} as FieldMetaProps<string>}
      variant="border"
      inputMode="numeric"
      pattern="^\d*$"
      placeholder="Nhập giá bán"
      hiddenErr
      classNameContainer=""
      className="h-11! rounded-xl! border-slate-200! bg-slate-50! px-3! text-sm! font-extrabold! text-slate-700 focus:border-blue-2!"
    />
  );
}

function OrderFilters({
  activeTab,
  search,
  status,
  paymentStatus,
  paymentMethod,
  activeFilterCount,
  onSearchChange,
  onStatusChange,
  onPaymentStatusChange,
  onPaymentMethodChange,
  onReset,
}: {
  activeTab: OrderTabValue;
  search: string;
  status: OrderStatusValue | FilterValue;
  paymentStatus: PaymentStatusValue | FilterValue;
  paymentMethod: PaymentMethodValue | FilterValue;
  activeFilterCount: number;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: OrderStatusValue | FilterValue) => void;
  onPaymentStatusChange: (value: PaymentStatusValue | FilterValue) => void;
  onPaymentMethodChange: (value: PaymentMethodValue | FilterValue) => void;
  onReset: () => void;
}) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const hasActiveFilter = activeFilterCount > 0;
  const statusOptions = [
    { value: "ALL", label: "Tất cả trạng thái" },
    ...Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({
      value,
      label,
    })),
  ];
  const paymentStatusOptions = [
    { value: "ALL", label: "Thanh toán" },
    ...Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => ({
      value,
      label,
    })),
  ];
  const paymentMethodOptions = [
    { value: "ALL", label: "Phương thức" },
    ...Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => ({
      value,
      label,
    })),
  ];
  const renderFilterControls = (isMobile = false) => (
    <>
      {activeTab === "ONLINE" ? (
        <OrderSelect
          name="orderStatus"
          value={status}
          options={statusOptions}
          placeholder="Trạng thái"
          className={isMobile ? "" : "order-filter-control"}
          onChange={(value) =>
            onStatusChange(value as OrderStatusValue | FilterValue)
          }
        />
      ) : null}
      <OrderSelect
        name="paymentStatus"
        value={paymentStatus}
        options={paymentStatusOptions}
        placeholder="Thanh toán"
        className={isMobile ? "" : "order-filter-control"}
        onChange={(value) =>
          onPaymentStatusChange(value as PaymentStatusValue | FilterValue)
        }
      />
      <OrderSelect
        name="paymentMethod"
        value={paymentMethod}
        options={paymentMethodOptions}
        placeholder="Phương thức"
        className={isMobile ? "" : "order-filter-control"}
        onChange={(value) =>
          onPaymentMethodChange(value as PaymentMethodValue | FilterValue)
        }
      />
      <Button
        type="button"
        variant="ghost"
        className={`h-10 w-full max-w-full min-w-0 rounded-lg border border-slate-100 bg-white text-sm font-bold text-slate-500 hover:bg-slate-50 ${
          hasActiveFilter ? "" : "pointer-events-none opacity-45"
        } ${isMobile ? "" : "order-filter-reset"}`}
        onClick={() => {
          onReset();
          setIsFilterOpen(false);
        }}
      >
        <RotateCcw className="size-4" />
        Xóa lọc
      </Button>
    </>
  );

  return (
    <div className="w-full max-w-full min-w-0 space-y-3">
      <div className="order-filter-grid w-full max-w-full min-w-0 gap-2">
        <div className="order-filter-search flex w-full max-w-full min-w-0 items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3">
          <Search className="size-4 shrink-0 text-slate-400" />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Tìm mã đơn, sản phẩm hoặc SKU"
            className="h-10 w-full min-w-0 bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
          />
          {search ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="rounded-full text-slate-400 hover:bg-white"
              aria-label="Xóa từ khóa tìm kiếm"
              title="Xóa từ khóa tìm kiếm"
              onClick={() => onSearchChange("")}
            >
              <X className="size-4" />
            </Button>
          ) : null}
        </div>

        <div className="hidden sm:contents">{renderFilterControls()}</div>

        <Button
          type="button"
          variant="ghost"
          className="order-filter-search h-10 w-full rounded-lg border border-slate-100 bg-white text-sm font-bold text-slate-600 hover:bg-slate-50 sm:hidden"
          onClick={() => setIsFilterOpen(true)}
        >
          <SlidersHorizontal className="size-4" />
          Bộ lọc{activeFilterCount ? ` (${activeFilterCount})` : ""}
        </Button>
      </div>

      <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <SheetContent side="right" className="w-[min(92vw,380px)] p-5 pt-14">
          <SheetTitle className="text-lg font-semibold text-slate-800">
            Bộ lọc đơn hàng
          </SheetTitle>
          <SheetDescription className="mt-1 text-sm text-slate-500">
            Chọn trạng thái và phương thức để thu gọn danh sách.
          </SheetDescription>
          <div className="mt-3 grid gap-3">{renderFilterControls(true)}</div>
          <Button
            type="button"
            variant="adminPrimary"
            className="mt-2 h-10 rounded-lg"
            onClick={() => setIsFilterOpen(false)}
          >
            Áp dụng
          </Button>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function getFormTotals(items: EditableOrderItem[]) {
  return items.reduce(
    (acc, item) => {
      const quantity = Number(item.quantity || 0);
      const unitPrice = parseMoneyInput(item.unitPrice);
      const lineSubtotal = unitPrice * quantity;
      const lineCost = item.unitCost * quantity;

      acc.totalQuantity += quantity;
      acc.subtotal += lineSubtotal;
      acc.totalCost += lineCost;
      acc.profit += lineSubtotal - lineCost;

      return acc;
    },
    { totalQuantity: 0, subtotal: 0, totalCost: 0, profit: 0 },
  );
}

function OrderFormDialog({
  open,
  mode,
  products,
  order,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  mode: OrderDialogMode;
  products: ShopOrderProductOption[];
  order: DailyOrder | null;
  onOpenChange: (value: boolean) => void;
  onSubmit: (
    payload: OfflineOrderPayload,
    orderId?: number,
  ) => Promise<boolean>;
}) {
  const [form, setForm] = useState<OrderFormState>(createEmptyForm);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState(createIdempotencyKey);
  const selectedKeys = new Set(form.items.map(getItemKey));
  const totals = getFormTotals(form.items);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (mode === "edit" && order) {
      setForm({
        paymentMethod:
          order.paymentMethod === "BANK_TRANSFER" ||
          order.paymentMethod === "MOMO"
            ? order.paymentMethod
            : "CASH",
        paymentStatus: order.paymentStatus === "UNPAID" ? "UNPAID" : "PAID",
        items: order.items
          .filter((item) => item.productId)
          .map((item) => {
            const productId = item.productId ?? 0;
            const liveOption = findShopOrderLineOption(
              products,
              productId,
              item.variantId,
            );
            const color = item.color || liveOption?.color || "";
            const size = item.size || liveOption?.size || "";

            return {
              productId,
              variantId: item.variantId,
              title: item.productTitle,
              imageUrl: liveOption?.imageUrl || item.productImageUrl || "",
              categoryName: liveOption?.categoryName || "",
              sku: item.sku || liveOption?.sku || null,
              color,
              colorCode:
                liveOption?.colorCode ||
                getSnapshotColorCode(item.variantOptionsSnapshot),
              size,
              variantLabel: [color, size].filter(Boolean).join(" / "),
              originalUnitPrice: item.originalUnitPrice,
              unitCost: item.unitCost,
              availableStock: (liveOption?.availableStock ?? 0) + item.quantity,
              productStatus: liveOption?.productStatus || "PUBLIC",
              unitPrice: String(item.unitPrice),
              quantity: String(item.quantity),
            };
          }),
      });
    } else {
      setForm(createEmptyForm());
      setIdempotencyKey(createIdempotencyKey());
    }

    setError("");
  }, [mode, open, order, products]);

  const addProduct = (product: ProductOption) => {
    setError("");
    setForm((current) => {
      const key = getItemKey(product);
      const existingIndex = current.items.findIndex(
        (item) => getItemKey(item) === key,
      );

      if (existingIndex >= 0) {
        const nextItems = [...current.items];
        const currentQuantity = Number(nextItems[existingIndex].quantity || 0);
        const maxQuantity = nextItems[existingIndex].availableStock;

        nextItems[existingIndex] = {
          ...nextItems[existingIndex],
          quantity: String(Math.min(currentQuantity + 1, maxQuantity)),
        };

        return { ...current, items: nextItems };
      }

      return {
        ...current,
        items: [
          ...current.items,
          {
            ...product,
            unitPrice: String(product.originalUnitPrice),
            quantity: "1",
          },
        ],
      };
    });
  };

  const updateItem = (
    index: number,
    patch: Partial<Pick<EditableOrderItem, "unitPrice" | "quantity">>,
  ) => {
    setForm((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    }));
  };

  const removeItem = (index: number) => {
    setForm((current) => ({
      ...current,
      items: current.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const submit = async () => {
    setError("");

    if (form.items.length === 0) {
      setError("Vui lòng chọn ít nhất một sản phẩm.");
      return;
    }

    const payloadItems = form.items.map((item) => {
      const unitPrice = parseMoneyInput(item.unitPrice);
      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity < 1) {
        throw new Error("Số lượng phải là số nguyên lớn hơn 0.");
      }

      if (!Number.isInteger(unitPrice) || unitPrice < 0) {
        throw new Error("Giá bán phải là số nguyên và không được âm.");
      }

      if (quantity > item.availableStock) {
        throw new Error(
          `"${item.title}" chỉ còn ${item.availableStock.toLocaleString(
            "vi-VN",
          )} sản phẩm khả dụng.`,
        );
      }

      return {
        productId: item.productId,
        variantId: item.variantId,
        unitPrice,
        quantity,
      };
    });

    try {
      setIsSubmitting(true);
      const isSuccess = await onSubmit(
        {
          paymentMethod: form.paymentMethod,
          paymentStatus: form.paymentStatus,
          idempotencyKey: mode === "create" ? idempotencyKey : undefined,
          items: payloadItems,
        },
        order?.id,
      );

      if (isSuccess) {
        onOpenChange(false);
      }
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Không thể lưu đơn hàng. Vui lòng thử lại.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92svh] max-w-3xl rounded-xl border-slate-200 bg-white p-0 shadow-xl">
        <div className="sticky top-0 z-10 border-b border-slate-100 bg-white p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <DialogTitle className="text-xl font-extrabold text-slate-800">
                {mode === "edit" ? "Sửa đơn tại shop" : "Tạo đơn tại shop"}
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm font-medium text-slate-500">
                Chỉ cần chọn sản phẩm, giá bán và phương thức thanh toán.
              </DialogDescription>
            </div>
            <DialogClose asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="rounded-full bg-slate-50 text-slate-500"
              >
                <X className="size-4" />
              </Button>
            </DialogClose>
          </div>
        </div>

        <div className="space-y-4 p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Phương thức thanh toán
              </span>
              <OrderSelect
                name="orderPaymentMethod"
                value={form.paymentMethod}
                options={[
                  { value: "CASH", label: "Tiền mặt" },
                  { value: "BANK_TRANSFER", label: "Chuyển khoản" },
                  { value: "MOMO", label: "MoMo" },
                ]}
                placeholder="Phương thức thanh toán"
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    paymentMethod: value as OrderFormState["paymentMethod"],
                  }))
                }
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Trạng thái thanh toán
              </span>
              <OrderSelect
                name="orderPaymentStatus"
                value={form.paymentStatus}
                options={[
                  { value: "PAID", label: "Đã thanh toán" },
                  { value: "UNPAID", label: "Chưa thanh toán" },
                ]}
                placeholder="Trạng thái thanh toán"
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    paymentStatus: value as OrderFormState["paymentStatus"],
                  }))
                }
              />
            </label>
          </div>

          <div>
            <span className="mb-2 block text-sm font-bold text-slate-700">
              Thêm sản phẩm
            </span>
            <ShopOrderProductPicker
              products={products}
              selectedKeys={selectedKeys}
              onSelect={addProduct}
            />
            {form.items.length > 0 ? (
              <p className="mt-1.5 text-xs font-semibold text-slate-400">
                Đã chọn {form.items.length} sản phẩm/biến thể
              </p>
            ) : null}
          </div>

          <div className="space-y-3">
            {form.items.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                <PackageCheck className="mx-auto size-8 text-slate-300" />
                <p className="mt-3 text-sm font-bold text-slate-500">
                  Chưa chọn sản phẩm nào
                </p>
              </div>
            ) : (
              form.items.map((item, index) => {
                const quantity = Number(item.quantity || 0);
                const unitPrice = parseMoneyInput(item.unitPrice);
                const lineSubtotal = unitPrice * quantity;
                const priceChanged = unitPrice !== item.originalUnitPrice;

                return (
                  <div
                    key={getItemKey(item)}
                    className="rounded-lg border border-slate-200 bg-white p-3"
                  >
                    <div className="flex items-start gap-3">
                      <ProductImage
                        imageUrl={item.imageUrl}
                        title={item.title}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-base font-extrabold text-slate-700">
                          {item.title}
                        </p>
                        <div className="mt-1 flex min-w-0 items-center gap-1.5 text-xs font-bold uppercase tracking-[0.06em] text-slate-400">
                          {item.colorCode ? (
                            <span
                              className="size-3 shrink-0 rounded-full border border-black/10"
                              style={{ backgroundColor: item.colorCode }}
                            />
                          ) : null}
                          <p className="truncate">
                            {item.variantLabel || item.categoryName}
                            {item.sku ? ` • ${item.sku}` : ""}
                          </p>
                        </div>
                        {item.productStatus === "PRIVATE" ? (
                          <p className="mt-1 text-xs font-semibold normal-case tracking-normal text-(--admin-primary)">
                            Sản phẩm Riêng tư — chỉ bán trong đơn tại shop.
                          </p>
                        ) : null}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="rounded-full bg-rose-50 text-rose-500 hover:bg-rose-100"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>

                    <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_150px]">
                      <label className="block">
                        <span className="mb-1 block text-xs font-bold text-slate-400">
                          Giá bán
                        </span>
                        <PriceNumberInput
                          name={`orderItemUnitPrice-${index}`}
                          value={item.unitPrice}
                          onChange={(value) =>
                            updateItem(index, {
                              unitPrice: value,
                            })
                          }
                        />
                        <p className="mt-1 text-xs font-semibold text-slate-400">
                          Giá gốc: {formatMoney(item.originalUnitPrice)}
                          {priceChanged ? (
                            <span className="ml-2 text-orange-600">
                              Đã chỉnh{" "}
                              {formatMoney(unitPrice - item.originalUnitPrice)}
                            </span>
                          ) : null}
                        </p>
                      </label>
                      <div>
                        <span className="mb-1 block text-xs font-bold text-slate-400">
                          Số lượng
                        </span>
                        <div className="grid grid-cols-[40px_1fr_40px] overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-11 rounded-none"
                            onClick={() =>
                              updateItem(index, {
                                quantity: String(Math.max(quantity - 1, 1)),
                              })
                            }
                            disabled={quantity <= 1}
                          >
                            <Minus className="size-4" />
                          </Button>
                          <input
                            value={item.quantity}
                            inputMode="numeric"
                            onChange={(event) =>
                              updateItem(index, {
                                quantity: event.target.value.replace(
                                  /[^\d]/g,
                                  "",
                                ),
                              })
                            }
                            className="h-11 min-w-0 bg-transparent text-center text-sm font-extrabold text-slate-700 outline-none"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-11 rounded-none"
                            onClick={() =>
                              updateItem(index, {
                                quantity: String(
                                  Math.min(quantity + 1, item.availableStock),
                                ),
                              })
                            }
                            disabled={quantity >= item.availableStock}
                          >
                            <Plus className="size-4" />
                          </Button>
                        </div>
                        <p className="mt-1 text-xs font-semibold text-slate-400">
                          Khả dụng:{" "}
                          {item.availableStock.toLocaleString("vi-VN")}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2 text-sm font-bold">
                      <span className="text-slate-400">Thành tiền</span>
                      <span className="text-slate-700">
                        {formatMoney(lineSubtotal)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="sticky bottom-0 rounded-lg border border-slate-200 bg-white p-4 shadow-md">
            <div className="grid gap-2 text-sm font-semibold text-slate-500 sm:grid-cols-2">
              <p>
                Tổng số lượng: {totals.totalQuantity.toLocaleString("vi-VN")}
              </p>
              <p>Tạm tính: {formatMoney(totals.subtotal)}</p>
              <p>Giá vốn: {formatMoney(totals.totalCost)}</p>
              <p
                className={
                  totals.profit < 0
                    ? "font-extrabold text-rose-600"
                    : "font-extrabold text-green-13"
                }
              >
                Lợi nhuận dự kiến: {formatMoney(totals.profit)}
              </p>
            </div>
            {error ? (
              <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm font-bold text-rose-600">
                {error}
              </p>
            ) : null}
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="adminPrimary"
                className="h-12 flex-1 rounded-2xl"
                onClick={() => void submit()}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <RotateCcw className="size-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="size-4" />
                )}
                {mode === "edit" ? "Lưu đơn" : "Tạo đơn"}
              </Button>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-12 rounded-2xl border border-slate-100 bg-slate-50"
                >
                  Đóng
                </Button>
              </DialogClose>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function OrderDetailDialog({
  order,
  open,
  onOpenChange,
}: {
  order: DailyOrder | null;
  open: boolean;
  onOpenChange: (value: boolean) => void;
}) {
  if (!order) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92svh] max-w-2xl rounded-xl border-slate-200 bg-white p-0 shadow-xl">
        <div className="sticky top-0 z-10 border-b border-slate-100 bg-white p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <DialogTitle className="text-xl font-extrabold text-slate-800">
                {order.orderNumber}
              </DialogTitle>
              <DialogDescription className="mt-2 flex flex-wrap gap-2">
                <SourceBadge source={order.source} />
                <StatusBadge status={order.status} />
                <PaymentBadge status={order.paymentStatus} />
              </DialogDescription>
            </div>
            <DialogClose asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="rounded-full"
              >
                <X className="size-4" />
              </Button>
            </DialogClose>
          </div>
        </div>
        <div className="space-y-4 p-5">
          <div className="grid gap-2 rounded-lg bg-slate-50 p-4 text-sm font-semibold text-slate-600 sm:grid-cols-2">
            <p>Nguồn đơn: {ORDER_SOURCE_LABELS[order.source]}</p>
            <p>
              Phương thức:{" "}
              {order.paymentMethod
                ? PAYMENT_METHOD_LABELS[order.paymentMethod]
                : "Chưa có"}
            </p>
            <p>Tổng tiền: {formatMoney(order.totalAmount)}</p>
            <p>Lợi nhuận: {formatMoney(order.profit)}</p>
            {order.createdBy ? (
              <p>
                Người tạo:{" "}
                {order.createdBy.displayName || order.createdBy.email}
              </p>
            ) : null}
          </div>

          {order.source === "ONLINE" && order.receiver ? (
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-sm font-extrabold text-slate-700">
                Thông tin giao hàng
              </p>
              <div className="mt-2 space-y-1 text-sm font-medium text-slate-500">
                {order.receiver.name ? (
                  <p>Người nhận: {order.receiver.name}</p>
                ) : null}
                {order.receiver.phone ? (
                  <p>SĐT: {order.receiver.phone}</p>
                ) : null}
                {order.receiver.address ? (
                  <p>Địa chỉ: {order.receiver.address}</p>
                ) : null}
              </div>
            </div>
          ) : null}

          <div className="space-y-3">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-slate-200 bg-white p-3"
              >
                <div className="flex gap-3">
                  <ProductImage
                    imageUrl={item.productImageUrl}
                    title={item.productTitle}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-extrabold text-slate-700">
                      {item.productTitle}
                    </p>
                    <div className="mt-1 flex min-w-0 items-center gap-1.5 text-xs font-bold text-slate-400">
                      {getSnapshotColorCode(item.variantOptionsSnapshot) ? (
                        <span
                          className="size-3 shrink-0 rounded-full border border-black/10"
                          style={{
                            backgroundColor: getSnapshotColorCode(
                              item.variantOptionsSnapshot,
                            ),
                          }}
                        />
                      ) : null}
                      <p className="truncate">
                        {[item.color, item.size].filter(Boolean).join(" / ")}
                        {item.sku ? ` • ${item.sku}` : ""}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-semibold text-slate-500 sm:grid-cols-4">
                  <p>Giá gốc: {formatMoney(item.originalUnitPrice)}</p>
                  <p>Giá bán: {formatMoney(item.unitPrice)}</p>
                  <p>Số lượng: {item.quantity}</p>
                  <p className="font-extrabold text-slate-700">
                    Tổng: {formatMoney(item.lineSubtotal)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CancelDialog({
  order,
  open,
  isSubmitting,
  onOpenChange,
  onConfirm,
}: {
  order: DailyOrder | null;
  open: boolean;
  isSubmitting: boolean;
  onOpenChange: (value: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-xl border-slate-200 bg-white p-5 shadow-xl">
        <DialogTitle className="text-xl font-extrabold text-slate-800">
          Hủy đơn tại shop
        </DialogTitle>
        <DialogDescription className="mt-2 text-sm font-medium text-slate-500">
          Tồn kho sẽ được hoàn lại và đơn không còn tính vào doanh thu.
        </DialogDescription>
        {order ? (
          <div className="mt-4 rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-700">
            <p>Mã đơn: {order.orderNumber}</p>
            <p>Tổng tiền: {formatMoney(order.totalAmount)}</p>
            <p>Số sản phẩm: {order.totalQuantity}</p>
          </div>
        ) : null}
        <div className="mt-5 flex gap-2">
          <Button
            type="button"
            variant="adminDanger"
            className="h-11 flex-1 rounded-2xl"
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <RotateCcw className="size-4 animate-spin" />
            ) : null}
            Xác nhận hủy
          </Button>
          <DialogClose asChild>
            <Button
              type="button"
              variant="ghost"
              className="h-11 rounded-2xl border border-slate-100"
            >
              Đóng
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function OrderActions({
  order,
  updatingOrderId,
  onView,
  onEdit,
  onCancel,
  onAdvanceStatus,
}: {
  order: DailyOrder;
  updatingOrderId: number | null;
  onView: (order: DailyOrder) => void;
  onEdit: (order: DailyOrder) => void;
  onCancel: (order: DailyOrder) => void;
  onAdvanceStatus: (order: DailyOrder) => void;
}) {
  const canEdit = order.source === "OFFLINE" && order.status !== "CANCELLED";
  const nextOnlineStatus =
    order.source === "ONLINE" ? NEXT_ONLINE_STATUS[order.status] : undefined;
  const hasSecondaryActions = canEdit || Boolean(nextOnlineStatus);

  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100"
        aria-label="Xem chi tiết"
        title="Xem chi tiết"
        onClick={() => onView(order)}
      >
        <Eye className="size-4" />
      </Button>
      {hasSecondaryActions ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100"
              aria-label="Mở hành động đơn hàng"
              title="Hành động"
            >
              {updatingOrderId === order.id ? (
                <RotateCcw className="size-4 animate-spin" />
              ) : (
                <MoreHorizontal className="size-4" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {nextOnlineStatus ? (
              <DropdownMenuItem
                onClick={() => void onAdvanceStatus(order)}
                disabled={updatingOrderId === order.id}
              >
                <CheckCircle2 className="size-4 text-blue-2" />
                {nextOnlineStatus.label}
              </DropdownMenuItem>
            ) : null}
            {canEdit ? (
              <>
                <DropdownMenuItem onClick={() => onEdit(order)}>
                  <Pencil className="size-4 text-slate-500" />
                  Sửa đơn
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-rose-600 focus:text-rose-600"
                  onClick={() => onCancel(order)}
                >
                  <Trash2 className="size-4" />
                  Hủy đơn
                </DropdownMenuItem>
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </div>
  );
}

function OrderRow({
  order,
  updatingOrderId,
  onView,
  onEdit,
  onCancel,
  onAdvanceStatus,
}: {
  order: DailyOrder;
  updatingOrderId: number | null;
  onView: (order: DailyOrder) => void;
  onEdit: (order: DailyOrder) => void;
  onCancel: (order: DailyOrder) => void;
  onAdvanceStatus: (order: DailyOrder) => void;
}) {
  return (
    <article className="w-full max-w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-3">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className="truncate text-base font-extrabold text-slate-800"
            title={order.orderNumber}
          >
            {order.orderNumber}
          </p>
          <p className="mt-1 text-xs font-semibold text-slate-400">
            {new Date(order.placedAt).toLocaleString("vi-VN", {
              timeZone: "Asia/Ho_Chi_Minh",
              hour: "2-digit",
              minute: "2-digit",
              day: "2-digit",
              month: "2-digit",
            })}
          </p>
        </div>
        <p className="shrink-0 whitespace-nowrap text-sm font-extrabold text-slate-800">
          {formatMoney(order.totalAmount)}
        </p>
      </div>
      {order.source === "ONLINE" && order.customer ? (
        <p
          className="mt-2 truncate text-xs font-semibold text-slate-500"
          title={
            order.customer.displayName ||
            order.customer.email ||
            order.customer.phone ||
            undefined
          }
        >
          {order.customer.displayName ||
            order.customer.email ||
            order.customer.phone}
        </p>
      ) : null}
      <div className="mt-3 w-full max-w-full min-w-0 rounded-xl bg-slate-50 p-3">
        <p
          className="truncate text-sm font-bold text-slate-700"
          title={order.firstProductTitle || "Đơn hàng"}
        >
          {order.firstProductTitle || "Đơn hàng"}
        </p>
        {order.itemCount > 1 ? (
          <p className="mt-1 text-xs font-semibold text-slate-400">
            +{order.itemCount - 1} sản phẩm khác
          </p>
        ) : null}
      </div>
      <div className="mt-3 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {order.source === "OFFLINE" ? (
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-400">Lợi nhuận</p>
            <p className="whitespace-nowrap font-extrabold text-slate-700">
              {formatMoney(order.profit)}
            </p>
          </div>
        ) : null}
        <div className="flex min-w-0 flex-wrap gap-1.5 sm:justify-end">
          <PaymentBadge status={order.paymentStatus} />
          <StatusBadge status={order.status} />
        </div>
      </div>
      <div className="mt-3 flex justify-end">
        <OrderActions
          order={order}
          updatingOrderId={updatingOrderId}
          onView={onView}
          onEdit={onEdit}
          onCancel={onCancel}
          onAdvanceStatus={onAdvanceStatus}
        />
      </div>
    </article>
  );
}

export default function DailyOrderSection({
  data,
  isLoading: isDailyLoading,
  reload,
  onReload,
}: {
  data: DailyDetailResponse | undefined;
  isLoading: boolean;
  reload: boolean;
  onReload: () => void;
}) {
  const dailyId = data?.id;
  const [orders, setOrders] = useState<DailyOrderListResponse | null>(null);
  const [products, setProducts] = useState<ShopOrderProductOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProductLoading, setIsProductLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeTab, setActiveTab] = useState<OrderTabValue>("OFFLINE");
  const [status, setStatus] = useState<OrderStatusValue | FilterValue>("ALL");
  const [paymentStatus, setPaymentStatus] = useState<
    PaymentStatusValue | FilterValue
  >("ALL");
  const [paymentMethod, setPaymentMethod] = useState<
    PaymentMethodValue | FilterValue
  >("ALL");
  const [formMode, setFormMode] = useState<OrderDialogMode>("create");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<DailyOrder | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const tableScrollerRef = useRef<HTMLDivElement | null>(null);
  const activeFilterCount =
    (activeTab === "ONLINE" && status !== "ALL" ? 1 : 0) +
    (paymentStatus !== "ALL" ? 1 : 0) +
    (paymentMethod !== "ALL" ? 1 : 0);
  const hasActiveFilter =
    Boolean(debouncedSearch) ||
    (activeTab === "ONLINE" && status !== "ALL") ||
    paymentStatus !== "ALL" ||
    paymentMethod !== "ALL";

  const fetchOrders = async (showLoading = true) => {
    if (!dailyId) {
      return;
    }

    if (showLoading) {
      setIsLoading(true);
    }

    const res = await financeAPI.getDailyOrders(dailyId, {
      search: debouncedSearch || undefined,
      source: activeTab,
      status: activeTab === "ONLINE" ? status : "ALL",
      paymentStatus,
      paymentMethod,
    });

    if (res.code === RESPONSE_CODES.success && res.data) {
      setOrders(res.data);
    } else {
      toast({
        title:
          (res.data as { message?: string } | undefined)?.message ||
          "Không tải được danh sách đơn hàng",
        className: "bg-red-1 text-white text-sm font-medium",
        duration: 3000,
      });
    }

    setIsLoading(false);
  };

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(search), 300);

    return () => window.clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    void fetchOrders();
  }, [
    dailyId,
    debouncedSearch,
    activeTab,
    status,
    paymentStatus,
    paymentMethod,
  ]);

  useEffect(() => {
    if (tableScrollerRef.current) {
      tableScrollerRef.current.scrollLeft = 0;
    }
  }, [activeTab]);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsProductLoading(true);
      const firstPage = await financeAPI.getProductList({
        page: 1,
        limit: 100,
      });

      if (firstPage.code === RESPONSE_CODES.success && firstPage.data) {
        const allProducts = [...firstPage.data.data];
        const totalPages = firstPage.data.pagination.totalPage;

        for (let page = 2; page <= totalPages; page += 1) {
          const nextPage = await financeAPI.getProductList({
            page,
            limit: 100,
          });

          if (nextPage.code !== RESPONSE_CODES.success || !nextPage.data) {
            toast({
              title: "Không tải đủ danh sách sản phẩm. Vui lòng thử lại.",
              className: "bg-red-1 text-white text-sm font-medium",
              duration: 3000,
            });
            break;
          }

          allProducts.push(...nextPage.data.data);
        }

        setProducts(mapShopOrderProducts(allProducts));
      } else {
        toast({
          title: "Không tải được sản phẩm để tạo đơn tại shop.",
          className: "bg-red-1 text-white text-sm font-medium",
          duration: 3000,
        });
      }

      setIsProductLoading(false);
    };

    void fetchProducts();
  }, [reload]);

  const submitOrder = async (
    payload: OfflineOrderPayload,
    orderId?: number,
  ) => {
    const res =
      formMode === "edit" && orderId
        ? await financeAPI.updateOrder(orderId, payload)
        : dailyId
          ? await financeAPI.createDailyOrder(dailyId, payload)
          : null;

    if (!res || res.code !== RESPONSE_CODES.success || !res.data?.id) {
      throw new Error(
        (res?.data as { message?: string } | undefined)?.message ||
          "Không thể lưu đơn hàng. Vui lòng thử lại.",
      );
    }

    const savedOrder = res.data;

    if (formMode === "create") {
      setActiveTab("OFFLINE");
      setOrders((current) =>
        current
          ? {
              ...current,
              items: [
                savedOrder,
                ...current.items.filter((item) => item.id !== savedOrder.id),
              ],
              counts: {
                ...current.counts,
                offline: current.counts.offline + 1,
              },
            }
          : current,
      );
    }

    toast({
      title:
        formMode === "edit" ? "Đã cập nhật đơn hàng" : "Đã tạo đơn tại shop",
      className: "bg-green-16 text-white text-sm font-medium w-fit",
      duration: 3000,
    });
    await fetchOrders(false);
    onReload();
    return true;
  };

  const openCreate = () => {
    setFormMode("create");
    setSelectedOrder(null);
    setIsFormOpen(true);
  };

  const openEdit = (order: DailyOrder) => {
    setFormMode("edit");
    setSelectedOrder(order);
    setIsFormOpen(true);
  };

  const openDetail = (order: DailyOrder) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const openCancel = (order: DailyOrder) => {
    setSelectedOrder(order);
    setIsCancelOpen(true);
  };

  const cancelOrder = async () => {
    if (!selectedOrder) {
      return;
    }

    setIsCancelling(true);
    const res = await financeAPI.cancelOrder(selectedOrder.id);
    setIsCancelling(false);

    if (res.code !== RESPONSE_CODES.success) {
      toast({
        title:
          (res.data as { message?: string } | undefined)?.message ||
          "Không thể hủy đơn hàng",
        className: "bg-red-1 text-white text-sm font-medium",
        duration: 3000,
      });
      return;
    }

    setIsCancelOpen(false);
    toast({
      title: "Đã hủy đơn và hoàn tồn kho",
      className: "bg-green-16 text-white text-sm font-medium w-fit",
      duration: 3000,
    });
    await fetchOrders(false);
    onReload();
  };

  const resetFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setStatus("ALL");
    setPaymentStatus("ALL");
    setPaymentMethod("ALL");
  };

  const advanceOnlineStatus = async (order: DailyOrder) => {
    const nextStatus = NEXT_ONLINE_STATUS[order.status];

    if (!nextStatus) {
      return;
    }

    setUpdatingOrderId(order.id);
    const res = await financeAPI.updateOrderStatus(order.id, {
      status: nextStatus.value,
    });
    setUpdatingOrderId(null);

    if (res.code !== RESPONSE_CODES.success || !res.data?.id) {
      toast({
        title:
          (res.data as { message?: string } | undefined)?.message ||
          "Không thể cập nhật trạng thái đơn online",
        className: "bg-red-1 text-white text-sm font-medium",
        duration: 3000,
      });
      return;
    }

    const savedOrder = res.data;

    setOrders((current) =>
      current
        ? {
            ...current,
            items: current.items.map((item) =>
              item.id === savedOrder.id ? savedOrder : item,
            ),
          }
        : current,
    );
    toast({
      title: `Đã chuyển đơn sang "${nextStatus.label}"`,
      className: "bg-green-16 text-white text-sm font-medium w-fit",
      duration: 3000,
    });
    await fetchOrders(false);
    onReload();
  };

  return (
    <div className="order-management-section w-full max-w-full min-w-0 space-y-4 rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="shrink-0 rounded-lg bg-blue-3 p-2">
            <ReceiptText className="size-4 text-blue-6" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-extrabold uppercase text-slate-700">
              Quản lý đơn hàng
            </p>
            <p className="mt-0.5 text-xs font-semibold text-slate-400">
              Đơn tại shop và đơn online trong ngày
            </p>
          </div>
        </div>
        {activeTab === "OFFLINE" ? (
          <Button
            type="button"
            variant="adminPrimary"
            className="h-10 w-full shrink-0 rounded-lg px-4 sm:w-auto"
            onClick={openCreate}
            disabled={isDailyLoading || isProductLoading}
          >
            <Plus className="size-4" />
            Tạo đơn tại shop
          </Button>
        ) : null}
      </div>

      {isLoading || !orders ? (
        <div className="space-y-3 bg-white">
          <Skeleton className="h-10 rounded-lg bg-slate-100" />
          <Skeleton className="h-12 rounded-lg bg-slate-100" />
          <Skeleton className="h-40 rounded-xl bg-slate-100" />
        </div>
      ) : (
        <>
          <div className="inline-grid w-full max-w-full min-w-0 grid-cols-2 gap-1 rounded-xl border border-slate-100 bg-slate-50 p-1 sm:w-auto">
            {[
              {
                value: "OFFLINE" as const,
                label: "Tại shop",
                count: orders.counts.offline,
              },
              {
                value: "ONLINE" as const,
                label: "Online",
                count: orders.counts.online,
              },
            ].map((tab) => {
              const isActive = activeTab === tab.value;

              return (
                <Button
                  key={tab.value}
                  type="button"
                  variant={isActive ? "adminPrimary" : "ghost"}
                  className={`h-9 rounded-lg px-3 text-sm font-bold ${
                    isActive
                      ? ""
                      : "bg-transparent text-slate-500 hover:bg-white"
                  }`}
                  onClick={() => setActiveTab(tab.value)}
                >
                  {tab.label} {tab.count.toLocaleString("vi-VN")}
                </Button>
              );
            })}
          </div>

          <OrderFilters
            activeTab={activeTab}
            search={search}
            status={status}
            paymentStatus={paymentStatus}
            paymentMethod={paymentMethod}
            activeFilterCount={activeFilterCount}
            onSearchChange={setSearch}
            onStatusChange={setStatus}
            onPaymentStatusChange={setPaymentStatus}
            onPaymentMethodChange={setPaymentMethod}
            onReset={resetFilters}
          />

          {orders.items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center">
              {hasActiveFilter ? (
                <>
                  <AlertTriangle className="mx-auto size-8 text-slate-300" />
                  <p className="mt-3 text-base font-extrabold text-slate-600">
                    Không tìm thấy đơn hàng phù hợp
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-400">
                    Hãy thay đổi hoặc xóa bộ lọc hiện tại.
                  </p>
                </>
              ) : (
                <>
                  <ReceiptText className="mx-auto size-8 text-slate-300" />
                  <p className="mt-3 text-base font-extrabold text-slate-600">
                    Chưa có đơn hàng trong ngày này
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-400">
                    {activeTab === "OFFLINE"
                      ? "Đơn tạo tại shop sẽ xuất hiện tại đây."
                      : "Đơn online trong ngày sẽ xuất hiện tại đây."}
                  </p>
                  {activeTab === "OFFLINE" ? (
                    <Button
                      type="button"
                      variant="adminPrimary"
                      className="mt-4 h-10 rounded-lg"
                      onClick={openCreate}
                    >
                      <Plus className="size-4" />
                      Tạo đơn tại shop
                    </Button>
                  ) : null}
                </>
              )}
            </div>
          ) : (
            <div className="w-full max-w-full min-w-0 space-y-3">
              <div
                ref={tableScrollerRef}
                className="order-management-table w-full max-w-full min-w-0 overflow-x-auto rounded-xl border border-slate-100 bg-white"
              >
                <div
                  className={`w-full ${
                    activeTab === "ONLINE" ? "min-w-230" : "min-w-190"
                  }`}
                >
                  <div
                    className={`grid gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3 text-xs font-extrabold uppercase text-slate-400 ${
                      activeTab === "ONLINE"
                        ? "grid-cols-[150px_180px_minmax(220px,1fr)_120px_140px_120px_96px]"
                        : "grid-cols-[150px_minmax(220px,1fr)_140px_120px_120px_96px]"
                    }`}
                  >
                    <span className="whitespace-nowrap">Mã đơn / giờ</span>
                    {activeTab === "ONLINE" ? (
                      <span className="whitespace-nowrap">Khách hàng</span>
                    ) : null}
                    <span className="whitespace-nowrap">Sản phẩm</span>
                    {activeTab === "ONLINE" ? (
                      <span className="whitespace-nowrap">Trạng thái</span>
                    ) : null}
                    <span className="whitespace-nowrap">Thanh toán</span>
                    <span className="whitespace-nowrap text-right">
                      Tổng tiền
                    </span>
                    {activeTab === "OFFLINE" ? (
                      <span className="whitespace-nowrap text-right">
                        Lợi nhuận
                      </span>
                    ) : null}
                    <span className="whitespace-nowrap text-right">
                      Hành động
                    </span>
                  </div>
                  {orders.items.map((order) => (
                    <div
                      key={order.id}
                      className={`grid items-center gap-3 border-b border-slate-50 px-4 py-3 last:border-b-0 ${
                        activeTab === "ONLINE"
                          ? "grid-cols-[150px_180px_minmax(220px,1fr)_120px_140px_120px_96px]"
                          : "grid-cols-[150px_minmax(220px,1fr)_140px_120px_120px_96px]"
                      }`}
                    >
                      <div className="min-w-0">
                        <p
                          className="truncate text-sm font-extrabold text-slate-700"
                          title={order.orderNumber}
                        >
                          {order.orderNumber}
                        </p>
                        <p className="mt-1 whitespace-nowrap text-xs font-semibold text-slate-400">
                          {new Date(order.placedAt).toLocaleTimeString(
                            "vi-VN",
                            {
                              timeZone: "Asia/Ho_Chi_Minh",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </p>
                      </div>
                      {activeTab === "ONLINE" ? (
                        <p
                          className="truncate text-sm font-bold text-slate-600"
                          title={
                            order.customer?.displayName ||
                            order.customer?.email ||
                            order.receiver?.name ||
                            "Khách online"
                          }
                        >
                          {order.customer?.displayName ||
                            order.customer?.email ||
                            order.receiver?.name ||
                            "Khách online"}
                        </p>
                      ) : null}
                      <div className="min-w-0">
                        <p
                          className="truncate text-sm font-bold text-slate-700"
                          title={order.firstProductTitle || "Đơn hàng"}
                        >
                          {order.firstProductTitle || "Đơn hàng"}
                        </p>
                        {order.itemCount > 1 ? (
                          <p className="mt-1 truncate text-xs font-semibold text-slate-400">
                            +{order.itemCount - 1} sản phẩm khác
                          </p>
                        ) : null}
                      </div>
                      {activeTab === "ONLINE" ? (
                        <StatusBadge status={order.status} />
                      ) : null}
                      <PaymentBadge status={order.paymentStatus} />
                      <p className="whitespace-nowrap text-right text-sm font-extrabold text-slate-800">
                        {formatMoney(order.totalAmount)}
                      </p>
                      {activeTab === "OFFLINE" ? (
                        <p className="whitespace-nowrap text-right text-sm font-extrabold text-slate-700">
                          {formatMoney(order.profit)}
                        </p>
                      ) : null}
                      <OrderActions
                        order={order}
                        updatingOrderId={updatingOrderId}
                        onView={openDetail}
                        onEdit={openEdit}
                        onCancel={openCancel}
                        onAdvanceStatus={advanceOnlineStatus}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="order-management-cards w-full max-w-full min-w-0 gap-3">
                {orders.items.map((order) => (
                  <OrderRow
                    key={order.id}
                    order={order}
                    updatingOrderId={updatingOrderId}
                    onView={openDetail}
                    onEdit={openEdit}
                    onCancel={openCancel}
                    onAdvanceStatus={advanceOnlineStatus}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <OrderFormDialog
        open={isFormOpen}
        mode={formMode}
        products={products}
        order={selectedOrder}
        onOpenChange={setIsFormOpen}
        onSubmit={submitOrder}
      />
      <OrderDetailDialog
        order={selectedOrder}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
      <CancelDialog
        order={selectedOrder}
        open={isCancelOpen}
        isSubmitting={isCancelling}
        onOpenChange={setIsCancelOpen}
        onConfirm={() => void cancelOrder()}
      />
    </div>
  );
}
