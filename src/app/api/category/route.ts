import prisma from "@/lib/db";
import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";

const getCachedPublicCategories = unstable_cache(
  () =>
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      include: {
        parent: { select: { id: true, name: true } },
        _count: { select: { products: { where: { status: "PUBLIC" } } } },
      },
    }),
  ["public-categories"],
  { revalidate: 300, tags: ["categories"] },
);

export async function GET(request: Request) {
  const publicOnly = new URL(request.url).searchParams.get("public") === "true";
  const categories = publicOnly
    ? await getCachedPublicCategories()
    : await prisma.category.findMany({
        orderBy: {
          name: "asc",
        },
        include: {
          parent: { select: { id: true, name: true } },
          _count: {
            select: {
              products: publicOnly ? { where: { status: "PUBLIC" } } : true,
            },
          },
        },
      });

  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const body = await req.json();

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
    where: { parentId, name: { equals: name, mode: "insensitive" } },
  });
  if (duplicateName)
    return NextResponse.json(
      { code: "VALIDATION_ERROR", message: "Danh mục cùng cấp đã có tên này." },
      { status: 409 },
    );

  const slug = String(body.slug || body.name)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  if (await prisma.category.findUnique({ where: { slug } }))
    return NextResponse.json(
      { message: "Slug danh mục đã tồn tại" },
      { status: 409 },
    );
  if (
    body.parentId &&
    !(await prisma.category.findUnique({
      where: { id: Number(body.parentId) },
    }))
  )
    return NextResponse.json(
      { message: "Danh mục cha không tồn tại" },
      { status: 400 },
    );
  const category = await prisma.category.create({
    data: {
      name,
      icon: body.icon,
      color: body.color,
      slug,
      parentId,
      description: body.description || null,
    },
  });

  return NextResponse.json(category);
}
