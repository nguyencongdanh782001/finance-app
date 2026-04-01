import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const body = await req.json();

  if (!body.name) {
    return NextResponse.json(
      { message: "Category name is required" },
      { status: 400 },
    );
  }

  const category = await prisma.category.create({
    data: {
      name: body.name,
      icon: body.icon,
      color: body.color,
    },
  });

  return NextResponse.json(category);
}
