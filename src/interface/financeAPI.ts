import type {
  DailyFinance,
  MonthlyFinance,
} from "@/app/generated/prisma/client";

export type MonthlyResponse = {
  id: number;
  days: DailyFinance[];
} & MonthlyFinance;

export type Expense = {
  id: number;
  name: string;
  amount: number;
  createdAt: string;
};

export type MonthlyDetailResponse = {
  id: number;
  year: number;
  month: number;
  totalRevenue: number;
  totalExpense: number;
  profit: number;
  expenses: Expense[];
  soldProductsByDay: MonthlySoldProductsByDayItem[];
};

export interface MonthlySoldProductsByDayItem {
  dailyId: number;
  date: string;
  soldProducts: MonthlySoldProductItem[];
}

export interface MonthlySoldProductItem {
  productId: number;
  productTitle: string;
  categoryName: string;
  importPrice: number;
  sales: DailySoldProductSaleItem[];
}

export type YearProfitResponse = {
  year: number;
  totalProfit: number;
};

export type MonthlyRevenue = {
  month: number;
  profit: number;
};

export type YearlyRevenueResponse = {
  year: number;
  data: MonthlyRevenue[];
};

export type MonthlyExpenseChartItem = {
  month: number;
  expense: number;
};

export type YearlyExpenseResponse = {
  year: number;
  data: MonthlyExpenseChartItem[];
};

export type TopSellingProduct = {
  productId: number;
  productTitle: string;
  categoryName: string;
  quantity: number;
  revenue: number;
  profit: number;
};

export type TopSellingProductsResponse = {
  year: number;
  month: number;
  totalQuantity: number;
  items: TopSellingProduct[];
};

export type DailyProductProfitItem = {
  day: number;
  date: string;
  profit: number;
};

export type MonthlyProductProfitResponse = {
  year: number;
  month: number;
  totalProfit: number;
  data: DailyProductProfitItem[];
};

export interface CreateMonthlyExpenseRequest {
  name: string;
  amount: number | string;
}

export type UpdateMonthlyExpenseRequest = CreateMonthlyExpenseRequest;

export type DailyDetailResponse = {
  id: number;
  date: string;
  capitalCash: number;
  capitalBank: number;
  revenueCash: number;
  revenueBank: number;
  profitCash: number;
  profitBank: number;
  totalProfit: number;
  note: string;
  soldProducts: DailySoldProductItem[];
  previousDay: DailyDetailNavigationItem | null;
  nextDay: DailyDetailNavigationItem | null;
};

export interface DailyDetailNavigationItem {
  id: number;
  date: string;
}

export interface UpdateDailyRequest {
  capitalCash?: number | string;
  capitalBank?: number | string;
  revenueCash?: number | string;
  revenueBank?: number | string;
  note?: string;
}

export interface DailySoldProductItem {
  id: string;
  recordType: "ORDER_ITEM" | "LEGACY_MANUAL";
  date: string;
  productId: number | null;
  productVariantId: number | null;
  productName: string;
  variantName: string | null;
  sku: string | null;
  imageUrl: string | null;
  categoryName: string | null;
  quantity: number;
  unitPrice: number;
  unitCost: number | null;
  totalAmount: number;
  totalCost: number | null;
  profit: number | null;
  orderId: number | null;
  orderCode: string | null;
  orderSource: OrderSourceValue | null;
  readOnly: true;
  createdAt: string;
}

export type SoldProductSourceValue = "OFFLINE" | "ONLINE" | "LEGACY_MANUAL";

export interface DailySoldProductSale extends DailySoldProductItem {
  source: SoldProductSourceValue;
  soldAt: string;
}

export interface DailySoldProductGroup {
  groupKey: string;
  productId: number | null;
  productName: string;
  imageUrl: string | null;
  categoryName: string | null;
  totalQuantity: number;
  totalAmount: number;
  totalCost: number | null;
  totalProfit: number | null;
  saleCount: number;
  variantCount: number;
  minUnitPrice: number;
  maxUnitPrice: number;
  sources: SoldProductSourceValue[];
  sales: DailySoldProductSale[];
}

export interface DailySoldProductGroupListResponse {
  items: DailySoldProductGroup[];
  summary: {
    totalGroups: number;
    totalQuantity: number;
    totalAmount: number;
    totalProfit: number | null;
  };
  pagination: {
    page: number;
    limit: number;
    totalGroups: number;
    totalPages: number;
  };
}

export interface DailySoldProductSaleItem {
  quantity: number;
  sellPrice: number;
}

export interface UploadImageResponse {
  url: string;
  publicId: string;
}

export type OrderSourceValue = "OFFLINE" | "ONLINE";
export type OrderStatusValue =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "READY_TO_SHIP"
  | "SHIPPING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELLED"
  | "REFUNDED";
export type PaymentStatusValue =
  | "UNPAID"
  | "PENDING"
  | "PROCESSING"
  | "AUTHORIZED"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED";
export type PaymentMethodValue =
  | "CASH"
  | "COD"
  | "CARD"
  | "BANK_TRANSFER"
  | "ZALOPAY"
  | "PAYPAL"
  | "STRIPE";

export interface DailyOrderItem {
  id: number;
  productId: number | null;
  variantId: number | null;
  productTitle: string;
  productImageUrl: string | null;
  sku: string | null;
  size: string | null;
  color: string | null;
  variantOptionsSnapshot: unknown;
  quantity: number;
  originalUnitPrice: number;
  unitPrice: number;
  unitCost: number;
  totalPrice: number;
  lineSubtotal: number;
  lineCost: number;
  lineProfit: number;
}

export interface DailyOrder {
  id: number;
  orderNumber: string;
  source: OrderSourceValue;
  status: OrderStatusValue;
  paymentMethod: PaymentMethodValue | null;
  paymentStatus: PaymentStatusValue;
  isPaid: boolean;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  taxAmount: number;
  totalCost: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  profit: number;
  totalQuantity: number;
  firstProductTitle: string;
  itemCount: number;
  placedAt: string;
  completedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  invoice: {
    id: number;
    status: "DRAFT" | "ISSUED" | "VOIDED";
    invoiceNumber: string;
  } | null;
  customer: {
    id: number;
    displayName: string | null;
    email: string | null;
    phone: string | null;
  } | null;
  receiver: {
    name: string | null;
    phone: string | null;
    address: string | null;
    ward: string | null;
    district: string | null;
    province: string | null;
  } | null;
  createdBy: {
    id: number;
    displayName: string | null;
    email: string | null;
  } | null;
  items: DailyOrderItem[];
}

export interface DailyOrderListResponse {
  items: DailyOrder[];
  counts: {
    offline: number;
    online: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface OfflineOrderPayload {
  paymentMethod: "CASH" | "BANK_TRANSFER";
  paymentStatus?: "UNPAID" | "PAID";
  orderedAt?: string;
  idempotencyKey?: string;
  couponCode?: string;
  userId?: number | null;
  items: {
    productId: number;
    variantId?: number | null;
    unitPrice: number;
    quantity: number;
  }[];
}
