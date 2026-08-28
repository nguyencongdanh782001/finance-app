import prisma from "@/lib/db";
import { ProductStatus } from "@/interface/product";
import { NextResponse } from "next/server";

const PRODUCT_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "ARCHIVED",
  "OUT_OF_STOCK",
] as const satisfies readonly ProductStatus[];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = Number((await params).id);

  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json(
      { message: "Mã sản phẩm không hợp lệ" },
      { status: 400 },
    );
  }

  try {
    const body = await req.json();
    const productStatus = body.productStatus as ProductStatus;

    if (!PRODUCT_STATUSES.includes(productStatus)) {
      return NextResponse.json(
        { message: "Trạng thái sản phẩm không hợp lệ" },
        { status: 400 },
      );
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { message: "Không tìm thấy sản phẩm" },
        { status: 404 },
      );
    }

    const product = await prisma.product.update({
      where: { id },
      data: { productStatus },
      select: { id: true, productStatus: true },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Update product status failed", error);
    return NextResponse.json(
      { message: "Không thể cập nhật trạng thái sản phẩm" },
      { status: 500 },
    );
  }
}
