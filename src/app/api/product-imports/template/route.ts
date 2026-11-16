import { NextResponse } from "next/server";
import {
  createPerProductImportTemplate,
  createProductImportTemplate,
} from "@/lib/products/import/workbook";

export async function GET(request: Request) {
  const legacy = new URL(request.url).searchParams.get("format") === "legacy";
  const workbook = legacy
    ? await createProductImportTemplate()
    : await createPerProductImportTemplate();
  return new NextResponse(new Uint8Array(workbook), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="products-import-template${legacy ? "-legacy" : ""}.xlsx"`,
      "Cache-Control": "private, no-store",
    },
  });
}
