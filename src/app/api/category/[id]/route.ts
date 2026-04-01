import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: rawId } = await params;
  const id = Number(rawId);

  if (!id || isNaN(id)) {
    return NextResponse.json(
      { message: "Invalid category id" },
      { status: 400 },
    );
  }

  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  if (!category) {
    return NextResponse.json(
      { message: "Category not found" },
      { status: 404 },
    );
  }

  return NextResponse.json(category);
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
      { message: "Invalid category id" },
      { status: 400 },
    );
  }

  if (!body.name) {
    return NextResponse.json(
      { message: "Category name is required" },
      { status: 400 },
    );
  }

  const category = await prisma.category.update({
    where: { id },
    data: {
      name: body.name,
      icon: body.icon,
      color: body.color,
    },
  });

  return NextResponse.json(category);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: rawId } = await params;
  const id = Number(rawId);

  if (!id || isNaN(id)) {
    return NextResponse.json(
      { message: "Invalid category id" },
      { status: 400 },
    );
  }

  // check category có product không
  const count = await prisma.product.count({
    where: { categoryId: id },
  });

  if (count > 0) {
    return NextResponse.json(
      { message: "Category has products, cannot delete" },
      { status: 400 },
    );
  }

  await prisma.category.delete({
    where: { id },
  });

  return NextResponse.json({
    message: "Delete category success",
  });
}
