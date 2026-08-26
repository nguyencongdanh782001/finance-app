import prisma from "@/lib/db";
import {
  ACCESS_TOKEN_EXPIRES_IN_SECONDS,
  REFRESH_TOKEN_EXPIRES_IN_SECONDS,
} from "./constants";
import { generateOpaqueToken, hashValue, signJwt } from "./crypto";

type SessionUser = {
  id: number;
  phone?: string | null;
  email?: string | null;
  role: string;
};

export async function createSession(user: SessionUser, request: Request) {
  const refreshToken = generateOpaqueToken();
  const now = Date.now();
  const expiresAt = new Date(now + ACCESS_TOKEN_EXPIRES_IN_SECONDS * 1000);
  const refreshTokenExpiresAt = new Date(
    now + REFRESH_TOKEN_EXPIRES_IN_SECONDS * 1000,
  );

  const session = await prisma.userSession.create({
    data: {
      userId: user.id,
      tokenHash: await hashValue(refreshToken),
      expiresAt,
      refreshTokenExpiresAt,
      userAgent: request.headers.get("user-agent"),
      ipAddress:
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        request.headers.get("x-real-ip"),
    },
  });
  const accessToken = await signJwt(
    {
      sub: user.id.toString(),
      phone: user.phone,
      email: user.email,
      role: user.role,
      sessionId: session.id.toString(),
    },
    ACCESS_TOKEN_EXPIRES_IN_SECONDS,
  );

  return { accessToken, refreshToken, session };
}

export async function rotateSessionRefreshToken(
  sessionId: number,
  user: SessionUser,
) {
  const refreshToken = generateOpaqueToken();
  const now = Date.now();
  const expiresAt = new Date(now + ACCESS_TOKEN_EXPIRES_IN_SECONDS * 1000);
  const refreshTokenExpiresAt = new Date(
    now + REFRESH_TOKEN_EXPIRES_IN_SECONDS * 1000,
  );

  await prisma.userSession.update({
    where: { id: sessionId },
    data: {
      tokenHash: await hashValue(refreshToken),
      expiresAt,
      refreshTokenExpiresAt,
    },
  });

  const accessToken = await signJwt(
    {
      sub: user.id.toString(),
      phone: user.phone,
      email: user.email,
      role: user.role,
      sessionId: sessionId.toString(),
    },
    ACCESS_TOKEN_EXPIRES_IN_SECONDS,
  );

  return { accessToken, refreshToken };
}
