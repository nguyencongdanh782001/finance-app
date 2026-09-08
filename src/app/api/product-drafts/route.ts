import prisma from "@/lib/db";
import { groupVariantsByColor } from "@/lib/products/variant-groups";
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
  if (existing) {
    // Older edit drafts may not have an `images` key because they were created
    // before ProductImage became the gallery source of truth. Preserve an
    // explicitly empty gallery, but hydrate missing data from the legacy field.
    const existingData =
      existing.data &&
      typeof existing.data === "object" &&
      !Array.isArray(existing.data)
        ? (existing.data as Record<string, unknown>)
        : {};
    if (originalProductId && !("images" in existingData)) {
      const legacyProduct = await prisma.product.findUnique({
        where: { id: originalProductId },
        select: { imageUrl: true, imagePublicId: true },
      });
      if (legacyProduct?.imageUrl) {
        const updated = await prisma.productDraft.update({
          where: { id: existing.id },
          data: {
            data: {
              ...existingData,
              images: [
                {
                  clientId: `legacy-image-${originalProductId}`,
                  url: legacyProduct.imageUrl,
                  publicId: legacyProduct.imagePublicId || undefined,
                  position: 0,
                  isPrimary: true,
                },
              ],
            },
          },
        });
        return NextResponse.json(updated);
      }
    }
    return NextResponse.json(existing);
  }
  let data = body.data || {};
  if (originalProductId) {
    const product = await prisma.product.findUnique({
      where: { id: originalProductId },
      include: {
        images: { where: { variantId: null }, orderBy: { position: "asc" } },
        variants: {
          orderBy: { createdAt: "asc" },
          include: {
            images: { orderBy: { position: "asc" } },
            productImages: { orderBy: { position: "asc" } },
          },
        },
      },
    });
    if (!product)
      return NextResponse.json(
        { message: "Không tìm thấy sản phẩm" },
        { status: 404 },
      );
    const variants = product.variants.map((variant) => ({
      id: variant.id,
      clientId: `variant-${variant.id}`,
      sku: variant.sku,
      size: variant.size || "",
      color: variant.color || "",
      colorCode: variant.colorCode || undefined,
      price: String(variant.sellPrice),
      importPrice: String(variant.importPrice),
      quantity: String(variant.quantity),
      isActive: variant.isActive,
      images: (variant.images.length
        ? variant.images
        : variant.productImages
      ).map((image) => ({
        id: image.id,
        clientId: `variant-image-${image.id}`,
        url: image.url,
        publicId: image.publicId || undefined,
        position: image.position,
        isPrimary: image.isPrimary,
      })),
    }));
    const generalImages = product.images.length
      ? product.images.map((image) => ({
          id: image.id,
          clientId: `image-${image.id}`,
          url: image.url,
          publicId: image.publicId || undefined,
          position: image.position,
          isPrimary: image.isPrimary,
        }))
      : product.imageUrl
        ? [
            {
              clientId: `legacy-image-${product.id}`,
              url: product.imageUrl,
              publicId: product.imagePublicId || undefined,
              position: 0,
              isPrimary: true,
            },
          ]
        : [];
    data = {
      title: product.title,
      slug: product.slug || "",
      description: product.descriptionHtml || product.description || "",
      descriptionContent: product.descriptionContent || null,
      categoryId: String(product.categoryId),
      importPrice: String(product.importPrice),
      sellPrice: String(product.sellPrice),
      quantity: String(product.quantity),
      gender: product.gender || "",
      productStatus: product.status,
      seoTitle: product.seoTitle || "",
      seoDescription: product.seoDescription || "",
      images: generalImages,
      variants,
      colorGroups: groupVariantsByColor(variants),
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
