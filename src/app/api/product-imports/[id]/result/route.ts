import prisma from "@/lib/db";
import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { asImportResults } from "@/lib/products/import/service";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = Number(request.headers.get("x-user-id"));
  const job = await prisma.productImportJob.findFirst({ where: { id, createdById: userId }, select: { resultData: true } });
  if (!job) return NextResponse.json({ message: "Không tìm thấy phiên nhập." }, { status: 404 });
  const payload = (job.resultData || {}) as { items?: unknown };
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Kết quả");
  sheet.addRow(["product_key", "name", "status", "product_id", "message"]);
  asImportResults(payload.items).forEach((item) => sheet.addRow([item.productKey, item.name, item.status, item.productId || "", item.message || ""]));
  const bytes = Buffer.from(await workbook.xlsx.writeBuffer());
  return new NextResponse(new Uint8Array(bytes), { headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Content-Disposition": `attachment; filename="products-import-result-${id}.xlsx"`, "Cache-Control": "private, no-store" } });
}
