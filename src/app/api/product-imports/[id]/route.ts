import prisma from "@/lib/db";
import { NextResponse } from "next/server";
import {
  asImportErrors,
  asImportResults,
  asImportSource,
  hasBlockingImportError,
  isFileBlockingImportError,
} from "@/lib/products/import/service";
import { summarizeVariantsByColor } from "@/lib/products/variant-groups";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const userId = Number(request.headers.get("x-user-id"));
  const job = await prisma.productImportJob.findFirst({
    where: { id, createdById: userId },
  });
  if (!job) {
    return NextResponse.json(
      { message: "Không tìm thấy phiên nhập." },
      { status: 404 },
    );
  }

  const source = job.sourceData ? asImportSource(job.sourceData) : null;
  const errors = asImportErrors(job.validationErrors);
  const resultPayload = (job.resultData || {}) as {
    totals?: Record<string, number>;
    items?: unknown;
  };
  const results = asImportResults(resultPayload.items);
  const runtimeErrors = results
    .filter((item) => item.status === "FAILED")
    .map((item) => {
      const product = source?.products.find(
        (candidate) => candidate.key === item.productKey,
      );
      return {
        sheet: product?.sheet || "Sản phẩm",
        row: product?.row || 0,
        column: "product_key",
        field: "product_key",
        value: item.productKey,
        code: "IMPORT_TRANSACTION_FAILED",
        message: item.message || "Không thể tạo sản phẩm.",
        severity: "ERROR" as const,
        productKey: item.productKey,
      };
    });
  const allErrors = [...errors, ...runtimeErrors];
  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page") || 1));
  const limit = Math.min(
    100,
    Math.max(1, Number(url.searchParams.get("limit") || 25)),
  );
  const filter = url.searchParams.get("filter") || "ALL";
  const search = (url.searchParams.get("search") || "")
    .trim()
    .toLocaleLowerCase("vi");
  const globalError = allErrors.some(isFileBlockingImportError);
  const preview = (source?.products || [])
    .map((product) => {
      const productErrors = allErrors.filter(
        (error) =>
          !error.productKey ||
          error.productKey.toLocaleLowerCase("vi") ===
            product.key.toLocaleLowerCase("vi"),
      );
      const hasError =
        globalError || hasBlockingImportError(allErrors, product.key);
      const hasWarning = productErrors.some(
        (error) => error.severity === "WARNING",
      );
      return {
        productKey: product.key,
        name: product.name,
        slug: product.slug,
        status: product.status,
        variants:
          product.variants.length || (product.hasVariants === false ? 1 : 0),
        variantGroups: summarizeVariantsByColor(product.variants),
        images: product.images.length,
        state: hasError ? "ERROR" : hasWarning ? "WARNING" : "VALID",
        errors: productErrors.slice(0, 5),
        result: results.find((item) => item.productKey === product.key) || null,
      };
    })
    .filter((item) => {
      if (
        search &&
        !`${item.productKey} ${item.name} ${item.slug}`
          .toLocaleLowerCase("vi")
          .includes(search)
      )
        return false;
      return filter === "ALL" || item.state === filter;
    });
  const total = preview.length;

  return NextResponse.json({
    job: {
      id: job.id,
      fileName: job.fileName,
      status: job.status,
      mode: job.mode,
      createMissingCategories: job.createMissingCategories,
      forcePrivate: job.forcePrivate,
      totalProducts: job.totalProducts,
      totalVariants: job.totalVariants,
      totalImages: job.totalImages,
      processed: job.processed,
      succeeded: job.succeeded,
      failed: job.failed,
      skipped: job.skipped,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      completedAt: job.completedAt,
    },
    totals: resultPayload.totals || null,
    preview: preview.slice((page - 1) * limit, page * limit),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    errorCount: allErrors.filter((error) => error.severity === "ERROR").length,
    warningCount: allErrors.filter((error) => error.severity === "WARNING")
      .length,
  });
}
