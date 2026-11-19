import type { SoldProductListItem } from "./daily-sold-products";

export type SoldProductSource = "OFFLINE" | "ONLINE" | "LEGACY_MANUAL";

export type SoldProductSale = SoldProductListItem & {
  source: SoldProductSource;
  soldAt: string;
};

export type SoldProductGroup = {
  groupKey: string;
  productId: number | null;
  productName: string;
  imageUrl: string | null;
  categoryName: string | null;
  totalQuantity: number;
  totalAmount: number;
  totalCost: number | null;
  totalProfit: number | null;
  pendingQuantity: number;
  pendingAmount: number;
  saleCount: number;
  variantCount: number;
  minUnitPrice: number;
  maxUnitPrice: number;
  sources: SoldProductSource[];
  sales: SoldProductSale[];
};

const normalizeProductName = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

export const getSoldProductSource = (
  item: SoldProductListItem,
): SoldProductSource =>
  item.recordType === "LEGACY_MANUAL"
    ? "LEGACY_MANUAL"
    : (item.orderSource ?? "OFFLINE");

export const getSoldProductGroupKey = (item: SoldProductListItem) => {
  if (item.productId !== null) {
    return `product:${item.productId}`;
  }

  const normalizedName = normalizeProductName(item.productName);

  if (item.recordType === "LEGACY_MANUAL" && normalizedName) {
    return `legacy:${normalizedName}`;
  }

  // A deleted/unlinked order product cannot safely be matched by name alone.
  return `unlinked:${item.id}`;
};

const sumNullable = (values: Array<number | null>): number | null =>
  values.some((value) => value !== null)
    ? values.reduce<number>((sum, value) => sum + (value ?? 0), 0)
    : null;

export function groupSoldProducts(
  items: SoldProductListItem[],
): SoldProductGroup[] {
  const groups = new Map<string, SoldProductSale[]>();

  items.forEach((item) => {
    const groupKey = getSoldProductGroupKey(item);
    const sale: SoldProductSale = {
      ...item,
      source: getSoldProductSource(item),
      soldAt: item.date,
    };
    const existing = groups.get(groupKey);

    if (existing) {
      existing.push(sale);
    } else {
      groups.set(groupKey, [sale]);
    }
  });

  return Array.from(groups.entries()).map(([groupKey, sales]) => {
    const first = sales[0];
    const variantIds = new Set(
      sales
        .map((sale) => sale.productVariantId)
        .filter((id): id is number => id !== null),
    );
    const unitPrices = sales.map((sale) => sale.unitPrice);
    const billableSales = sales.filter(
      (sale) => sale.paymentStatus !== "UNPAID",
    );
    const pendingSales = sales.filter(
      (sale) => sale.paymentStatus === "UNPAID",
    );

    return {
      groupKey,
      productId: first.productId,
      productName: first.productName,
      imageUrl: sales.find((sale) => Boolean(sale.imageUrl))?.imageUrl ?? null,
      categoryName:
        sales.find((sale) => Boolean(sale.categoryName))?.categoryName ?? null,
      totalQuantity: sales.reduce((sum, sale) => sum + sale.quantity, 0),
      totalAmount: billableSales.reduce(
        (sum, sale) => sum + sale.totalAmount,
        0,
      ),
      totalCost: sumNullable(billableSales.map((sale) => sale.totalCost)),
      totalProfit: sumNullable(billableSales.map((sale) => sale.profit)),
      pendingQuantity: pendingSales.reduce(
        (sum, sale) => sum + sale.quantity,
        0,
      ),
      pendingAmount: pendingSales.reduce(
        (sum, sale) => sum + sale.totalAmount,
        0,
      ),
      saleCount: sales.length,
      variantCount: variantIds.size,
      minUnitPrice: Math.min(...unitPrices),
      maxUnitPrice: Math.max(...unitPrices),
      sources: Array.from(new Set(sales.map((sale) => sale.source))),
      sales: [...sales].sort(
        (left, right) =>
          new Date(right.soldAt).getTime() - new Date(left.soldAt).getTime() ||
          left.id.localeCompare(right.id),
      ),
    };
  });
}

export function filterSoldProductGroups(
  items: SoldProductListItem[],
  options: { search?: string; source?: SoldProductSource | "ALL" },
) {
  const normalizedSearch = options.search?.trim().toLowerCase() ?? "";
  const sourceFilteredItems = items.filter(
    (item) =>
      !options.source ||
      options.source === "ALL" ||
      getSoldProductSource(item) === options.source,
  );
  const groups = groupSoldProducts(sourceFilteredItems);

  if (!normalizedSearch) {
    return groups;
  }

  return groups.filter((group) =>
    [
      group.productName,
      group.categoryName,
      ...group.sales.flatMap((sale) => [
        sale.variantName,
        sale.sku,
        sale.orderCode,
      ]),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(normalizedSearch),
  );
}

export function paginateSoldProductGroups(
  groups: SoldProductGroup[],
  requestedPage: number,
  limit: number,
) {
  const totalGroups = groups.length;
  const totalPages = Math.max(Math.ceil(totalGroups / limit), 1);
  const page = Math.min(Math.max(requestedPage, 1), totalPages);
  const startIndex = (page - 1) * limit;

  return {
    items: groups.slice(startIndex, startIndex + limit),
    pagination: { page, limit, totalGroups, totalPages },
  };
}
