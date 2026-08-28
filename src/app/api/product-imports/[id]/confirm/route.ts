import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const userId = Number(request.headers.get("x-user-id"));
  const body = await request.json().catch(() => ({}));
  if (body.confirmed !== true) {
    return NextResponse.json(
      {
        code: "CONFIRMATION_REQUIRED",
        message: "Bạn cần xác nhận trước khi nhập dữ liệu.",
      },
      { status: 400 },
    );
  }
  const updated = await prisma.productImportJob.updateMany({
    where: { id, createdById: userId, status: "READY" },
    data: {
      status: "PROCESSING",
      processed: 0,
      succeeded: 0,
      failed: 0,
      skipped: 0,
      processingToken: null,
      processingStartedAt: null,
      completedAt: null,
    },
  });
  if (!updated.count) {
    return NextResponse.json(
      {
        code: "JOB_NOT_READY",
        message: "Phiên nhập không còn ở trạng thái sẵn sàng.",
      },
      { status: 409 },
    );
  }
  return NextResponse.json({ jobId: id, status: "PROCESSING" });
}
