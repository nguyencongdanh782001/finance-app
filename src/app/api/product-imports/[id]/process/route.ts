import { randomUUID } from "node:crypto";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";
import { PRODUCT_IMPORT_LIMITS } from "@/lib/products/import/types";
import {
  asImportErrors,
  asImportResults,
  asImportSource,
  friendlyImportError,
  hasBlockingImportError,
  importOneProduct,
  toJsonValue,
} from "@/lib/products/import/service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const userId = Number(request.headers.get("x-user-id"));
  const token = randomUUID();
  const staleAt = new Date(Date.now() - 5 * 60_000);
  const claimed = await prisma.productImportJob.updateMany({
    where: {
      id,
      createdById: userId,
      status: "PROCESSING",
      OR: [{ processingToken: null }, { processingStartedAt: { lt: staleAt } }],
    },
    data: { processingToken: token, processingStartedAt: new Date() },
  });
  if (!claimed.count) {
    return NextResponse.json(
      {
        code: "JOB_BUSY",
        message: "Một lô khác đang được xử lý hoặc phiên nhập đã kết thúc.",
      },
      { status: 409 },
    );
  }

  try {
    const job = await prisma.productImportJob.findFirstOrThrow({
      where: { id, createdById: userId, processingToken: token },
    });
    const source = asImportSource(job.sourceData);
    const errors = asImportErrors(job.validationErrors);
    const resultPayload = (job.resultData || {}) as {
      totals?: Record<string, number>;
      items?: unknown;
    };
    const previousResults = asImportResults(resultPayload.items);
    const batch = source.products.slice(
      job.processed,
      job.processed + PRODUCT_IMPORT_LIMITS.batchSize,
    );
    const batchResults = [];
    let succeeded = 0;
    let failed = 0;
    let skipped = 0;

    for (const product of batch) {
      if (hasBlockingImportError(errors, product.key)) {
        skipped += 1;
        batchResults.push({
          productKey: product.key,
          name: product.name,
          status: "SKIPPED" as const,
          message: "Bỏ qua vì dữ liệu preview đang có lỗi.",
        });
        continue;
      }
      try {
        const productId = await importOneProduct(product, source, {
          createMissingCategories: job.createMissingCategories,
          forcePrivate: job.forcePrivate,
        });
        succeeded += 1;
        batchResults.push({
          productKey: product.key,
          name: product.name,
          status: "SUCCESS" as const,
          productId,
        });
      } catch (error) {
        failed += 1;
        batchResults.push({
          productKey: product.key,
          name: product.name,
          status: "FAILED" as const,
          message: friendlyImportError(error),
        });
      }
    }

    const processed = job.processed + batch.length;
    const isDone = processed >= source.products.length;
    const totalSucceeded = job.succeeded + succeeded;
    const totalFailed = job.failed + failed;
    const totalSkipped = job.skipped + skipped;
    const finalStatus = !isDone
      ? "PROCESSING"
      : totalSucceeded === 0
        ? "FAILED"
        : totalFailed > 0 || totalSkipped > 0
          ? "PARTIALLY_COMPLETED"
          : "COMPLETED";

    await prisma.productImportJob.update({
      where: { id, processingToken: token },
      data: {
        status: finalStatus,
        processed,
        succeeded: totalSucceeded,
        failed: totalFailed,
        skipped: totalSkipped,
        resultData: toJsonValue({
          totals: resultPayload.totals || {},
          items: [...previousResults, ...batchResults],
        }),
        processingToken: null,
        processingStartedAt: null,
        completedAt: isDone ? new Date() : null,
      },
    });
    return NextResponse.json({
      jobId: id,
      status: finalStatus,
      processed,
      total: source.products.length,
      succeeded: totalSucceeded,
      failed: totalFailed,
      skipped: totalSkipped,
    });
  } catch (error) {
    await prisma.productImportJob.updateMany({
      where: { id, createdById: userId, processingToken: token },
      data: { processingToken: null, processingStartedAt: null },
    });
    console.error("Process product import batch failed", error);
    return NextResponse.json(
      {
        code: "BATCH_FAILED",
        message: "Không thể xử lý lô sản phẩm. Bạn có thể thử tiếp tục lại.",
      },
      { status: 500 },
    );
  }
}
