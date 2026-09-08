import prisma from "@/lib/db";
import { BANNER_PLACEMENTS, isSafeUrl } from "@/lib/content-policy";
import { NextRequest, NextResponse } from "next/server";

const placementSet = new Set(BANNER_PLACEMENTS);

const parseDate = (value: unknown) => {
  if (!value) return null;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? undefined : date;
};

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get("search")?.trim();
  const placement = request.nextUrl.searchParams.get("placement");
  const banners = await prisma.homepageBanner.findMany({
    where: {
      ...(search ? { OR: [{ internalName: { contains: search, mode: "insensitive" } }, { title: { contains: search, mode: "insensitive" } }] } : {}),
      ...(placement && placementSet.has(placement as (typeof BANNER_PLACEMENTS)[number]) ? { placement: placement as never } : {}),
    },
    orderBy: [{ placement: "asc" }, { position: "asc" }, { updatedAt: "desc" }],
  });
  return NextResponse.json({ banners });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const internalName = String(body.internalName || "").trim();
    const title = String(body.title || "").trim();
    const placement = String(body.placement || "");
    if (!internalName || !title || !placementSet.has(placement as never)) {
      return NextResponse.json({ message: "Vui lòng nhập tên, tiêu đề và vị trí banner." }, { status: 400 });
    }
    const startsAt = parseDate(body.startsAt);
    const endsAt = parseDate(body.endsAt);
    if (startsAt === undefined || endsAt === undefined || (startsAt && endsAt && endsAt <= startsAt)) {
      return NextResponse.json({ message: "Khoảng thời gian hiển thị không hợp lệ." }, { status: 400 });
    }
    const imageUrl = String(body.desktopImage || body.imageUrl || "");
    const isAnnouncement = placement === "ANNOUNCEMENT_BAR";
    if (!isAnnouncement && !imageUrl) {
      return NextResponse.json({ message: "Banner hình ảnh cần có ảnh desktop." }, { status: 400 });
    }
    for (const [label, url] of [[body.primaryCtaLabel, body.primaryCtaUrl], [body.secondaryCtaLabel, body.secondaryCtaUrl]]) {
      if (Boolean(label) !== Boolean(url) || (url && !isSafeUrl(String(url)))) return NextResponse.json({ message: "CTA cần có đủ nhãn, URL hợp lệ và không chứa giao thức không an toàn." }, { status: 400 });
    }
    const userId = Number(request.headers.get("x-user-id")) || null;
    const banner = await prisma.homepageBanner.create({
      data: {
        internalName, title, subtitle: body.subtitle ? String(body.subtitle) : null,
        eyebrow: body.eyebrow ? String(body.eyebrow) : null,
        description: body.description ? String(body.description) : null,
        imageUrl, desktopImage: body.desktopImage ? String(body.desktopImage) : null,
        mobileImage: body.mobileImage ? String(body.mobileImage) : null,
        imagePublicId: body.imagePublicId ? String(body.imagePublicId) : null,
        mobileImagePublicId: body.mobileImagePublicId ? String(body.mobileImagePublicId) : null,
        imageAlt: String(body.imageAlt || title),
        linkUrl: body.linkUrl ? String(body.linkUrl) : null,
        primaryCtaLabel: body.primaryCtaLabel ? String(body.primaryCtaLabel) : null,
        primaryCtaUrl: body.primaryCtaUrl ? String(body.primaryCtaUrl) : null,
        secondaryCtaLabel: body.secondaryCtaLabel ? String(body.secondaryCtaLabel) : null,
        secondaryCtaUrl: body.secondaryCtaUrl ? String(body.secondaryCtaUrl) : null,
        textAlignment: body.textAlignment === "CENTER" || body.textAlignment === "RIGHT" ? body.textAlignment : "LEFT",
        textTheme: body.textTheme === "DARK" ? "DARK" : "LIGHT",
        overlayOpacity: Math.min(80, Math.max(0, Number(body.overlayOpacity) || 0)),
        placement: placement as never,
        position: Math.max(0, Number(body.position) || 0),
        isActive: body.isActive !== false,
        startsAt, endsAt, createdById: userId, updatedById: userId,
      },
    });
    return NextResponse.json({ banner }, { status: 201 });
  } catch (error) {
    console.error("Create banner failed", error);
    return NextResponse.json({ message: "Không thể tạo banner." }, { status: 500 });
  }
}
