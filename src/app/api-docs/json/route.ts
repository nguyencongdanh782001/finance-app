import { NextResponse } from "next/server";
import { getOpenApiDocument, isSwaggerEnabled } from "@/lib/swagger";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isSwaggerEnabled()) {
    return NextResponse.json({ message: "Not Found" }, { status: 404 });
  }

  return NextResponse.json(await getOpenApiDocument());
}
