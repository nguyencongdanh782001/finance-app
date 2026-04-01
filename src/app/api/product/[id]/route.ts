import prisma from "@/lib/db";
import { deleteImageFromCloudinary } from "@/lib/cloudinary-upload";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: rawId } = await params;
  const id = Number(rawId);

  if (!id || isNaN(id)) {
    return NextResponse.json({ message: "Invalid product id" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
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
    return NextResponse.json({ message: "Invalid product id" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    return NextResponse.json({ message: "Product not found" }, { status: 404 });
  }

  // nếu có ảnh mới → xoá ảnh cũ
  if (body.imagePublicId && product.imagePublicId) {
    await deleteImageFromCloudinary(product.imagePublicId);
  }

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

  return NextResponse.json({ success: true });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: rawId } = await params;
  const id = Number(rawId);

  if (!id || isNaN(id)) {
    return NextResponse.json({ message: "Invalid product id" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    return NextResponse.json({ message: "Product not found" }, { status: 404 });
  }

  if (product.imagePublicId) {
    await deleteImageFromCloudinary(product.imagePublicId);
  }

  await prisma.product.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
