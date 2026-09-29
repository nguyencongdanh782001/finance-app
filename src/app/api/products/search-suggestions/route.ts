import prisma from "@/lib/db";
import { NextResponse } from "next/server";
import { findProductIdsBySearch } from "@/lib/products/product-search";
import { foldSearchText, normalizeSearchText } from "@/lib/search";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const query = normalizeSearchText(params.get("q"));
  const limit = Math.min(6, Math.max(1, Number(params.get("limit") || 6)));
  if (query.length < 2)
    return NextResponse.json({ query, items: [], total: 0 });
  const foldedQuery = foldSearchText(query);
  const matchedProductIds = await findProductIdsBySearch(query);
  const products = await prisma.product.findMany({
    where: {
      status: "PUBLIC",
      ...(matchedProductIds !== undefined
        ? { id: { in: matchedProductIds } }
        : {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { slug: { contains: query, mode: "insensitive" } },
              { category: { name: { contains: query, mode: "insensitive" } } },
              {
                variants: {
                  some: {
                    sku: { contains: query, mode: "insensitive" },
                    isActive: true,
                  },
                },
              },
            ],
          }),
    },
    take: 30,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      imageUrl: true,
      sellPrice: true,
      quantity: true,
      organicFavoriteCount: true,
      favoriteCountAdjustment: true,
      category: { select: { name: true } },
      variants: {
        where: { isActive: true },
        select: {
          sku: true,
          sellPrice: true,
          quantity: true,
          color: true,
          images: {
            orderBy: { position: "asc" },
            take: 1,
            select: { url: true },
          },
        },
      },
    },
  });
  const ranked = products
    .map((product) => {
      const title = foldSearchText(product.title);
      const slug = foldSearchText(product.slug || "");
      const category = foldSearchText(product.category.name);
      const exactSku = product.variants.some(
        (variant) => foldSearchText(variant.sku) === foldedQuery,
      );
      const score =
        title === foldedQuery
          ? 100
          : title.startsWith(foldedQuery)
            ? 90
            : title.includes(foldedQuery)
              ? 80
              : exactSku
                ? 70
                : category.includes(foldedQuery) || slug.includes(foldedQuery)
                  ? 60
                  : 20;
      const prices = product.variants.length
        ? product.variants.map((variant) => Number(variant.sellPrice))
        : [Number(product.sellPrice)];
      const image =
        product.imageUrl ||
        product.variants.find((variant) => variant.images[0])?.images[0]?.url ||
        "";
      return {
        score,
        item: {
          id: product.id,
          name: product.title,
          slug: product.slug,
          image: { url: image, alt: product.title },
          minPrice: Math.min(...prices),
          maxPrice: Math.max(...prices),
          isInStock: product.variants.length
            ? product.variants.some((variant) => variant.quantity > 0)
            : product.quantity > 0,
          availableColorCount: new Set(
            product.variants.map((variant) => variant.color).filter(Boolean),
          ).size,
          displayFavoriteCount: Math.max(
            0,
            product.organicFavoriteCount + product.favoriteCountAdjustment,
          ),
        },
      };
    })
    .sort(
      (a, b) =>
        b.score - a.score || a.item.name.localeCompare(b.item.name, "vi"),
    );
  return NextResponse.json({
    query,
    items: ranked.slice(0, limit).map((entry) => entry.item),
    total: ranked.length,
  });
}
