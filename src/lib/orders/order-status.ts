import type { OrderStatus, PaymentStatus } from "@/app/generated/prisma/client";

export type OrderStatusConfig = {
  label: string;
  shortLabel: string;
  description: string;
  timelineStep: number | null;
  timelineKey:
    | "PENDING"
    | "CONFIRMED"
    | "PREPARING"
    | "SHIPPING"
    | "DELIVERED"
    | "CANCELLED"
    | null;
  icon: "bag" | "check" | "box" | "truck" | "package-check" | "x";
  tone: "pending" | "info" | "active" | "success" | "danger" | "muted";
};

export const ORDER_STATUS_CONFIG: Record<OrderStatus, OrderStatusConfig> = {
  PENDING: {
    label: "Đặt hàng thành công",
    shortLabel: "Đã đặt hàng",
    description: "Đơn hàng đã được ghi nhận và đang chờ cửa hàng xác nhận.",
    timelineStep: 0,
    timelineKey: "PENDING",
    icon: "bag",
    tone: "pending",
  },
  CONFIRMED: {
    label: "Đã xác nhận",
    shortLabel: "Đã xác nhận",
    description: "Cửa hàng đã xác nhận đơn hàng của bạn.",
    timelineStep: 1,
    timelineKey: "CONFIRMED",
    icon: "check",
    tone: "info",
  },
  PREPARING: {
    label: "Đang chuẩn bị",
    shortLabel: "Đang chuẩn bị",
    description: "Cửa hàng đang chuẩn bị sản phẩm trong đơn.",
    timelineStep: 2,
    timelineKey: "PREPARING",
    icon: "box",
    tone: "active",
  },
  READY_TO_SHIP: {
    label: "Đang giao",
    shortLabel: "Đang giao",
    description: "Đơn hàng đã sẵn sàng được bàn giao cho đơn vị giao hàng.",
    timelineStep: 3,
    timelineKey: "SHIPPING",
    icon: "truck",
    tone: "active",
  },
  SHIPPING: {
    label: "Đang giao",
    shortLabel: "Đang giao",
    description: "Đơn hàng đang trên đường đến bạn.",
    timelineStep: 3,
    timelineKey: "SHIPPING",
    icon: "truck",
    tone: "active",
  },
  PROCESSING: {
    label: "Đang chuẩn bị",
    shortLabel: "Đang chuẩn bị",
    description: "Đơn hàng đang được cửa hàng xử lý.",
    timelineStep: 2,
    timelineKey: "PREPARING",
    icon: "box",
    tone: "active",
  },
  SHIPPED: {
    label: "Đang giao",
    shortLabel: "Đang giao",
    description: "Đơn hàng đã được gửi đi và đang trên đường đến bạn.",
    timelineStep: 3,
    timelineKey: "SHIPPING",
    icon: "truck",
    tone: "active",
  },
  DELIVERED: {
    label: "Đã giao",
    shortLabel: "Đã giao",
    description: "Đơn hàng đã được giao đến bạn.",
    timelineStep: 4,
    timelineKey: "DELIVERED",
    icon: "package-check",
    tone: "success",
  },
  COMPLETED: {
    label: "Đã giao",
    shortLabel: "Đã giao",
    description: "Đơn hàng đã hoàn tất.",
    timelineStep: 4,
    timelineKey: "DELIVERED",
    icon: "package-check",
    tone: "success",
  },
  CANCELLED: {
    label: "Đã hủy",
    shortLabel: "Đã hủy",
    description: "Đơn hàng đã bị hủy.",
    timelineStep: null,
    timelineKey: "CANCELLED",
    icon: "x",
    tone: "danger",
  },
  REFUNDED: {
    label: "Đã hoàn tiền",
    shortLabel: "Đã hoàn tiền",
    description: "Đơn hàng đã được hoàn tiền.",
    timelineStep: null,
    timelineKey: "CANCELLED",
    icon: "x",
    tone: "muted",
  },
};

