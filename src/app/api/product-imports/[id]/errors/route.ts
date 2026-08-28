import prisma from "@/lib/db";
import { NextResponse } from "next/server";
import {
  asImportErrors,
  asImportResults,
  asImportSource,
} from "@/lib/products/import/service";
import { createProductImportErrorWorkbook } from "@/lib/products/import/workbook";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const userId = Number(request.headers.get("x-user-id"));
  const job = await prisma.productImportJob.findFirst({
    where: { id, createdById: userId },
    select: { sourceData: true, validationErrors: true, resultData: true },
  });
  if (!job?.sourceData) {
    return NextResponse.json(
      { message: "Không tìm thấy dữ liệu lỗi." },
      { status: 404 },
    );
  }
  const source = asImportSource(job.sourceData);
  const resultPayload = (job.resultData || {}) as { items?: unknown };
  const runtimeErrors = asImportResults(resultPayload.items)
    .filter((item) => item.status === "FAILED")
    .map((item) => ({
      sheet: "Sản phẩm",
      row:
        source.products.find((product) => product.key === item.productKey)
          ?.row || 0,
      column: "product_key",
      field: "product_key",
      value: item.productKey,
      code: "IMPORT_TRANSACTION_FAILED",
      message: item.message || "Không thể tạo sản phẩm.",
      severity: "ERROR" as const,
      productKey: item.productKey,
    }));
  const errors = [...asImportErrors(job.validationErrors), ...runtimeErrors];
  if (!errors.length) {
    return NextResponse.json(
      { message: "Phiên nhập không có lỗi." },
      { status: 404 },
    );
  }
  const workbook = await createProductImportErrorWorkbook(source, errors);
  return new NextResponse(new Uint8Array(workbook), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition":
        'attachment; filename="products-import-errors.xlsx"',
      "Cache-Control": "private, no-store",
    },
  });
}
