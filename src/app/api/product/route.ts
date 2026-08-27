import prisma from "@/lib/db";
import type { Prisma } from "@/app/generated/prisma/client";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const search = searchParams.get("search") || "";
  const categoryId = searchParams.get("categoryId");
  const sort = searchParams.get("sort") || "createdAt-desc";
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 10);

  const skip = (page - 1) * limit;

  const where: Prisma.ProductWhereInput = {};

  if (search) {
    where.title = {
      contains: search,
      mode: "insensitive",
    };
  }

  if (categoryId) {
    where.categoryId = Number(categoryId);
  }

  const orderBy =
    sort === "title-asc"
      ? { title: "asc" as const }
      : sort === "title-desc"
        ? { title: "desc" as const }
        : sort === "createdAt-asc"
          ? { createdAt: "asc" as const }
          : { createdAt: "desc" as const };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy,
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
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({
    data: products,
    pagination: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
  });
}

export async function POST(req: Request) {
  const body = await req.json();

  const product = await prisma.product.create({
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

  return NextResponse.json(product);
}
