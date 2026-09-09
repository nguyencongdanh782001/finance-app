import prisma from "@/lib/db";
import type { Prisma } from "@/app/generated/prisma/client";
import { NextResponse } from "next/server";

const asNumber = (value: unknown) => Number(value || 0);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ productId: string }> },
) {
  const { productId } = await params;
  const id = Number(productId);
  const limit = Math.min(8, Math.max(4, Number(new URL(request.url).searchParams.get("limit") || 8)));
  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json({ data: [] });
  }

  const current = await prisma.product.findFirst({
    where: { id, status: "PUBLIC" },
    select: { id: true, categoryId: true, gender: true, brandId: true },
  });
  if (!current) return NextResponse.json({ data: [] });

  const productSelect = {
    id: true,
    title: true,
    slug: true,
    imageUrl: true,
    sellPrice: true,
    quantity: true,
    categoryId: true,
    variants: {
      where: { isActive: true },
      select: {
        sellPrice: true,
        comparePrice: true,
        quantity: true,
        reservedQuantity: true,
        color: true,
        colorCode: true,
      },
    },
    images: {
      where: { variantId: null },
      orderBy: { position: "asc" as const },
      take: 1,
      select: { id: true, url: true, altText: true, position: true, isPrimary: true },
    },
  } as const;
  type RelatedProduct = Prisma.ProductGetPayload<{ select: typeof productSelect }>;
  const common = { status: "PUBLIC" as const, id: { not: id } };
  const seen = new Set<number>();
  const products: RelatedProduct[] = [];

  const add = (items: RelatedProduct[]) => {
    for (const item of items) {
      if (seen.has(item.id) || products.length >= limit) continue;
      seen.add(item.id);
      products.push(item);
    }
  };

  add(await prisma.product.findMany({
    where: { ...common, categoryId: current.categoryId, variants: { some: { isActive: true, quantity: { gt: 0 } } } },
    select: productSelect,
    orderBy: [{ isFeatured: "desc" }, { soldCount: "desc" }, { createdAt: "desc" }],
    take: limit,
  }));
  if (products.length < limit && current.gender) {
    add(await prisma.product.findMany({
      where: { ...common, gender: current.gender, variants: { some: { isActive: true, quantity: { gt: 0 } } } },
      select: productSelect,
      orderBy: [{ isFeatured: "desc" }, { soldCount: "desc" }, { createdAt: "desc" }],
      take: limit,
    }));
  }
  if (products.length < limit) {
    add(await prisma.product.findMany({
      where: { ...common, variants: { some: { isActive: true, quantity: { gt: 0 } } } },
      select: productSelect,
      orderBy: [{ isFeatured: "desc" }, { soldCount: "desc" }, { createdAt: "desc" }],
      take: limit,
    }));
  }

  const userId = Number(request.headers.get("x-user-id"));
  const favorites = Number.isInteger(userId) && userId > 0
    ? new Set((await prisma.wishlistItem.findMany({ where: { userId, productId: { in: products.map((item) => item.id) } }, select: { productId: true } })).map((item) => item.productId))
    : new Set<number>();

  return NextResponse.json({
    data: products.map((product) => {
      const variants = product.variants;
      const prices = variants.map((variant) => asNumber(variant.sellPrice)).filter((value) => value > 0);
      const available = variants.filter((variant) => variant.quantity - variant.reservedQuantity > 0);
      return {
        id: product.id,
        title: product.title,
        slug: product.slug,
        imageUrl: product.images[0]?.url || product.imageUrl,
        sellPrice: prices.length ? Math.min(...prices) : asNumber(product.sellPrice),
        quantity: product.quantity,
        totalAvailableStock: available.reduce((sum, variant) => sum + Math.max(0, variant.quantity - variant.reservedQuantity), 0),
        categoryId: product.categoryId,
        category: { id: product.categoryId, name: "", color: "", icon: "" },
        variants: variants.map((variant) => ({ ...variant, price: variant.sellPrice, importPrice: 0, isActive: true, id: 0, sku: "" })),
        images: product.images,
        isFavorited: favorites.has(product.id),
        displayFavoriteCount: 0,
      };
    }),
  });
}
