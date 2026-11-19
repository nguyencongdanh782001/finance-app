import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getDailySoldProducts } from "@/lib/sold-products/daily-sold-products";
import {
  filterSoldProductGroups,
  paginateSoldProductGroups,
  type SoldProductSource,
} from "@/lib/sold-products/group-sold-products";

const disabledResponse = () =>
  NextResponse.json(
    {
      code: "MANUAL_SOLD_PRODUCT_DISABLED",
      message: "Sản phẩm đã bán chỉ được ghi nhận thông qua đơn hàng.",
    },
    { status: 405 },
  );

const parsePositiveInteger = (
  value: string | null,
  fallback: number,
  maximum?: number,
) => {
  const parsed = Number(value);
  const normalized = Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;

  return maximum ? Math.min(normalized, maximum) : normalized;
};

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const dailyId = Number(id);

  if (!dailyId || Number.isNaN(dailyId)) {
    return NextResponse.json({ message: "Invalid daily id" }, { status: 400 });
  }

  const result = await getDailySoldProducts(prisma, dailyId);

  if (!result) {
    return NextResponse.json(
      { message: "Daily finance not found" },
      { status: 404 },
    );
  }

  const { searchParams } = new URL(req.url);
  const requestedPage = parsePositiveInteger(searchParams.get("page"), 1);
  const limit = parsePositiveInteger(searchParams.get("limit"), 10, 50);
  const search = searchParams.get("search")?.trim();
  const requestedSource = searchParams.get("source");
  const validSources = new Set(["ALL", "OFFLINE", "ONLINE", "LEGACY_MANUAL"]);
  const source = validSources.has(requestedSource ?? "")
    ? (requestedSource as SoldProductSource | "ALL")
    : "ALL";
  const groups = filterSoldProductGroups(result.items, { search, source });
  const groupedPage = paginateSoldProductGroups(groups, requestedPage, limit);

  return NextResponse.json({
    items: groupedPage.items,
    summary: {
      totalGroups: groups.length,
      totalQuantity: groups.reduce(
        (sum, group) => sum + group.totalQuantity,
        0,
      ),
      totalAmount: groups.reduce((sum, group) => sum + group.totalAmount, 0),
      totalProfit: groups.some((group) => group.totalProfit !== null)
        ? groups.reduce((sum, group) => sum + (group.totalProfit ?? 0), 0)
        : null,
      pendingQuantity: groups.reduce(
        (sum, group) => sum + group.pendingQuantity,
        0,
      ),
      pendingAmount: groups.reduce(
        (sum, group) => sum + group.pendingAmount,
        0,
      ),
    },
    pagination: groupedPage.pagination,
  });
}

export const POST = disabledResponse;
export const PUT = disabledResponse;
export const PATCH = disabledResponse;
export const DELETE = disabledResponse;
