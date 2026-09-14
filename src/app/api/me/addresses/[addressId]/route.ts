import prisma from "@/lib/db";
import { NextResponse } from "next/server";
const fields = {
  id: true,
  fullName: true,
  phone: true,
  province: true,
  city: true,
  district: true,
  ward: true,
  line1: true,
  line2: true,
  postalCode: true,
  latitude: true,
  longitude: true,
  type: true,
  isDefaultShipping: true,
} as const;
export async function PATCH(
  request: Request,
  context: { params: Promise<{ addressId: string }> },
) {
  const userId = Number(request.headers.get("x-user-id"));
  const id = Number((await context.params).addressId);
  if (!userId || !id)
    return NextResponse.json({ message: "Không hợp lệ." }, { status: 400 });
  const exists = await prisma.userAddress.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  if (!exists)
    return NextResponse.json(
      { message: "Không tìm thấy địa chỉ." },
      { status: 404 },
    );
  try {
    const b = await request.json();
    const data = {
      fullName: String(b.fullName || "").trim(),
      phone: String(b.phone || "").trim(),
      province: String(b.province || "").trim() || null,
      city: String(b.city || "").trim(),
      district: String(b.district || "").trim() || null,
      ward: String(b.ward || "").trim() || null,
      line1: String(b.line1 || "").trim(),
      line2: String(b.line2 || "").trim() || null,
      postalCode: String(b.postalCode || "").trim() || null,
      latitude: Number.isFinite(Number(b.latitude)) ? Number(b.latitude) : null,
      longitude: Number.isFinite(Number(b.longitude))
        ? Number(b.longitude)
        : null,
      isDefaultShipping: Boolean(b.isDefaultShipping),
    };
    const result = await prisma.$transaction(async (tx) => {
      const count = await tx.userAddress.count({ where: { userId } });
      if (count === 1) data.isDefaultShipping = true;
      if (data.isDefaultShipping)
        await tx.userAddress.updateMany({
          where: { userId },
          data: { isDefaultShipping: false },
        });
      return tx.userAddress.update({ where: { id }, data, select: fields });
    });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { message: "Không thể cập nhật địa chỉ." },
      { status: 400 },
    );
  }
}
export async function DELETE(
  request: Request,
  context: { params: Promise<{ addressId: string }> },
) {
  const userId = Number(request.headers.get("x-user-id"));
  const id = Number((await context.params).addressId);
  const address = await prisma.userAddress.findFirst({
    where: { id, userId },
    select: { id: true, isDefaultShipping: true },
  });
  if (!address)
    return NextResponse.json(
      { message: "Không tìm thấy địa chỉ." },
      { status: 404 },
    );
  const count = await prisma.userAddress.count({ where: { userId } });
  if (count <= 1)
    return NextResponse.json(
      { message: "Địa chỉ duy nhất không thể xóa." },
      { status: 409 },
    );
  await prisma.$transaction(async (tx) => {
    await tx.userAddress.delete({ where: { id } });
    if (address.isDefaultShipping) {
      const next = await tx.userAddress.findFirst({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        select: { id: true },
      });
      if (next)
        await tx.userAddress.update({
          where: { id: next.id },
          data: { isDefaultShipping: true },
        });
    }
  });
  return NextResponse.json({ ok: true });
}
