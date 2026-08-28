import prisma from "@/lib/db";
import { deleteProductImageFromCloudinary } from "@/lib/cloudinary-upload";
import {
  legacyFieldsForStatus,
  normalizeProductStatus,
  toProductResponse,
} from "@/lib/products/product-status";
import { NextResponse } from "next/server";
const bad = (message: string, status = 400) =>
  NextResponse.json({ message }, { status });
const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) return bad("Invalid product id");
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      images: {
        where: { variantId: null },
        orderBy: { position: "asc" },
      },
      variants: {
        orderBy: { createdAt: "asc" },
        include: { images: { orderBy: { position: "asc" } } },
      },
    },
  });
  return product
    ? NextResponse.json(toProductResponse(product))
    : bad("Product not found", 404);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) return bad("Invalid product id");
  try {
    const body = await req.json();
    const current = await prisma.product.findUnique({
      where: { id },
      include: { variants: { select: { id: true } } },
    });
    if (!current) return bad("Product not found", 404);
    const productStatus = normalizeProductStatus(
      body.productStatus,
      current.status,
    );
    const legacyStatus = legacyFieldsForStatus(productStatus);
    const title = String(body.title || "").trim();
    const quantity = Number(body.quantity ?? current.quantity);
    const importPrice = Number(body.importPrice ?? current.importPrice);
    const sellPrice = Number(body.sellPrice ?? current.sellPrice);
    if (
      !title ||
      !Number.isInteger(quantity) ||
      quantity < 0 ||
      importPrice < 0 ||
      sellPrice < 0
    )
      return bad("Thông tin sản phẩm hoặc giá trị tồn kho không hợp lệ");
    const slug = String(body.slug || current.slug || slugify(title));
    if (await prisma.product.findFirst({ where: { slug, NOT: { id } } }))
      return bad("Đường dẫn sản phẩm đã tồn tại", 409);
    const variants = Array.isArray(body.variants) ? body.variants : [];
    const skus = variants
      .map((v: { sku?: string }) => String(v.sku || "").trim())
      .filter(Boolean);
    if (new Set(skus).size !== skus.length)
      return bad("SKU biến thể không được trùng nhau");
    const combinations = variants.map(
      (v: { color?: string; size?: string }) =>
        `${v.color || ""}|${v.size || ""}`,
    );
    if (new Set(combinations).size !== combinations.length)
      return bad("Tổ hợp màu và kích thước không được trùng nhau");
    if (
      variants.some(
        (v: { price?: number; importPrice?: number; quantity?: number }) =>
          Number(v.price) < 0 ||
          Number(v.importPrice) < 0 ||
          !Number.isInteger(Number(v.quantity)) ||
          Number(v.quantity) < 0,
      )
    )
      return bad("Giá và tồn kho biến thể không hợp lệ");
    const externalSku = skus.length
      ? await prisma.productVariant.findFirst({
          where: { sku: { in: skus }, productId: { not: id } },
        })
      : null;
    if (externalSku) return bad(`SKU ${externalSku.sku} đã tồn tại`, 409);
    const updated = await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          title,
          slug,
          description: body.description ?? current.description,
          imageUrl: body.imageUrl ?? current.imageUrl,
          imagePublicId: body.imagePublicId ?? current.imagePublicId,
          categoryId: Number(body.categoryId ?? current.categoryId),
          importPrice,
          sellPrice,
          quantity,
          status: productStatus,
          ...legacyStatus,
          publishedAt:
            productStatus === "PUBLIC"
              ? current.publishedAt || new Date()
              : current.publishedAt,
          gender: body.gender || null,
          seoTitle: body.seoTitle || null,
          seoDescription: body.seoDescription || null,
        },
      });
      const incomingIds = new Set(
        variants.map((v: { id?: number }) => Number(v.id)).filter(Boolean),
      );
      for (const old of current.variants)
        if (!incomingIds.has(old.id)) {
          const used = await tx.orderItem.count({
            where: { variantId: old.id },
          });
          if (used)
            await tx.productVariant.update({
              where: { id: old.id },
              data: { isActive: false },
            });
          else await tx.productVariant.delete({ where: { id: old.id } });
        }
      for (const v of variants) {
        const data = {
          sku: String(v.sku).trim(),
          size: v.size || null,
          color: v.color || null,
          colorCode: v.colorCode || null,
          price: Number(v.price || 0),
          sellPrice: Number(v.price || 0),
          importPrice: Number(v.importPrice || 0),
          quantity: Number(v.quantity || 0),
          isActive: Boolean(v.isActive),
        };
        const savedVariant = v.id
          ? await tx.productVariant.update({
            where: { id: Number(v.id), productId: id },
            data,
          })
          : await tx.productVariant.create({
              data: { ...data, productId: id },
            });
        if (Array.isArray(v.images)) {
          await tx.productVariantImage.deleteMany({
            where: { variantId: savedVariant.id },
          });
          if (v.images.length)
            await tx.productVariantImage.createMany({
              data: v.images.map(
                (
                  image: {
                    url: string;
                    publicId?: string;
                    position?: number;
                    isPrimary?: boolean;
                  },
                  position: number,
                ) => ({
                  variantId: savedVariant.id,
                  url: image.url,
                  publicId: image.publicId || null,
                  position: image.position ?? position,
                  isPrimary: image.isPrimary || position === 0,
                }),
              ),
            });
        }
      }
      if (body.images) {
        const kept = new Set<number>(
          body.images
            .map((image: { id?: number }) => Number(image.id))
            .filter((imageId: number) => Boolean(imageId)),
        );
        await tx.productImage.deleteMany({
          where: {
            productId: id,
            variantId: null,
            id: { notIn: [...kept] },
          },
        });
        for (const image of body.images)
          if (image.id)
            await tx.productImage.update({
              where: { id: Number(image.id) },
              data: {
                position: image.position,
                isPrimary: image.isPrimary,
                url: image.url,
                publicId: image.publicId || null,
              },
            });
          else
            await tx.productImage.create({
              data: {
                productId: id,
                url: image.url,
                publicId: image.publicId || null,
                position: image.position,
                isPrimary: image.isPrimary,
              },
            });
      }
      return tx.product.findUniqueOrThrow({
        where: { id },
        include: {
          category: true,
          images: {
            where: { variantId: null },
            orderBy: { position: "asc" },
          },
          variants: {
            orderBy: { createdAt: "asc" },
            include: { images: { orderBy: { position: "asc" } } },
          },
        },
      });
    });
    return NextResponse.json(toProductResponse(updated));
  } catch (error) {
    console.error("Update product failed", error);
    return bad("Không thể cập nhật sản phẩm. Vui lòng thử lại.", 500);
  }
}
export { PATCH as PUT };

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = Number((await params).id);

  if (!Number.isInteger(id) || id <= 0) {
    return bad("Mã sản phẩm không hợp lệ");
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id },
        select: {
          id: true,
          imagePublicId: true,
          images: { select: { publicId: true } },
          variants: {
            select: {
              images: { select: { publicId: true } },
            },
          },
        },
      });

      if (!product) {
        return { type: "not-found" as const };
      }

      const [dailySaleCount, contributionCount, orderItemCount] =
        await Promise.all([
          tx.dailySoldProduct.count({ where: { productId: id } }),
          tx.dailySoldProductContribution.count({ where: { productId: id } }),
          tx.orderItem.count({
            where: {
              OR: [{ productId: id }, { variant: { productId: id } }],
            },
          }),
        ]);

      if (dailySaleCount || contributionCount || orderItemCount) {
        return { type: "has-sales" as const };
      }

      // Cart items use Restrict relations and are temporary data, so remove
      // them before deleting an unsold product. Other product data cascades.
      await tx.cartItem.deleteMany({ where: { productId: id } });
      await tx.product.delete({ where: { id } });

      return { type: "deleted" as const, product };
    });

    if (result.type === "not-found") {
      return bad("Không tìm thấy sản phẩm", 404);
    }

    if (result.type === "has-sales") {
      return bad("Không thể xóa sản phẩm đã có lịch sử bán hàng", 409);
    }

    const publicIds = new Set(
      [
        result.product.imagePublicId,
        ...result.product.images.map((image) => image.publicId),
        ...result.product.variants.flatMap((variant) =>
          variant.images.map((image) => image.publicId),
        ),
      ].filter((publicId): publicId is string => Boolean(publicId)),
    );

    const cleanupResults = await Promise.allSettled(
      [...publicIds].map((publicId) =>
        deleteProductImageFromCloudinary(publicId),
      ),
    );
    const cleanupFailures = cleanupResults.filter(
      (cleanupResult) => cleanupResult.status === "rejected",
    );

    if (cleanupFailures.length) {
      console.error("Delete product Cloudinary cleanup failed", {
        productId: id,
        failureCount: cleanupFailures.length,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete product failed", error);
    return bad("Không thể xóa sản phẩm. Vui lòng thử lại.", 500);
  }
}
