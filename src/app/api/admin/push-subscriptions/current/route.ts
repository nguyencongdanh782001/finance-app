import prisma from "@/lib/db";
import { getAdminIdentity } from "@/lib/admin-notification-api";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({ endpoint: z.string().url().max(2048) });

export async function DELETE(request: Request) {
  const identity = getAdminIdentity(request);
  if (identity instanceof NextResponse) return identity;

  const body = bodySchema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json(
      { message: "Push subscription không hợp lệ." },
      { status: 400 },
    );
  }

  await prisma.pushSubscription.deleteMany({
    where: { userId: identity.userId, endpoint: body.data.endpoint },
  });
  return NextResponse.json({ success: true });
}
