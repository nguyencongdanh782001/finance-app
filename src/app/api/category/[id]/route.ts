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
      parent: { select: { id: true, name: true } },
      children: { select: { id: true, name: true, parentId: true } },
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

  const name = String(body.name || "")
    .trim()
    .replace(/\s+/g, " ");
  if (!name || name.length < 2 || name.length > 100) {
    return NextResponse.json(
      {
        code: "VALIDATION_ERROR",
        message: !name
          ? "Vui lòng nhập tên danh mục."
          : name.length < 2
            ? "Tên danh mục phải có ít nhất 2 ký tự."
            : "Tên danh mục không được vượt quá 100 ký tự.",
      },
      { status: 400 },
    );
  }

  const parentId = body.parentId ? Number(body.parentId) : null;
  const duplicateName = await prisma.category.findFirst({
    where: {
      parentId,
      name: { equals: name, mode: "insensitive" },
      NOT: { id },
    },
  });
  if (duplicateName)
    return NextResponse.json(
      { code: "VALIDATION_ERROR", message: "Danh mục cùng cấp đã có tên này." },
      { status: 409 },
    );
  if (parentId === id)
    return NextResponse.json(
      { message: "Danh mục không thể là cha của chính nó" },
      { status: 400 },
    );
  if (parentId) {
    let cursor: number | null = parentId;
    const visited = new Set<number>();
    while (cursor) {
      if (cursor === id || visited.has(cursor))
        return NextResponse.json(
          { message: "Không thể tạo vòng lặp danh mục" },
          { status: 400 },
        );
      visited.add(cursor);
      const parent: { parentId: number | null } | null =
        await prisma.category.findUnique({
          where: { id: cursor },
          select: { parentId: true },
        });
      cursor = parent?.parentId ?? null;
    }
  }
  const slug = String(body.slug || body.name)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  if (await prisma.category.findFirst({ where: { slug, NOT: { id } } }))
    return NextResponse.json(
      { message: "Slug danh mục đã tồn tại" },
      { status: 409 },
    );

  const category = await prisma.category.update({
    where: { id },
    data: {
      name,
      icon: body.icon,
      color: body.color,
      slug,
      parentId,
      description: body.description || null,
      tryOnCategory: body.tryOnCategory || "NOT_SUPPORTED",
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

  const children = await prisma.category.count({ where: { parentId: id } });

  if (count > 0 || children > 0) {
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
