"use client";

import { OfflineOrderEditor } from "@/components/DailyDetail/OfflineOrderEditor";
import CustomSelect from "@/components/common/CustomFields/CustomSelect";
import { Button } from "@/components/ui/button";
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
  mapShopOrderProducts,
  type ShopOrderProductOption,
} from "@/lib/orders/shop-order-products";
import { ONLINE_STATUS_FLOW, ORDER_STATUS_CONFIG } from "@/lib/orders/order-status";
import type { FieldInputProps, FieldMetaProps, FormikProps } from "formik";
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  ImageOff,
  MoreHorizontal,
  Pencil,
  Plus,
  ReceiptText,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import {
  type ComponentType,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type OrderTabValue = "OFFLINE" | "ONLINE";
type FilterValue = "ALL";
type OrderDialogMode = "create" | "edit";
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

const RuntimeCustomSelect =
  CustomSelect as unknown as ComponentType<RuntimeSelectProps>;

const ORDER_SOURCE_LABELS: Record<OrderSourceValue, string> = {
  OFFLINE: "Tại shop",
  ONLINE: "Online",
};

const ORDER_STATUS_LABELS: Record<OrderStatusValue, string> = {
  PENDING: ORDER_STATUS_CONFIG.PENDING.shortLabel,
  CONFIRMED: ORDER_STATUS_CONFIG.CONFIRMED.shortLabel,
  PREPARING: ORDER_STATUS_CONFIG.PREPARING.shortLabel,
  READY_TO_SHIP: ORDER_STATUS_CONFIG.READY_TO_SHIP.shortLabel,
  SHIPPING: ORDER_STATUS_CONFIG.SHIPPING.shortLabel,
  PROCESSING: ORDER_STATUS_CONFIG.PROCESSING.shortLabel,
  SHIPPED: ORDER_STATUS_CONFIG.SHIPPED.shortLabel,
  DELIVERED: ORDER_STATUS_CONFIG.DELIVERED.shortLabel,
  COMPLETED: ORDER_STATUS_CONFIG.COMPLETED.shortLabel,
  CANCELLED: ORDER_STATUS_CONFIG.CANCELLED.shortLabel,
  REFUNDED: ORDER_STATUS_CONFIG.REFUNDED.shortLabel,
};

const NEXT_ONLINE_STATUS: Partial<
  Record<OrderStatusValue, { value: OrderStatusValue; label: string }>
> = {
  ...Object.fromEntries(
    Object.entries(ONLINE_STATUS_FLOW).map(([status, nextStatus]) => [
      status,
      {
        value: nextStatus,
        label: ORDER_STATUS_LABELS[nextStatus],
      },
    ]),
  ),
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

const formatMoney = (value: number) => `${formatCurrencyVND(value)}đ`;

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

function InvoiceBadge({ invoice }: { invoice: DailyOrder["invoice"] }) {
  return invoice?.status === "ISSUED" ? (
    <span className="inline-flex h-6 items-center gap-1 whitespace-nowrap rounded-md bg-emerald-50 px-2 text-xs font-bold text-emerald-700">
      <ReceiptText className="size-3" /> Đã phát hành
    </span>
  ) : (
    <span className="inline-flex h-6 items-center whitespace-nowrap rounded-md bg-slate-100 px-2 text-xs font-bold text-slate-500">
      Chưa xuất
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
      <DialogContent className="shop-order-modal max-h-[92svh] max-w-2xl rounded-xl border-slate-200 bg-white p-0 shadow-xl">
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
  reason,
  onReasonChange,
  onConfirm,
}: {
  order: DailyOrder | null;
  open: boolean;
  isSubmitting: boolean;
  onOpenChange: (value: boolean) => void;
  reason: string;
  onReasonChange: (value: string) => void;
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
        <label className="mt-4 grid gap-2 text-sm font-bold text-slate-700">
          Lý do hủy <span className="text-red-600">*</span>
          <textarea
            value={reason}
            onChange={(event) => onReasonChange(event.target.value)}
            placeholder="Nhập lý do hủy đơn"
            maxLength={500}
            className="min-h-24 w-full rounded-xl border border-slate-200 p-3 font-normal outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
          />
        </label>
        <div className="mt-5 flex gap-2">
          <Button
            type="button"
            variant="adminDanger"
            className="h-11 flex-1 rounded-2xl"
            onClick={onConfirm}
            disabled={isSubmitting || !reason.trim()}
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
  dailyId,
  updatingOrderId,
  onView,
  onEdit,
  onCancel,
  onAdvanceStatus,
}: {
  order: DailyOrder;
  dailyId?: number;
  updatingOrderId: number | null;
  onView: (order: DailyOrder) => void;
  onEdit: (order: DailyOrder) => void;
  onCancel: (order: DailyOrder) => void;
  onAdvanceStatus: (order: DailyOrder) => void;
}) {
  const canEdit = order.source === "OFFLINE" && order.status !== "CANCELLED";
  const canCancel =
    order.source === "OFFLINE" ||
    (order.source === "ONLINE" && order.status === "PENDING");
  const nextOnlineStatus =
    order.source === "ONLINE" ? NEXT_ONLINE_STATUS[order.status] : undefined;
  const hasSecondaryActions = true;

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
          <DropdownMenuContent
            align="end"
            className="w-56 rounded-xl border-slate-200 p-1.5 shadow-xl"
          >
            <DropdownMenuItem
              asChild
              className="gap-2 rounded-lg px-3 py-2.5 font-semibold"
            >
              <Link
                href={
                  dailyId
                    ? `/admin/invoices/${order.id}?returnTo=${encodeURIComponent(`/admin/daily-detail/${dailyId}?tab=invoices`)}`
                    : `/admin/invoices/${order.id}`
                }
              >
                <ReceiptText className="size-4 text-primary" />
                {order.invoice ? "Xem hóa đơn" : "Xuất hóa đơn"}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {nextOnlineStatus ? (
              <DropdownMenuItem
                className="gap-2 rounded-lg px-3 py-2.5"
                onClick={() => void onAdvanceStatus(order)}
                disabled={updatingOrderId === order.id}
              >
                <CheckCircle2 className="size-4 text-blue-2" />
                {nextOnlineStatus.label}
              </DropdownMenuItem>
            ) : null}
            {canEdit ? (
              <>
                <DropdownMenuItem
                  className="gap-2 rounded-lg px-3 py-2.5"
                  onClick={() => onEdit(order)}
                >
                  <Pencil className="size-4 text-slate-500" />
                  Sửa đơn
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="gap-2 rounded-lg px-3 py-2.5 text-rose-600 focus:bg-rose-50 focus:text-rose-600"
                  onClick={() => onCancel(order)}
                >
                  <Trash2 className="size-4" />
                  Hủy đơn
                </DropdownMenuItem>
              </>
            ) : null}
            {!canEdit && canCancel ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="gap-2 rounded-lg px-3 py-2.5 text-rose-600 focus:bg-rose-50 focus:text-rose-600"
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
  dailyId,
  updatingOrderId,
  onView,
  onEdit,
  onCancel,
  onAdvanceStatus,
}: {
  order: DailyOrder;
  dailyId?: number;
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
          <InvoiceBadge invoice={order.invoice} />
        </div>
      </div>
      <div className="mt-3 flex justify-end">
        <OrderActions
          order={order}
          dailyId={dailyId}
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
  invoiceOnly = false,
}: {
  data: DailyDetailResponse | undefined;
  isLoading: boolean;
  reload: boolean;
  onReload: () => void;
  invoiceOnly?: boolean;
}) {
  const dailyId = data?.id;
  const [orders, setOrders] = useState<DailyOrderListResponse | null>(null);
  const [products, setProducts] = useState<ShopOrderProductOption[]>([]);
  const [productSearch, setProductSearch] = useState("");
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
  const [cancelReason, setCancelReason] = useState("");
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

  const fetchOrders = useCallback(
    async (showLoading = true) => {
      if (!dailyId) {
        return;
      }

      if (showLoading) {
        setIsLoading(true);
      }

      const res = await financeAPI.getDailyOrders(dailyId, {
        search: debouncedSearch || undefined,
        source: invoiceOnly ? "ALL" : activeTab,
        status: invoiceOnly || activeTab === "OFFLINE" ? "ALL" : status,
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
    },
    [
      activeTab,
      debouncedSearch,
      dailyId,
      invoiceOnly,
      paymentMethod,
      paymentStatus,
      status,
    ],
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(search), 300);

    return () => window.clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    const handleAdminOrderNotification = () => {
      void fetchOrders(false);
    };
    window.addEventListener(
      "admin-order-notification",
      handleAdminOrderNotification,
    );
    return () =>
      window.removeEventListener(
        "admin-order-notification",
        handleAdminOrderNotification,
      );
  }, [fetchOrders]);

  useEffect(() => {
    if (tableScrollerRef.current) {
      tableScrollerRef.current.scrollLeft = 0;
    }
  }, [activeTab]);

  const displayedOrders = invoiceOnly
    ? (orders?.items.filter((order) => order.invoice?.status === "ISSUED") ??
      [])
    : (orders?.items ?? []);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsProductLoading(true);
      const firstPage = await financeAPI.getProductList({
        page: 1,
        limit: 40,
        search: productSearch || undefined,
      });

      if (firstPage.code === RESPONSE_CODES.success && firstPage.data) {
        setProducts(mapShopOrderProducts(firstPage.data.data));
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
  }, [productSearch, reload]);

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
    setCancelReason("");
    setIsCancelOpen(true);
  };

  const cancelOrder = async () => {
    if (!selectedOrder) {
      return;
    }

    setIsCancelling(true);
    const res = await financeAPI.cancelOrder(selectedOrder.id, cancelReason);
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
              {invoiceOnly ? "Quản lý hóa đơn" : "Quản lý đơn hàng"}
            </p>
            <p className="mt-0.5 text-xs font-semibold text-slate-400">
              {invoiceOnly
                ? "Xem lại các hóa đơn đã phát hành trong ngày"
                : "Đơn tại shop và đơn online trong ngày"}
            </p>
          </div>
        </div>
        {!invoiceOnly && activeTab === "OFFLINE" ? (
          <Button
            type="button"
            variant="adminPrimary"
            className="h-10 w-full shrink-0 rounded-lg px-4 sm:w-auto"
            onClick={openCreate}
            disabled={isDailyLoading}
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
          {!invoiceOnly ? (
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
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">
              <ReceiptText className="size-4" />
              Hóa đơn đã phát hành
            </div>
          )}

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

          {displayedOrders.length === 0 ? (
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
                  {displayedOrders.map((order) => (
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
                        <div className="mt-1">
                          <InvoiceBadge invoice={order.invoice} />
                        </div>
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
                        dailyId={dailyId}
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
                {displayedOrders.map((order) => (
                  <OrderRow
                    key={order.id}
                    order={order}
                    dailyId={dailyId}
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

      <OfflineOrderEditor
        open={isFormOpen}
        mode={formMode}
        products={products}
        productsLoading={isProductLoading}
        order={selectedOrder}
        onOpenChange={setIsFormOpen}
        onSubmit={submitOrder}
        onProductSearchChange={setProductSearch}
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
        reason={cancelReason}
        onReasonChange={setCancelReason}
        onConfirm={() => void cancelOrder()}
      />
    </div>
  );
}
