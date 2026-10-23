import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const settings = await prisma.storeSetting.findUnique({ where: { id: 1 }, select: { onlinePaymentEnabled: true } });
  return NextResponse.json(
    {
      onlinePaymentEnabled: settings?.onlinePaymentEnabled === true,
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, max-age=0, must-revalidate",
        "CDN-Cache-Control": "no-store",
        "Vercel-CDN-Cache-Control": "no-store",
      },
    },
  );
}
