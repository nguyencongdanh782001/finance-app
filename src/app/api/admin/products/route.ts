import prisma from "@/lib/db";
import { NextResponse } from "next/server";
import { buildSharedProductFilters, parseProductListQuery, productOrderBy } from "@/lib/products/product-list";

const adminOnly = (request: Request) => {
  const role = request.headers.get("x-user-role");
  return role === "ADMIN" || role === "SUPER_ADMIN";
};

export async function GET(request: Request) {
  if (!request.headers.get("x-user-id") || !adminOnly(request)) return NextResponse.json({ message: request.headers.get("x-user-role") ? "Forbidden" : "Unauthorized" }, { status: request.headers.get("x-user-role") ? 403 : 401 });
  try {
    const query = parseProductListQuery(new URL(request.url).searchParams, true);
    const where = { ...buildSharedProductFilters(query), ...(query.status ? { status: query.status } : {}) };
    const [products, total] = await Promise.all([
      prisma.product.findMany({ where, include: { category: true, images: { where: { variantId: null }, orderBy: { position: "asc" } }, variants: { orderBy: { createdAt: "asc" }, include: { images: { orderBy: { position: "asc" } } } } }, orderBy: productOrderBy(query.sort), skip: (query.page - 1) * query.limit, take: query.limit }),
      prisma.product.count({ where }),
    ]);
    return NextResponse.json({ data: products.map((product) => ({ ...product, status: undefined, productStatus: product.status, totalAvailableStock: product.variants.reduce((sum, variant) => sum + Math.max(0, variant.quantity - variant.reservedQuantity), 0) || product.quantity })), pagination: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit), totalPage: Math.ceil(total / query.limit), hasNextPage: query.page * query.limit < total, hasPreviousPage: query.page > 1 } });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Bộ lọc không hợp lệ." }, { status: 400 });
  }
}
