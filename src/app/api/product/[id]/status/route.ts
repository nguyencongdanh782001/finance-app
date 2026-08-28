import prisma from "@/lib/db";
import { NextResponse } from "next/server";
import {
  isProductStatus,
  legacyFieldsForStatus,
} from "@/lib/products/product-status";

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
    const productStatus = body.productStatus;

    if (!isProductStatus(productStatus)) {
      return NextResponse.json(
        { message: "Trạng thái sản phẩm không hợp lệ" },
        { status: 400 },
      );
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id },
      select: { id: true, publishedAt: true },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { message: "Không tìm thấy sản phẩm" },
        { status: 404 },
      );
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        status: productStatus,
        ...legacyFieldsForStatus(productStatus),
        ...(productStatus === "PUBLIC"
          ? { publishedAt: existingProduct.publishedAt || new Date() }
          : {}),
      },
      select: { id: true, status: true },
    });

    return NextResponse.json({
      id: product.id,
      productStatus: product.status,
    });
  } catch (error) {
    console.error("Update product status failed", error);
    return NextResponse.json(
      { message: "Không thể cập nhật trạng thái sản phẩm" },
      { status: 500 },
    );
  }
}
