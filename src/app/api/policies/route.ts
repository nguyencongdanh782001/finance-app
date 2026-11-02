import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const footerOnly = request.nextUrl.searchParams.get("footer") === "true";
  const policies = await prisma.storePolicy.findMany({
    where: { status: "PUBLISHED", ...(footerOnly ? { showInFooter: true } : {}) },
    orderBy: [{ footerOrder: "asc" }, { title: "asc" }],
    select: {
      title: true,
      slug: true,
      summary: true,
      summaryHtml: true,
      summaryText: true,
      contentHtml: true,
      content: true,
      updatedAt: true,
      footerOrder: true,
    },
  });
  return NextResponse.json({
    items: policies.map((policy) => ({
      title: policy.title,
      slug: policy.slug,
      summaryHtml: policy.summaryHtml || policy.summary || null,
      summaryText: policy.summaryText || policy.summary || null,
      contentHtml:
        policy.contentHtml ||
        (typeof policy.content === "object" && policy.content && "html" in policy.content
          ? String((policy.content as { html?: unknown }).html || "")
          : ""),
      updatedAt: policy.updatedAt,
      footerOrder: policy.footerOrder,
    })),
  });
}
