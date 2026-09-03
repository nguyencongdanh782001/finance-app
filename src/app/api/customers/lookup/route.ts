import { getAdminFromRequest } from "@/lib/orders/daily-orders";
import prisma from "@/lib/db";
import { normalizeVietnamesePhone } from "@/lib/auth/validation";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    getAdminFromRequest(request);
    const phone = normalizeVietnamesePhone(
      new URL(request.url).searchParams.get("phone")?.trim() || "",
    );

    if (!phone) {
      return NextResponse.json(
        { message: "Vui lòng nhập số điện thoại." },
        { status: 400 },
      );
    }

    const customer = await prisma.user.findUnique({
      where: { phone },
      select: {
        id: true,
        phone: true,
        displayName: true,
        email: true,
        status: true,
        membership: {
          select: {
            id: true,
            name: true,
            code: true,
            color: true,
            discountRate: true,
            isActive: true,
          },
        },
      },
    });

    if (!customer || customer.status !== "ACTIVE") {
      return NextResponse.json(
        {
          message:
            "Không tìm thấy khách hàng đang hoạt động với số điện thoại này.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      ...customer,
      membership: customer.membership
        ? {
            ...customer.membership,
            discountRate: Number(customer.membership.discountRate),
          }
        : null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Không thể tìm khách hàng.",
      },
      { status: 400 },
    );
  }
}
