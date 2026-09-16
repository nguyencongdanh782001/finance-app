import prisma from "@/lib/db";
import { getAdminIdentity } from "@/lib/admin-notification-api";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const identity = getAdminIdentity(request);
  if (identity instanceof NextResponse) return identity;
  const id = (await context.params).id;
  const result = await prisma.pushSubscription.deleteMany({
    where: { id, userId: identity.userId },
  });
  if (!result.count)
    return NextResponse.json(
      { message: "Không tìm thấy thiết bị." },
      { status: 404 },
    );
  return NextResponse.json({ success: true });
}
