import prisma from "@/lib/db";
import { NextResponse } from "next/server";
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = Number((await params).id);
  const userId = Number(request.headers.get("x-user-id"));
  const result = await prisma.productDraft.updateMany({
    where: { id, createdById: userId, status: "ACTIVE" },
    data: { status: "DISCARDED", discardedAt: new Date() },
  });
  return result.count
    ? NextResponse.json({ success: true })
    : NextResponse.json(
        { message: "Không tìm thấy bản nháp" },
        { status: 404 },
      );
}
