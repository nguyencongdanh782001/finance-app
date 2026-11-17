import prisma from "@/lib/db";
import type { Prisma } from "@/app/generated/prisma/client";
import { legacyFieldsForStatus } from "@/lib/products/product-status";
import type {
  ImportCellError,
  ImportCategory,
  ImportProduct,
  ProductImportOptions,
  ProductImportResultItem,
  ProductImportSource,
} from "./types";
import { isFileBlockingImportError } from "./types";

export { isFileBlockingImportError } from "./types";

const normalizedKey = (value: string) => value.trim().toLocaleLowerCase("vi");

export const asImportSource = (value: unknown) => value as ProductImportSource;

export const asImportErrors = (value: unknown) =>
  (Array.isArray(value) ? value : []) as ImportCellError[];

export const asImportResults = (value: unknown) =>
  (Array.isArray(value) ? value : []) as ProductImportResultItem[];

export const toJsonValue = (value: unknown) => value as Prisma.InputJsonValue;

export const hasBlockingImportError = (
  errors: ImportCellError[],
  productKey: string,
) =>
  errors.some(
    (error) =>
      error.severity === "ERROR" &&
      (isFileBlockingImportError(error) ||
        normalizedKey(error.productKey || "") === normalizedKey(productKey)),
  );

const findOrCreateCategory = async (
  tx: Prisma.TransactionClient,
  product: ImportProduct,
  categories: ImportCategory[],
  options: ProductImportOptions,
) => {
  const categoryMap = new Map(
    categories.map((category) => [normalizedKey(category.key), category]),
  );

  const resolveDefinition = async (
    definition: ImportCategory,
    resolving = new Set<string>(),
  ): Promise<number> => {
    const existing = await tx.category.findFirst({
      where: { slug: { equals: definition.slug, mode: "insensitive" } },
      select: { id: true },
    });
    if (existing) return existing.id;
    if (!options.createMissingCategories) {
      throw new Error(`Danh mục “${definition.name}” chưa tồn tại.`);
    }

    const key = normalizedKey(definition.key);
    if (resolving.has(key)) throw new Error("Danh mục tạo thành vòng lặp.");
    resolving.add(key);
    let parentId: number | null = null;
    if (definition.parentKey) {
      const parent = categoryMap.get(normalizedKey(definition.parentKey));
      if (!parent) throw new Error("Không tìm thấy danh mục cha.");
      parentId = await resolveDefinition(parent, resolving);
    }
    resolving.delete(key);

    const created = await tx.category.create({
      data: {
        name: definition.name,
        slug: definition.slug,
        parentId,
        color: "#D96C8A",
        icon: "Package",
      },
      select: { id: true },
    });
    return created.id;
  };

  if (product.categoryKey) {
    const categoryId = Number(product.categoryKey);
    if (Number.isInteger(categoryId) && categoryId > 0) {
      const existing = await tx.category.findFirst({
        where: { id: categoryId, isActive: true },
        select: { id: true },
      });
      if (existing) return existing.id;
    }
    const definition = categoryMap.get(normalizedKey(product.categoryKey));
    if (!definition) throw new Error("category_key không tồn tại.");
    return resolveDefinition(definition);
  }

  const existing = await tx.category.findFirst({
    where: {
      slug: { equals: product.categorySlug, mode: "insensitive" },
      isActive: true,
    },
    select: { id: true },
  });
  if (!existing)
    throw new Error("Danh mục không tồn tại hoặc đã ngừng hoạt động.");
  return existing.id;
};

export async function importOneProduct(
  product: ImportProduct,
  source: ProductImportSource,
  options: ProductImportOptions,
) {
  return prisma.$transaction(async (tx) => {
    const categoryId = await findOrCreateCategory(
      tx,
      product,
      source.categories,
      options,
    );
    const status = options.forcePrivate ? "PRIVATE" : product.status;
    if (!status) throw new Error("Trạng thái sản phẩm không hợp lệ.");

    const variants = product.hasVariants
      ? product.variants
      : [
          {
            row: product.row,
            productKey: product.key,
            color: "",
            size: "",
            sku: product.defaultSku,
            price: product.defaultPrice,
            cost: product.defaultCost,
            stock: product.defaultStock,
            isActive: true,
          },
        ];
    const generalImages = product.images
      .filter((image) => !image.variantSku)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    const primaryImage =
      generalImages.find((image) => image.isPrimary) || generalImages[0];

    const activeVariants = variants.filter((variant) => variant.isActive);
    const quantity = activeVariants.reduce(
      (total, variant) => total + Number(variant.stock || 0),
      0,
    );
    const sellPrices = activeVariants.map((variant) => Number(variant.price));
    const costs = activeVariants.map((variant) => Number(variant.cost));
    const sellPrice = Math.min(...sellPrices);
    const importPrice = Math.min(...costs);
    if (!Number.isFinite(sellPrice) || !Number.isFinite(importPrice)) {
      throw new Error("Giá sản phẩm không hợp lệ.");
    }

    const created = await tx.product.create({
      data: {
        title: product.name,
        slug: product.slug,
        description: product.description || product.shortDescription || null,
        imageUrl: primaryImage?.imageUrl || "",
        imagePublicId: "",
        categoryId,
        brand: product.brand || null,
        gender: product.gender,
        importPrice,
        sellPrice,
        quantity,
        status,
        ...legacyFieldsForStatus(status),
        publishedAt: status === "PUBLIC" ? new Date() : null,
      },
      select: { id: true },
    });

    if (generalImages.length) {
      await tx.productImage.createMany({
        data: generalImages.map((image, index) => ({
          productId: created.id,
          url: image.imageUrl,
          publicId: null,
          altText: image.altText || product.name,
          position: image.sortOrder ?? index,
          isPrimary: image === primaryImage,
        })),
      });
    }

    for (const variant of variants) {
      const createdVariant = await tx.productVariant.create({
        data: {
          productId: created.id,
          sku: variant.sku,
          color: variant.color || null,
          size: variant.size || null,
          price: variant.price,
          sellPrice: variant.price || 0,
          importPrice: variant.cost || 0,
          quantity: variant.stock || 0,
          isActive: Boolean(variant.isActive),
        },
        select: { id: true },
      });
      const variantImages = product.images
        .filter(
          (image) =>
            normalizedKey(image.variantSku) === normalizedKey(variant.sku),
        )
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      if (variantImages.length) {
        const primary =
          variantImages.find((image) => image.isPrimary) || variantImages[0];
        await tx.productVariantImage.createMany({
          data: variantImages.map((image, index) => ({
            variantId: createdVariant.id,
            url: image.imageUrl,
            publicId: null,
            altText: image.altText || product.name,
            position: image.sortOrder ?? index,
            isPrimary: image === primary,
          })),
        });
      }
    }

    return created.id;
  });
}

export const friendlyImportError = (error: unknown) => {
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    error.code === "P2002"
  ) {
    return "Slug hoặc SKU đã tồn tại tại thời điểm xử lý.";
  }
  if (error instanceof Error && error.message) return error.message;
  return "Không thể tạo sản phẩm do lỗi dữ liệu.";
};
