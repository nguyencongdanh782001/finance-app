import { NextResponse } from "next/server";
import { createProductImportTemplate } from "@/lib/products/import/workbook";

export async function GET() {
  const workbook = await createProductImportTemplate();
  return new NextResponse(new Uint8Array(workbook), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition":
        'attachment; filename="products-import-template.xlsx"',
      "Cache-Control": "private, no-store",
    },
  });
}
