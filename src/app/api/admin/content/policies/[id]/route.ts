import prisma from "@/lib/db";
import {
  POLICY_TYPES,
  sanitizePolicyHtml,
  slugify,
} from "@/lib/content-policy";
import { NextRequest, NextResponse } from "next/server";
import {
  hasMissingImageAlt,
  meaningfulText,
  sanitizeCompactRichTextHtml,
} from "@/lib/rich-text";

export async function GET(
  _: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const id = Number((await context.params).id);
  const policy = await prisma.storePolicy.findUnique({ where: { id } });
  return policy
    ? NextResponse.json({ policy })
    : NextResponse.json(
        { message: "Không tìm thấy chính sách." },
        { status: 404 },
      );
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const id = Number((await context.params).id);
  const current = await prisma.storePolicy.findUnique({ where: { id } });
  if (!current)
    return NextResponse.json(
      { message: "Không tìm thấy chính sách." },
      { status: 404 },
    );
  try {
    const body = await request.json();
    const title =
      body.title === undefined ? current.title : String(body.title).trim();
    const slug =
      body.slug === undefined ? current.slug : slugify(String(body.slug));
    const type = body.type === undefined ? current.type : String(body.type);
    if (!title || !POLICY_TYPES.includes(type as never) || !slug)
      return NextResponse.json(
        { message: "Dữ liệu chính sách không hợp lệ." },
        { status: 400 },
      );
    const exists = await prisma.storePolicy.findFirst({
      where: { slug, NOT: { id } },
    });
    if (exists)
      return NextResponse.json(
        { message: "Slug này đã tồn tại." },
        { status: 409 },
      );
    const status =
      body.status === undefined
        ? current.status
        : body.status === "PUBLISHED"
          ? "PUBLISHED"
          : body.status === "HIDDEN"
            ? "HIDDEN"
            : "DRAFT";
    const content =
      body.contentHtml === undefined && body.content === undefined
        ? current.contentHtml ||
          (typeof current.content === "object" &&
          current.content &&
          "html" in current.content
            ? String((current.content as { html?: unknown }).html || "")
            : "")
        : sanitizePolicyHtml(String(body.contentHtml || body.content));
    const summaryHtml =
      body.summaryHtml === undefined && body.summary === undefined
        ? current.summaryHtml || current.summary || ""
        : sanitizeCompactRichTextHtml(
            String(body.summaryHtml || body.summary || ""),
          );
    const summaryText = meaningfulText(summaryHtml);
    if (status === "PUBLISHED" && summaryText.length > 500)
      return NextResponse.json(
        { message: "Tóm tắt không được vượt quá 500 ký tự." },
        { status: 400 },
      );
    if (status === "PUBLISHED" && !meaningfulText(content))
      return NextResponse.json(
        { message: "Chính sách phải có nội dung trước khi xuất bản." },
        { status: 400 },
      );
    if (status === "PUBLISHED" && hasMissingImageAlt(content))
      return NextResponse.json(
        {
          message:
            "Vui lòng thêm văn bản thay thế cho tất cả hình ảnh trước khi xuất bản.",
        },
        { status: 400 },
      );
    const policy = await prisma.storePolicy.update({
      where: { id },
      data: {
        title,
        slug,
        type: type as never,
        summary: summaryText || null,
        summaryJson:
          body.summaryJson === undefined
            ? current.summaryJson
            : body.summaryJson || null,
        summaryHtml: summaryHtml || null,
        summaryText: summaryText || null,
        content: { html: sanitizePolicyHtml(content) },
        contentJson:
          body.contentJson === undefined
            ? current.contentJson
            : body.contentJson || null,
        contentHtml: sanitizePolicyHtml(content),
        status,
        showInFooter:
          body.showInFooter === undefined
            ? current.showInFooter
            : Boolean(body.showInFooter),
        footerOrder:
          body.footerOrder === undefined
            ? current.footerOrder
            : Number(body.footerOrder) || 0,
        seoTitle:
          body.seoTitle === undefined
            ? current.seoTitle
            : body.seoTitle || null,
        seoDescription:
          body.seoDescription === undefined
            ? current.seoDescription
            : body.seoDescription || null,
        publishedAt:
          status === "PUBLISHED" ? current.publishedAt || new Date() : null,
        updatedById: Number(request.headers.get("x-user-id")) || null,
      },
    });
    return NextResponse.json({ policy });
  } catch (error) {
    console.error("Update policy failed", error);
    return NextResponse.json(
      { message: "Không thể cập nhật chính sách." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const id = Number((await context.params).id);
  const policy = await prisma.storePolicy.findUnique({ where: { id } });
  if (!policy)
    return NextResponse.json(
      { message: "Không tìm thấy chính sách." },
      { status: 404 },
    );
  await prisma.storePolicy.update({
    where: { id },
    data: { status: "HIDDEN", showInFooter: false },
  });
  return NextResponse.json({ success: true });
}
