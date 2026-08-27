import prisma from "@/lib/db";
import { deleteProductImageFromCloudinary } from "@/lib/cloudinary-upload";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: rawId } = await params;
  const id = Number(rawId);

  if (!id || isNaN(id)) {
    return NextResponse.json(
      { message: "Invalid product id" },
      { status: 400 },
    );
  }

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      variants: {
        where: {
          isActive: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!product) {
    return NextResponse.json({ message: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(product);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const body = await req.json();
  const { id: rawId } = await params;
  const id = Number(rawId);

  if (!id || isNaN(id)) {
    return NextResponse.json(
      { message: "Invalid product id" },
      { status: 400 },
    );
  }

  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    return NextResponse.json({ message: "Product not found" }, { status: 404 });
  }

  const shouldDeletePreviousImage =
    Boolean(body.imagePublicId) &&
    Boolean(product.imagePublicId) &&
    body.imagePublicId !== product.imagePublicId;

  await prisma.product.update({
    where: { id },
    data: {
      title: body.title,
      imageUrl: body.imageUrl,
      imagePublicId: body.imagePublicId,
      categoryId: body.categoryId,
      importPrice: body.importPrice,
      sellPrice: body.sellPrice,
      quantity: body.quantity,
    },
  });

  if (shouldDeletePreviousImage) {
    try {
      await deleteProductImageFromCloudinary(product.imagePublicId);
    } catch (error) {
      console.error("Delete previous Cloudinary product image failed", {
        productId: id,
        publicId: product.imagePublicId,
        error,
      });
    }
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: rawId } = await params;
  const id = Number(rawId);

  if (!id || isNaN(id)) {
    return NextResponse.json(
      { message: "Invalid product id" },
      { status: 400 },
    );
  }

  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    return NextResponse.json({ message: "Product not found" }, { status: 404 });
  }

  const soldCount = await prisma.dailySoldProduct.count({
    where: {
      productId: id,
    },
  });

  if (soldCount > 0) {
    return NextResponse.json(
      { message: "Không thể xóa sản phẩm đã có lịch sử bán hàng" },
      { status: 409 },
    );
  }

  await prisma.product.delete({
    where: { id },
  });

  if (product.imagePublicId) {
    try {
      await deleteProductImageFromCloudinary(product.imagePublicId);
    } catch (error) {
      console.error("Delete Cloudinary product image failed", {
        productId: id,
        publicId: product.imagePublicId,
        error,
      });
    }
  }

  return NextResponse.json({ success: true });
}
