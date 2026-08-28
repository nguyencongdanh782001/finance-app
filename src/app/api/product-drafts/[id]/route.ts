import prisma from "@/lib/db";
import { NextResponse } from "next/server";
import { validatePartialDraft } from "@/lib/products/product-draft-validation";
const userIdFrom = (request: Request) =>
  Number(request.headers.get("x-user-id"));

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = Number((await params).id);
  const draft = await prisma.productDraft.findFirst({
    where: { id, createdById: userIdFrom(request), status: "ACTIVE" },
    include: { originalProduct: { select: { id: true, title: true } } },
  });
  return draft
    ? NextResponse.json(draft)
    : NextResponse.json(
        { message: "Không tìm thấy bản nháp" },
        { status: 404 },
      );
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = Number((await params).id);
  const body = await request.json();
  const serialized = JSON.stringify(body.data || {});
  if (serialized.length > 500_000)
    return NextResponse.json(
      { message: "Bản nháp vượt quá dung lượng cho phép" },
      { status: 413 },
    );
  const draftError = validatePartialDraft(body.data);
  if (draftError)
    return NextResponse.json(
      { code: "INVALID_DRAFT", message: draftError },
      { status: 400 },
    );
  const result = await prisma.productDraft.updateMany({
    where: {
      id,
      createdById: userIdFrom(request),
      status: "ACTIVE",
      version: Number(body.version),
    },
    data: {
      data: body.data,
      currentStep: body.currentStep,
      version: { increment: 1 },
    },
  });
  if (!result.count)
    return NextResponse.json(
      {
        message: "Bản nháp đã được cập nhật ở nơi khác",
        code: "DRAFT_CONFLICT",
      },
      { status: 409 },
    );
  return NextResponse.json(
    await prisma.productDraft.findUniqueOrThrow({ where: { id } }),
  );
}
