import prisma from "@/lib/db";
import { NextResponse } from "next/server";
import { toProductResponse } from "@/lib/products/product-status";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const role = request.headers.get("x-user-role");
  if (!request.headers.get("x-user-id")) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  const id = Number((await params).id);
  if (!Number.isInteger(id)) return NextResponse.json({ message: "Invalid product id" }, { status: 400 });
  const product = await prisma.product.findUnique({ where: { id }, include: { category: true, images: { orderBy: { position: "asc" } }, variants: { orderBy: { createdAt: "asc" }, include: { images: { orderBy: { position: "asc" } } } } } });
  if (!product) return NextResponse.json({ message: "Product not found" }, { status: 404 });
  return NextResponse.json(toProductResponse(product));
}
