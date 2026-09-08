import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  if (!Array.isArray(body.items)) return NextResponse.json({ message: "Danh sách sắp xếp không hợp lệ." }, { status: 400 });
  await prisma.$transaction(body.items.map((item: { id: number; position: number }) => prisma.homepageBanner.update({ where: { id: Number(item.id) }, data: { position: Number(item.position), updatedById: Number(request.headers.get("x-user-id")) || null } })));
  return NextResponse.json({ success: true });
}
