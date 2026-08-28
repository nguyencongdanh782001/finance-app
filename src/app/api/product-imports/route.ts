import prisma from "@/lib/db";
import { NextResponse } from "next/server";
import { parseAndValidateProductWorkbook } from "@/lib/products/import/parser";
import { PRODUCT_IMPORT_LIMITS } from "@/lib/products/import/types";
import {
  isFileBlockingImportError,
  toJsonValue,
} from "@/lib/products/import/service";

const userIdFrom = (request: Request) =>
  Number(request.headers.get("x-user-id"));

const safeFileName = (value: string) =>
  value.replace(/[^a-zA-Z0-9._\-\u00C0-\u024F]/g, "_").slice(0, 180);

export async function GET(request: Request) {
  const userId = userIdFrom(request);
  const jobs = await prisma.productImportJob.findMany({
    where: { createdById: userId },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      fileName: true,
      status: true,
      totalProducts: true,
      processed: true,
      succeeded: true,
      failed: true,
      skipped: true,
      createdAt: true,
      updatedAt: true,
      completedAt: true,
    },
  });
  return NextResponse.json({ data: jobs });
}

export async function POST(request: Request) {
  const userId = userIdFrom(request);
  const recentJobs = await prisma.productImportJob.count({
    where: {
      createdById: userId,
      createdAt: { gte: new Date(Date.now() - 60_000) },
    },
  });
  if (recentJobs >= 5) {
    return NextResponse.json(
      {
        code: "RATE_LIMITED",
        message: "Vui lòng chờ trước khi tải file tiếp theo.",
      },
      { status: 429 },
    );
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { code: "FILE_REQUIRED", message: "Vui lòng chọn file Excel." },
      { status: 400 },
    );
  }
  if (!file.name.toLowerCase().endsWith(".xlsx")) {
    return NextResponse.json(
      { code: "INVALID_FILE_TYPE", message: "Chỉ hỗ trợ file .xlsx." },
      { status: 400 },
    );
  }
  if (file.size <= 0 || file.size > PRODUCT_IMPORT_LIMITS.maxFileSize) {
    return NextResponse.json(
      {
        code: "INVALID_FILE_SIZE",
        message: "File phải có dung lượng từ 1 byte đến 10 MB.",
      },
      { status: 400 },
    );
  }

  const createMissingCategories =
    formData?.get("createMissingCategories") === "true";
  const forcePrivate = formData?.get("forcePrivate") === "true";
  const job = await prisma.productImportJob.create({
    data: {
      fileName: safeFileName(file.name),
      createdById: userId,
      createMissingCategories,
      forcePrivate,
    },
    select: { id: true },
  });

  try {
    await prisma.productImportJob.update({
      where: { id: job.id },
      data: { status: "VALIDATING" },
    });
    const bytes = Buffer.from(await file.arrayBuffer());
    if (bytes[0] !== 0x50 || bytes[1] !== 0x4b) {
      throw new Error("File không có cấu trúc .xlsx hợp lệ.");
    }
    const [categories, products, skus] = await Promise.all([
      prisma.category.findMany({
        where: { slug: { not: null } },
        select: { slug: true },
      }),
      prisma.product.findMany({
        where: { slug: { not: null } },
        select: { slug: true },
      }),
      prisma.productVariant.findMany({ select: { sku: true } }),
    ]);
    const validation = await parseAndValidateProductWorkbook(
      bytes,
      {
        categorySlugs: categories.flatMap((item) =>
          item.slug ? [item.slug] : [],
        ),
        productSlugs: products.flatMap((item) =>
          item.slug ? [item.slug] : [],
        ),
        variantSkus: skus.map((item) => item.sku),
      },
      { createMissingCategories, forcePrivate },
    );
    const fileLevelError = validation.errors.some(isFileBlockingImportError);
    const nextStatus =
      fileLevelError || validation.totals.valid === 0 ? "FAILED" : "READY";
    await prisma.productImportJob.update({
      where: { id: job.id },
      data: {
        status: nextStatus,
        totalProducts: validation.totals.products,
        totalVariants: validation.totals.variants,
        totalImages: validation.totals.images,
        sourceData: toJsonValue(validation.source),
        validationErrors: toJsonValue(validation.errors),
        resultData: toJsonValue({ totals: validation.totals, items: [] }),
        completedAt: nextStatus === "FAILED" ? new Date() : null,
      },
    });
    return NextResponse.json(
      { jobId: job.id, status: nextStatus, totals: validation.totals },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Không thể đọc file Excel.";
    await prisma.productImportJob.update({
      where: { id: job.id },
      data: {
        status: "FAILED",
        validationErrors: toJsonValue([
          {
            sheet: "Workbook",
            row: 0,
            column: "",
            field: "file",
            value: null,
            code: "MALFORMED_WORKBOOK",
            message,
            severity: "ERROR",
          },
        ]),
        completedAt: new Date(),
      },
    });
    return NextResponse.json(
      { jobId: job.id, code: "INVALID_WORKBOOK", message },
      { status: 400 },
    );
  }
}
