import prisma from "@/lib/db";
import { NextResponse } from "next/server";
import {
  asImportErrors,
  asImportResults,
  asImportSource,
  toJsonValue,
} from "@/lib/products/import/service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const userId = Number(request.headers.get("x-user-id"));
  const job = await prisma.productImportJob.findFirst({
    where: {
      id,
      createdById: userId,
      status: { in: ["FAILED", "PARTIALLY_COMPLETED"] },
    },
  });
  if (!job?.sourceData) {
    return NextResponse.json(
      { message: "Không có phiên nhập lỗi để thử lại." },
      { status: 404 },
    );
  }
  const resultPayload = (job.resultData || {}) as { items?: unknown };
  const failedKeys = new Set(
    asImportResults(resultPayload.items)
      .filter((item) => item.status === "FAILED")
      .map((item) => item.productKey.toLocaleLowerCase("vi")),
  );
  if (!failedKeys.size) {
    return NextResponse.json(
      {
        message:
          "Chỉ các lỗi phát sinh khi xử lý mới có thể thử lại. Hãy sửa và tải lại file đối với lỗi validation.",
      },
      { status: 409 },
    );
  }
  const source = asImportSource(job.sourceData);
  const products = source.products.filter((product) =>
    failedKeys.has(product.key.toLocaleLowerCase("vi")),
  );
  const errors = asImportErrors(job.validationErrors).filter(
    (error) =>
      !error.productKey ||
      failedKeys.has(error.productKey.toLocaleLowerCase("vi")),
  );
  const retry = await prisma.productImportJob.create({
    data: {
      fileName: `retry-${job.fileName}`.slice(0, 180),
      status: "READY",
      createdById: userId,
      createMissingCategories: job.createMissingCategories,
      forcePrivate: job.forcePrivate,
      totalProducts: products.length,
      totalVariants: products.reduce(
        (sum, product) => sum + product.variants.length,
        0,
      ),
      totalImages: products.reduce(
        (sum, product) => sum + product.images.length,
        0,
      ),
      sourceData: toJsonValue({ ...source, products }),
      validationErrors: toJsonValue(errors),
      resultData: toJsonValue({
        totals: {
          products: products.length,
          valid: products.length,
          invalid: 0,
        },
        items: [],
      }),
    },
    select: { id: true },
  });
  return NextResponse.json(
    { jobId: retry.id, status: "READY" },
    { status: 201 },
  );
}
