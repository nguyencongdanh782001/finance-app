import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { REFRESH_TOKEN_COOKIE } from "@/lib/auth/constants";
import { clearAuthCookies } from "@/lib/auth/cookies";
import { hashValue } from "@/lib/auth/crypto";

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  if (refreshToken) {
    await prisma.userSession
      .update({
        where: {
          tokenHash: await hashValue(decodeURIComponent(refreshToken)),
        },
        data: {
          revokedAt: new Date(),
        },
      })
      .catch(() => null);
  }

  const response = NextResponse.json({ success: true });
  clearAuthCookies(response);

  return response;
}
