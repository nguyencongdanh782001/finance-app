import prisma from "@/lib/db";
import type {
  ProductFormValues,
  ProductImageDraftValue,
} from "@/interface/product";
import { NextResponse } from "next/server";
import {
  validateProductFinal,
  type ProductValidationError,
} from "@/lib/products/product-draft-validation";
import {
  legacyFieldsForStatus,
  normalizeProductStatus,
} from "@/lib/products/product-status";
import {
  flattenColorGroups,
  normalizedVariantKey,
} from "@/lib/products/variant-groups";
import { planVariantRemovals } from "@/lib/products/variant-removal";

type DraftData = ProductFormValues & { images: ProductImageDraftValue[] };
const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
const invalid = (
  message: string,
  step: ProductValidationError["step"],
  status = 400,
  fieldErrors: ProductValidationError[] = [],
) =>
  NextResponse.json(
    { code: "VALIDATION_ERROR", message, step, fieldErrors },
    { status },
  );

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = Number((await params).id);
  const userId = Number(request.headers.get("x-user-id"));
  const draft = await prisma.productDraft.findFirst({
    where: { id, createdById: userId, status: "ACTIVE" },
  });
  if (!draft) return invalid("Không tìm thấy bản nháp", "info", 404);
  const data = draft.data as unknown as DraftData;
  const originalProductId = draft.originalProductId;
  if (draft.mode === "EDIT" && !originalProductId)
    return invalid("Bản nháp chỉnh sửa không có sản phẩm gốc", "info", 400);
  const title = String(data.title || "").trim();
  const categoryId = Number(data.categoryId);
  const sellPrice = Number(data.sellPrice);
  const importPrice = Number(data.importPrice);
  const quantity = Number(data.quantity);
  const images = Array.isArray(data.images) ? data.images : [];
  const legacyVariants = Array.isArray(data.variants) ? data.variants : [];
  const flattenedVariants = Array.isArray(data.colorGroups)
    ? flattenColorGroups(data.colorGroups, {
        productPrice: data.sellPrice,
        productCost: data.importPrice,
        generalImages: images,
        includeGeneralImageFallback: false,
      })
    : legacyVariants;
  const variants = flattenedVariants.filter(
    (variant) => variant.isActive || Boolean(variant.id),
  );
  const fieldErrors = validateProductFinal({ ...data, images, variants });
  if (fieldErrors.length)
    return invalid(
      "Dữ liệu sản phẩm chưa hợp lệ.",
      fieldErrors[0].step,
      400,
      fieldErrors,
    );
  const skus = variants.map((variant) => variant.sku.trim()).filter(Boolean);
  const normalizedSkus = skus.map((sku) => sku.toLocaleUpperCase("vi"));
  if (
    skus.length !== variants.length ||
    new Set(normalizedSkus).size !== normalizedSkus.length
  )
    return invalid("SKU biến thể bị thiếu hoặc trùng", "variants", 400, [
      {
        path: "variants",
        message: "SKU biến thể bị thiếu hoặc trùng.",
        step: "variants",
      },
    ]);
  const combinations = variants.map(
    (variant) =>
      `${normalizedVariantKey(variant.color)}|${normalizedVariantKey(variant.size)}`,
  );
  if (new Set(combinations).size !== combinations.length)
    return invalid("Tổ hợp biến thể bị trùng", "variants", 400, [
      {
        path: "variants",
        message: "Tổ hợp biến thể bị trùng.",
        step: "variants",
      },
    ]);
  const slug = slugify(data.slug || title);
  const excludedId = draft.originalProductId || -1;
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });
  if (!category)
    return invalid("Danh mục đã chọn không còn tồn tại.", "category", 400, [
      {
        path: "categoryId",
        message: "Danh mục đã chọn không còn tồn tại.",
        step: "category",
      },
    ]);
  if (!category.isActive)
    return invalid("Danh mục đã chọn hiện không hoạt động.", "category", 400, [
      {
        path: "categoryId",
        message: "Danh mục đã chọn hiện không hoạt động.",
        step: "category",
      },
    ]);
  if (
    await prisma.product.findFirst({ where: { slug, id: { not: excludedId } } })
  )
    return invalid("Đường dẫn sản phẩm đã được sử dụng.", "info", 409, [
      {
        path: "slug",
        message: "Đường dẫn sản phẩm đã được sử dụng.",
        step: "info",
      },
    ]);
  if (
    skus.length &&
    (await prisma.productVariant.findFirst({
      where: {
        OR: skus.map((sku) => ({ sku: { equals: sku, mode: "insensitive" } })),
        productId: { not: excludedId },
      },
    }))
  )
    return invalid("Một SKU đã được sử dụng", "variants", 409, [
      {
        path: "variants",
        message: "Một SKU đã được sử dụng.",
        step: "variants",
      },
    ]);
  try {
    const product = await prisma.$transaction(async (tx) => {
      const status = normalizeProductStatus(data.productStatus);
      const productData = {
        title,
        slug,
        description: data.description || null,
        descriptionContent: data.descriptionContent
          ? JSON.parse(JSON.stringify(data.descriptionContent))
          : undefined,
        descriptionHtml: data.description || null,
        categoryId,
        importPrice,
        sellPrice,
        quantity,
        status,
        ...legacyFieldsForStatus(status),
        publishedAt: status === "PUBLIC" ? new Date() : null,
        gender: data.gender || null,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        imageUrl:
          images.find((image) => image.isPrimary)?.url || images[0]?.url || "",
        imagePublicId:
          images.find((image) => image.isPrimary)?.publicId ||
          images[0]?.publicId ||
          "",
      };
      const saved =
        draft.mode === "CREATE"
          ? await tx.product.create({ data: productData })
          : await tx.product.update({
              where: { id: originalProductId as number },
              data: productData,
            });
      if (draft.mode === "EDIT") {
        const incomingIds = new Set(
          variants.flatMap((variant) => (variant.id ? [variant.id] : [])),
        );
        const old = await tx.productVariant.findMany({
          where: { productId: saved.id },
          select: { id: true },
        });
        const omittedIds = old
          .map((variant) => variant.id)
          .filter((variantId) => !incomingIds.has(variantId));
        const referenced = omittedIds.length
          ? await tx.orderItem.findMany({
              where: { variantId: { in: omittedIds } },
              select: { variantId: true },
              distinct: ["variantId"],
            })
          : [];
        const removalPlan = planVariantRemovals({
          existingIds: old.map((variant) => variant.id),
          incomingIds: [...incomingIds],
          referencedIds: referenced.flatMap((item) =>
            item.variantId ? [item.variantId] : [],
          ),
        });
        if (removalPlan.deactivateIds.length)
          await tx.productVariant.updateMany({
            where: { id: { in: removalPlan.deactivateIds } },
            data: { isActive: false },
          });
        if (removalPlan.deleteIds.length)
          await tx.productVariant.deleteMany({
            where: { id: { in: removalPlan.deleteIds } },
          });
        await tx.productImage.deleteMany({
          where: { productId: saved.id, variantId: null },
        });
      }
      if (images.length) {
        await tx.productImage.createMany({
          data: images.map((image, position) => ({
            productId: saved.id,
            url: image.url,
            publicId: image.publicId || null,
            position,
            isPrimary: image.isPrimary || position === 0,
          })),
        });
      }
      for (const variant of variants) {
        const variantData = {
          sku: variant.sku.trim(),
          size: variant.size || null,
          color: variant.color || null,
          colorCode: variant.colorCode || null,
          sellPrice: Number(variant.price),
          price: Number(variant.price),
          importPrice: Number(variant.importPrice),
          quantity: Number(variant.quantity),
          isActive: variant.isActive,
        };
        const savedVariant = variant.id
          ? await tx.productVariant.update({
              where: { id: variant.id, productId: saved.id },
              data: variantData,
            })
          : await tx.productVariant.create({
              data: { productId: saved.id, ...variantData },
            });
        if (variant.id)
          await tx.productVariantImage.deleteMany({
            where: { variantId: savedVariant.id },
          });
        const variantImages = variant.images || [];
        if (variantImages.length)
          await tx.productVariantImage.createMany({
            data: variantImages.map((image, position) => ({
              variantId: savedVariant.id,
              url: image.url,
              publicId: image.publicId || null,
              position,
              isPrimary: image.isPrimary || position === 0,
            })),
          });
      }
      await tx.productDraft.update({
        where: { id: draft.id },
        data: { status: "APPLIED", appliedAt: new Date() },
      });
      return saved;
    });
    return NextResponse.json({ productId: product.id });
  } catch (error) {
    console.error("Apply product draft failed", error);
    return invalid(
      "Không thể áp dụng bản nháp. Dữ liệu live chưa thay đổi.",
      "review",
      500,
    );
  }
}
