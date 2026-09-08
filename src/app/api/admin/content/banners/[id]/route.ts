import prisma from "@/lib/db";
import { BANNER_PLACEMENTS, isSafeUrl } from "@/lib/content-policy";
import { NextRequest, NextResponse } from "next/server";

const getId = (value: string) => Number(value);
const parseDate = (value: unknown) => {
  if (!value) return null;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? undefined : date;
};

export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const id = getId((await context.params).id);
  const banner = await prisma.homepageBanner.findUnique({ where: { id } });
  return banner ? NextResponse.json({ banner }) : NextResponse.json({ message: "Không tìm thấy banner." }, { status: 404 });
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const id = getId((await context.params).id);
  try {
    const body = await request.json();
    const current = await prisma.homepageBanner.findUnique({ where: { id } });
    if (!current) return NextResponse.json({ message: "Không tìm thấy banner." }, { status: 404 });
    const placement = body.placement || current.placement;
    if (!BANNER_PLACEMENTS.includes(placement as never)) return NextResponse.json({ message: "Vị trí banner không hợp lệ." }, { status: 400 });
    const startsAt = body.startsAt === undefined ? current.startsAt : parseDate(body.startsAt);
    const endsAt = body.endsAt === undefined ? current.endsAt : parseDate(body.endsAt);
    if (startsAt === undefined || endsAt === undefined || (startsAt && endsAt && endsAt <= startsAt)) return NextResponse.json({ message: "Khoảng thời gian hiển thị không hợp lệ." }, { status: 400 });
    const imageUrl = body.desktopImage === undefined ? current.desktopImage || current.imageUrl : String(body.desktopImage || "");
    if (placement !== "ANNOUNCEMENT_BAR" && !imageUrl) return NextResponse.json({ message: "Banner hình ảnh cần có ảnh desktop." }, { status: 400 });
    const primaryLabel = body.primaryCtaLabel === undefined ? current.primaryCtaLabel : body.primaryCtaLabel;
    const primaryUrl = body.primaryCtaUrl === undefined ? current.primaryCtaUrl : body.primaryCtaUrl;
    const secondaryLabel = body.secondaryCtaLabel === undefined ? current.secondaryCtaLabel : body.secondaryCtaLabel;
    const secondaryUrl = body.secondaryCtaUrl === undefined ? current.secondaryCtaUrl : body.secondaryCtaUrl;
    for (const [label, url] of [[primaryLabel, primaryUrl], [secondaryLabel, secondaryUrl]]) {
      if (Boolean(label) !== Boolean(url) || (url && !isSafeUrl(String(url)))) return NextResponse.json({ message: "CTA cần có đủ nhãn, URL hợp lệ và không chứa giao thức không an toàn." }, { status: 400 });
    }
    const userId = Number(request.headers.get("x-user-id")) || null;
    const banner = await prisma.homepageBanner.update({ where: { id }, data: {
      internalName: body.internalName === undefined ? current.internalName : String(body.internalName).trim(),
      title: body.title === undefined ? current.title : String(body.title).trim(), subtitle: body.subtitle === undefined ? current.subtitle : body.subtitle || null,
      eyebrow: body.eyebrow === undefined ? current.eyebrow : body.eyebrow || null, description: body.description === undefined ? current.description : body.description || null,
      imageUrl, desktopImage: body.desktopImage === undefined ? current.desktopImage : body.desktopImage || null, mobileImage: body.mobileImage === undefined ? current.mobileImage : body.mobileImage || null,
      imagePublicId: body.imagePublicId === undefined ? current.imagePublicId : body.imagePublicId || null, mobileImagePublicId: body.mobileImagePublicId === undefined ? current.mobileImagePublicId : body.mobileImagePublicId || null,
      imageAlt: body.imageAlt === undefined ? current.imageAlt : String(body.imageAlt), linkUrl: body.linkUrl === undefined ? current.linkUrl : body.linkUrl || null,
      primaryCtaLabel: body.primaryCtaLabel === undefined ? current.primaryCtaLabel : body.primaryCtaLabel || null, primaryCtaUrl: body.primaryCtaUrl === undefined ? current.primaryCtaUrl : body.primaryCtaUrl || null,
      secondaryCtaLabel: body.secondaryCtaLabel === undefined ? current.secondaryCtaLabel : body.secondaryCtaLabel || null, secondaryCtaUrl: body.secondaryCtaUrl === undefined ? current.secondaryCtaUrl : body.secondaryCtaUrl || null,
      textAlignment: body.textAlignment || current.textAlignment, textTheme: body.textTheme || current.textTheme,
      overlayOpacity: body.overlayOpacity === undefined ? current.overlayOpacity : Math.min(80, Math.max(0, Number(body.overlayOpacity) || 0)),
      placement, position: body.position === undefined ? current.position : Math.max(0, Number(body.position) || 0), isActive: body.isActive === undefined ? current.isActive : Boolean(body.isActive), startsAt, endsAt, updatedById: userId,
    }});
    return NextResponse.json({ banner });
  } catch (error) { console.error("Update banner failed", error); return NextResponse.json({ message: "Không thể cập nhật banner." }, { status: 500 }); }
}

export async function DELETE(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const id = getId((await context.params).id);
  const banner = await prisma.homepageBanner.findUnique({ where: { id } });
  if (!banner) return NextResponse.json({ message: "Không tìm thấy banner." }, { status: 404 });
  await prisma.homepageBanner.update({ where: { id }, data: { isActive: false } });
  return NextResponse.json({ success: true });
}
