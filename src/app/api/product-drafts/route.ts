import prisma from "@/lib/db";
import { NextResponse } from "next/server";

const userIdFrom = (request: Request) =>
  Number(request.headers.get("x-user-id"));

export async function GET(request: Request) {
  const userId = userIdFrom(request);
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") as "CREATE" | "EDIT" | null;
  const originalProductId = Number(searchParams.get("originalProductId") || 0);
  const drafts = await prisma.productDraft.findMany({
    where: {
      createdById: userId,
      status: "ACTIVE",
      ...(mode ? { mode } : {}),
      ...(originalProductId ? { originalProductId } : {}),
    },
    orderBy: { updatedAt: "desc" },
    include: { originalProduct: { select: { id: true, title: true } } },
  });
  return NextResponse.json(drafts);
}

export async function POST(request: Request) {
  const userId = userIdFrom(request);
  const body = await request.json();
  const mode = body.mode === "EDIT" ? "EDIT" : "CREATE";
  const originalProductId =
    mode === "EDIT" ? Number(body.originalProductId) : null;
  if (mode === "EDIT" && !originalProductId)
    return NextResponse.json(
      { message: "Thiếu sản phẩm gốc" },
      { status: 400 },
    );
  const existing = await prisma.productDraft.findFirst({
    where: { createdById: userId, status: "ACTIVE", mode, originalProductId },
    orderBy: { updatedAt: "desc" },
  });
  if (existing) return NextResponse.json(existing);
  let data = body.data || {};
  if (originalProductId) {
    const product = await prisma.product.findUnique({
      where: { id: originalProductId },
      include: {
        images: { where: { variantId: null }, orderBy: { position: "asc" } },
        variants: {
          orderBy: { createdAt: "asc" },
          include: { images: { orderBy: { position: "asc" } } },
        },
      },
    });
    if (!product)
      return NextResponse.json(
        { message: "Không tìm thấy sản phẩm" },
        { status: 404 },
      );
    data = {
      title: product.title,
      slug: product.slug || "",
      description: product.description || "",
      categoryId: String(product.categoryId),
      importPrice: String(product.importPrice),
      sellPrice: String(product.sellPrice),
      quantity: String(product.quantity),
      gender: product.gender || "",
      productStatus: product.productStatus || "DRAFT",
      visibility: product.visibility,
      seoTitle: product.seoTitle || "",
      seoDescription: product.seoDescription || "",
      images: product.images.map((image) => ({
        id: image.id,
        clientId: `image-${image.id}`,
        url: image.url,
        publicId: image.publicId || undefined,
        position: image.position,
        isPrimary: image.isPrimary,
      })),
      variants: product.variants.map((variant) => ({
        id: variant.id,
        clientId: `variant-${variant.id}`,
        sku: variant.sku,
        size: variant.size || "",
        color: variant.color || "",
        price: String(variant.sellPrice),
        importPrice: String(variant.importPrice),
        quantity: String(variant.quantity),
        isActive: variant.isActive,
        images: variant.images.map((image) => ({
          id: image.id,
          clientId: `variant-image-${image.id}`,
          url: image.url,
          publicId: image.publicId || undefined,
          position: image.position,
          isPrimary: image.isPrimary,
        })),
      })),
    };
  }
  const draft = await prisma.productDraft.create({
    data: {
      mode,
      originalProductId,
      createdById: userId,
      currentStep: body.currentStep || "info",
      data,
    },
  });
  return NextResponse.json(draft, { status: 201 });
}
