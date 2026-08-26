import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { REFRESH_TOKEN_COOKIE } from "@/lib/auth/constants";
import { clearAuthCookies, setAuthCookies } from "@/lib/auth/cookies";
import { hashValue } from "@/lib/auth/crypto";
import { rotateSessionRefreshToken } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    refreshToken?: string;
  };
  const refreshToken =
    body.refreshToken || req.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!refreshToken) {
    return NextResponse.json(
      { message: "Missing refresh token" },
      { status: 401 },
    );
  }

  const session = await prisma.userSession.findUnique({
    where: { tokenHash: await hashValue(decodeURIComponent(refreshToken)) },
    include: { user: true },
  });

  if (
    !session ||
    session.revokedAt ||
    !session.refreshTokenExpiresAt ||
    session.refreshTokenExpiresAt < new Date() ||
    session.user.status !== "ACTIVE"
  ) {
    const response = NextResponse.json(
      { message: "Refresh token is invalid or expired" },
      { status: 401 },
    );
    clearAuthCookies(response);

    return response;
  }

  const tokens = await rotateSessionRefreshToken(session.id, {
    id: session.user.id,
    phone: session.user.phone,
    email: session.user.email,
    role: session.user.role,
  });
  const response = NextResponse.json({
    accessToken: tokens.accessToken,
    user: {
      id: session.user.id,
      phone: session.user.phone,
      email: session.user.email,
      role: session.user.role,
      displayName: session.user.displayName,
      authProvider: session.user.authProvider,
    },
  });

  setAuthCookies(response, tokens.accessToken, tokens.refreshToken);

  return response;
}
