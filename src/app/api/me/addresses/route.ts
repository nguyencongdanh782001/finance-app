import prisma from "@/lib/db";
import { NextResponse } from "next/server";

const userIdOf = (request: Request) => Number(request.headers.get("x-user-id"));
const fields = { id: true, fullName: true, phone: true, province: true, city: true, district: true, ward: true, line1: true, line2: true, postalCode: true, latitude: true, longitude: true, type: true, isDefaultShipping: true } as const;

export async function GET(request: Request) { const userId = userIdOf(request); if (!userId) return NextResponse.json({ message: "Phiên đăng nhập không hợp lệ." }, { status: 401 }); return NextResponse.json(await prisma.userAddress.findMany({ where: { userId }, orderBy: [{ isDefaultShipping: "desc" }, { updatedAt: "desc" }], select: fields })); }

export async function POST(request: Request) {
  const userId = userIdOf(request); if (!userId) return NextResponse.json({ message: "Phiên đăng nhập không hợp lệ." }, { status: 401 });
  try { const b = await request.json(); const data = { userId, fullName: String(b.fullName || "").trim(), phone: String(b.phone || "").trim(), province: String(b.province || "").trim() || null, city: String(b.city || "").trim(), district: String(b.district || "").trim() || null, ward: String(b.ward || "").trim() || null, line1: String(b.line1 || "").trim(), line2: String(b.line2 || "").trim() || null, postalCode: String(b.postalCode || "").trim() || null, latitude: Number.isFinite(Number(b.latitude)) ? Number(b.latitude) : null, longitude: Number.isFinite(Number(b.longitude)) ? Number(b.longitude) : null, type: "SHIPPING" as const, isDefaultShipping: Boolean(b.isDefaultShipping) };
    if (!data.fullName || !/^0\d{9,10}$/.test(data.phone) || !data.city || !data.line1) return NextResponse.json({ message: "Vui lòng kiểm tra thông tin địa chỉ và số điện thoại." }, { status: 422 });
    const address = await prisma.$transaction(async (tx) => { const count = await tx.userAddress.count({ where: { userId } }); if (count === 0) data.isDefaultShipping = true; if (data.isDefaultShipping) await tx.userAddress.updateMany({ where: { userId }, data: { isDefaultShipping: false } }); return tx.userAddress.create({ data, select: fields }); });
    return NextResponse.json(address, { status: 201 });
  } catch { return NextResponse.json({ message: "Không thể lưu địa chỉ lúc này." }, { status: 400 }); }
}
