import prisma from "@/lib/db";
import type { Prisma } from "@/app/generated/prisma/client";
import { NextResponse } from "next/server";
import {
  legacyFieldsForStatus,
  normalizeProductStatus,
  toProductResponse,
} from "@/lib/products/product-status";

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
const errorResponse = (message: string, status = 400) =>
  NextResponse.json({ message }, { status });

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const publicOnly = searchParams.get("public") === "true";
  const where: Prisma.ProductWhereInput = search
    ? { title: { contains: search, mode: "insensitive" } }
    : {};
  if (publicOnly) where.status = "PUBLIC";
  const categoryId = searchParams.get("categoryId");
  if (categoryId) where.categoryId = Number(categoryId);
  const gender = searchParams.get("gender");
  if (gender) where.gender = gender as Prisma.ProductWhereInput["gender"];
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const limit = Math.min(
    100,
    Math.max(1, Number(searchParams.get("limit") || 10)),
  );
  const sort = searchParams.get("sort") || "createdAt-desc";
  const orderBy =
    sort === "price-asc"
      ? { sellPrice: "asc" as const }
      : sort === "price-desc"
        ? { sellPrice: "desc" as const }
        : sort === "newest"
          ? { createdAt: "desc" as const }
          : sort === "title-asc"
      ? { title: "asc" as const }
      : sort === "title-desc"
        ? { title: "desc" as const }
        : sort === "createdAt-asc"
          ? { createdAt: "asc" as const }
          : { createdAt: "desc" as const };
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy,
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
    }),
    prisma.product.count({ where }),
  ]);
  return NextResponse.json({
    data: products.map(toProductResponse),
    pagination: { page, limit, total, totalPage: Math.ceil(total / limit) },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const title = String(body.title || "").trim();
    const categoryId = Number(body.categoryId);
    const importPrice = Number(body.importPrice);
    const sellPrice = Number(body.sellPrice);
    const quantity = Number(body.quantity ?? 0);
    const productStatus = normalizeProductStatus(body.productStatus);
    const legacyStatus = legacyFieldsForStatus(productStatus);
    if (
      !title ||
      !categoryId ||
      !Number.isInteger(quantity) ||
      quantity < 0 ||
      importPrice < 0 ||
      sellPrice < 0
    )
      return errorResponse(
        "Thông tin sản phẩm hoặc giá trị tồn kho không hợp lệ",
      );
    if (!(await prisma.category.findUnique({ where: { id: categoryId } })))
      return errorResponse("Danh mục không tồn tại", 404);
    const slug = String(body.slug || slugify(title));
    if (await prisma.product.findUnique({ where: { slug } }))
      return errorResponse("Đường dẫn sản phẩm đã tồn tại", 409);
    const variants = Array.isArray(body.variants) ? body.variants : [];
    const combinations = variants.map(
      (variant: { color?: string; size?: string }) =>
        `${variant.color || ""}|${variant.size || ""}`,
    );
    if (new Set(combinations).size !== combinations.length)
      return errorResponse("Tổ hợp màu và kích thước không được trùng nhau");
    if (
      variants.some(
        (variant: {
          price?: number;
          importPrice?: number;
          quantity?: number;
        }) =>
          Number(variant.price) < 0 ||
          Number(variant.importPrice) < 0 ||
          !Number.isInteger(Number(variant.quantity)) ||
          Number(variant.quantity) < 0,
      )
    )
      return errorResponse("Giá và tồn kho biến thể không hợp lệ");
    const skus = variants
      .map((variant: { sku?: string }) => String(variant.sku || "").trim())
      .filter(Boolean);
    if (new Set(skus).size !== skus.length)
      return errorResponse("SKU biến thể không được trùng nhau");
    const existingSku = skus.length
      ? await prisma.productVariant.findFirst({ where: { sku: { in: skus } } })
      : null;
    if (existingSku)
      return errorResponse(`SKU ${existingSku.sku} đã tồn tại`, 409);
    const product = await prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          title,
          slug,
          description: body.description || null,
          imageUrl: String(body.imageUrl || ""),
          imagePublicId: body.imagePublicId || "",
          categoryId,
          importPrice,
          sellPrice,
          quantity,
          status: productStatus,
          ...legacyStatus,
          publishedAt: productStatus === "PUBLIC" ? new Date() : null,
          gender: body.gender || null,
          seoTitle: body.seoTitle || null,
          seoDescription: body.seoDescription || null,
        },
      });
      if (body.images?.length)
        await tx.productImage.createMany({
          data: body.images.map(
            (image: {
              url: string;
              publicId?: string;
              position: number;
              isPrimary: boolean;
            }) => ({
              productId: created.id,
              url: image.url,
              publicId: image.publicId || null,
              position: image.position,
              isPrimary: image.isPrimary,
            }),
          ),
        });
      for (const variant of variants) {
        const savedVariant = await tx.productVariant.create({
          data: {
            productId: created.id,
            sku: variant.sku,
            size: variant.size || null,
            color: variant.color || null,
            colorCode: variant.colorCode || null,
            price: variant.price,
            sellPrice: variant.price,
            importPrice: variant.importPrice,
            quantity: variant.quantity,
            isActive: variant.isActive,
          },
        });
        if (Array.isArray(variant.images) && variant.images.length)
          await tx.productVariantImage.createMany({
            data: variant.images.map(
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
      return tx.product.findUniqueOrThrow({
        where: { id: created.id },
        include: {
          category: true,
          images: { orderBy: { position: "asc" } },
          variants: {
            orderBy: { createdAt: "asc" },
            include: { images: { orderBy: { position: "asc" } } },
          },
        },
      });
    });
    return NextResponse.json(toProductResponse(product), { status: 201 });
  } catch (error) {
    console.error("Create product failed", error);
    return errorResponse(
      "Không thể tạo sản phẩm. Vui lòng kiểm tra lại dữ liệu.",
      500,
    );
  }
}