export const CUSTOMER_ORDER_FILTERS = [
  { value: "ALL", label: "Tất cả" },
  { value: "PENDING", label: "Đã đặt hàng" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
  { value: "PREPARING", label: "Đang chuẩn bị" },
  { value: "SHIPPING", label: "Đang giao" },
  { value: "DELIVERED", label: "Đã giao" },
  { value: "CANCELLED", label: "Đã hủy" },
] as const;

export type CustomerOrderFilter =
  (typeof CUSTOMER_ORDER_FILTERS)[number]["value"];

export const CUSTOMER_ORDER_FILTER_STATUSES: Record<
  CustomerOrderFilter,
  OrderStatus[]
> = {
  ALL: [
    "PENDING",
    "CONFIRMED",
    "PREPARING",
    "READY_TO_SHIP",
    "SHIPPING",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "COMPLETED",
    "CANCELLED",
    "REFUNDED",
  ],
  PENDING: ["PENDING"],
  CONFIRMED: ["CONFIRMED"],
  PREPARING: ["PREPARING", "PROCESSING"],
  SHIPPING: ["READY_TO_SHIP", "SHIPPING", "SHIPPED"],
  DELIVERED: ["DELIVERED", "COMPLETED"],
  CANCELLED: ["CANCELLED", "REFUNDED"],
};

export const CUSTOMER_ORDER_TIMELINE = [
  {
    key: "PENDING",
    label: "Đặt hàng thành công",
    description: "Đơn hàng đã được ghi nhận.",
    icon: "bag",
  },
  {
    key: "CONFIRMED",
    label: "Đã xác nhận",
    description: "Cửa hàng đã xác nhận đơn hàng.",
    icon: "check",
  },
  {
    key: "PREPARING",
    label: "Đang chuẩn bị",
    description: "Cửa hàng đang chuẩn bị sản phẩm.",
    icon: "box",
  },
  {
    key: "SHIPPING",
    label: "Đang giao",
    description: "Đơn hàng đang trên đường đến bạn.",
    icon: "truck",
  },
  {
    key: "DELIVERED",
    label: "Đã giao",
    description: "Đơn hàng đã được giao thành công.",
    icon: "package-check",
  },
] as const;

export type CustomerOrderTimelineKey =
  (typeof CUSTOMER_ORDER_TIMELINE)[number]["key"];

export const getOrderStatusConfig = (status: OrderStatus) =>
  ORDER_STATUS_CONFIG[status];

export const getCustomerTimelineStep = (status: OrderStatus) =>
  ORDER_STATUS_CONFIG[status].timelineStep;

export const ONLINE_STATUS_FLOW: Partial<Record<OrderStatus, OrderStatus>> = {
  PENDING: "CONFIRMED",
  CONFIRMED: "PREPARING",
  PREPARING: "SHIPPING",
  READY_TO_SHIP: "SHIPPING",
  PROCESSING: "SHIPPING",
  SHIPPING: "DELIVERED",
  SHIPPED: "DELIVERED",
};

export const isValidOnlineStatusTransition = (
  currentStatus: OrderStatus,
  nextStatus: OrderStatus,
) => ONLINE_STATUS_FLOW[currentStatus] === nextStatus;

export const ADMIN_CANCELLABLE_ONLINE_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "PROCESSING",
];

export const canAdminCancelOnlineOrder = (status: OrderStatus) =>
  ADMIN_CANCELLABLE_ONLINE_STATUSES.includes(status);

export const canManuallyMarkOrderPaid = (
  orderStatus: OrderStatus,
  paymentStatus: PaymentStatus,
) =>
  orderStatus !== "CANCELLED" &&
  orderStatus !== "REFUNDED" &&
  !["PAID", "CANCELLED", "REFUNDED", "PARTIALLY_REFUNDED"].includes(
    paymentStatus,
  );
