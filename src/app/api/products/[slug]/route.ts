import prisma from "@/lib/db";
import { NextResponse } from "next/server";
import { ProductStatus } from "@/app/generated/prisma/client";
import { publicProductSelect, serializePublicProduct } from "@/lib/products/product-list";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const identifier = (await params).slug;
  const numericId = Number(identifier);
  const product = await prisma.product.findFirst({
    where: { status: ProductStatus.PUBLIC, ...(Number.isInteger(numericId) ? { OR: [{ id: numericId }, { slug: identifier }] } : { slug: identifier }) },
    select: publicProductSelect,
  });
  if (!product) return NextResponse.json({ message: "Product not found" }, { status: 404 });
  const userId = Number(request.headers.get("x-user-id"));
  const isFavorited = userId > 0 && Boolean(await prisma.wishlistItem.findFirst({ where: { userId, productId: product.id }, select: { id: true } }));
  return NextResponse.json({ ...serializePublicProduct(product), isFavorited });
}
