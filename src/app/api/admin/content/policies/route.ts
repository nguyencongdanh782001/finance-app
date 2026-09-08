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

const typeSet = new Set(POLICY_TYPES);

export async function GET() {
  const policies = await prisma.storePolicy.findMany({
    orderBy: [{ footerOrder: "asc" }, { updatedAt: "desc" }],
  });
  return NextResponse.json({ policies });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const title = String(body.title || "").trim();
    const type = String(body.type || "");
    const slug = slugify(String(body.slug || title));
    if (!title || !typeSet.has(type as never) || !slug)
      return NextResponse.json(
        { message: "Vui lòng nhập loại, tiêu đề và slug." },
        { status: 400 },
      );
    const exists = await prisma.storePolicy.findUnique({ where: { slug } });
    if (exists)
      return NextResponse.json(
        { message: "Slug này đã tồn tại." },
        { status: 409 },
      );
    const status =
      body.status === "PUBLISHED"
        ? "PUBLISHED"
        : body.status === "HIDDEN"
          ? "HIDDEN"
          : "DRAFT";
    const content = sanitizePolicyHtml(
      String(body.contentHtml || body.content || ""),
    );
    const summaryHtml = sanitizeCompactRichTextHtml(
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
    const policy = await prisma.storePolicy.create({
      data: {
        type: type as never,
        title,
        slug,
        summary: summaryText || null,
        summaryJson: body.summaryJson || null,
        summaryHtml: summaryHtml || null,
        summaryText: summaryText || null,
        content: { html: content },
        contentJson: body.contentJson || null,
        contentHtml: content,
        status,
        showInFooter: body.showInFooter !== false,
        footerOrder: Number(body.footerOrder) || 0,
        seoTitle: body.seoTitle ? String(body.seoTitle) : null,
        seoDescription: body.seoDescription
          ? String(body.seoDescription)
          : null,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
        createdById: Number(request.headers.get("x-user-id")) || null,
        updatedById: Number(request.headers.get("x-user-id")) || null,
      },
    });
    return NextResponse.json({ policy }, { status: 201 });
  } catch (error) {
    console.error("Create policy failed", error);
    return NextResponse.json(
      { message: "Không thể tạo chính sách." },
      { status: 500 },
    );
  }
}
