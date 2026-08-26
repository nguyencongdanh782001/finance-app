import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { setAuthCookies } from "@/lib/auth/cookies";
import { createSession } from "@/lib/auth/session";

type GoogleTokenInfo = {
  aud?: string;
  sub?: string;
  email?: string;
  email_verified?: string | boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  error_description?: string;
};

const normalizeEmail = (value: string) => value.trim().toLowerCase();

async function verifyGoogleCredential(credential: string) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!clientId) {
    throw new Error("Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID");
  }

  const response = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(
      credential,
    )}`,
    { cache: "no-store" },
  );
  const data = (await response
    .json()
    .catch(() => null)) as GoogleTokenInfo | null;

  if (
    !response.ok ||
    !data?.sub ||
    !data.email ||
    data.aud !== clientId ||
    data.email_verified === false ||
    data.email_verified === "false"
  ) {
    throw new Error(data?.error_description || "Google credential is invalid");
  }

  return {
    googleId: data.sub,
    email: normalizeEmail(data.email),
    displayName: data.name || data.email,
    firstName: data.given_name || null,
    lastName: data.family_name || null,
    avatarUrl: data.picture || null,
  };
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { credential?: string };

  if (!body.credential) {
    return NextResponse.json(
      { message: "Thiếu thông tin đăng nhập Google" },
      { status: 400 },
    );
  }

  let profile: Awaited<ReturnType<typeof verifyGoogleCredential>>;

  try {
    profile = await verifyGoogleCredential(body.credential);
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Không thể xác thực tài khoản Google",
      },
      { status: 401 },
    );
  }

  const existingByGoogleId = await prisma.user.findUnique({
    where: { googleId: profile.googleId },
  });
  const existingByEmail = existingByGoogleId
    ? null
    : await prisma.user.findUnique({ where: { email: profile.email } });

  if (existingByEmail?.authProvider === "WEB") {
    return NextResponse.json(
      { message: "Email này đang dùng tài khoản đăng nhập bằng mật khẩu" },
      { status: 409 },
    );
  }

  const now = new Date();
  const user = existingByGoogleId
    ? await prisma.user.update({
        where: { id: existingByGoogleId.id },
        data: {
          email: profile.email,
          displayName: profile.displayName,
          firstName: profile.firstName,
          lastName: profile.lastName,
          avatarUrl: profile.avatarUrl,
          emailVerifiedAt: existingByGoogleId.emailVerifiedAt || now,
          lastLoginAt: now,
        },
      })
    : existingByEmail
      ? await prisma.user.update({
          where: { id: existingByEmail.id },
          data: {
            googleId: profile.googleId,
            authProvider: "GOOGLE",
            displayName: existingByEmail.displayName || profile.displayName,
            firstName: existingByEmail.firstName || profile.firstName,
            lastName: existingByEmail.lastName || profile.lastName,
            avatarUrl: existingByEmail.avatarUrl || profile.avatarUrl,
            emailVerifiedAt: existingByEmail.emailVerifiedAt || now,
            lastLoginAt: now,
          },
        })
      : await prisma.user.create({
          data: {
            email: profile.email,
            googleId: profile.googleId,
            authProvider: "GOOGLE",
            role: "CUSTOMER",
            status: "ACTIVE",
            displayName: profile.displayName,
            firstName: profile.firstName,
            lastName: profile.lastName,
            avatarUrl: profile.avatarUrl,
            emailVerifiedAt: now,
            lastLoginAt: now,
          },
        });

  if (user.status !== "ACTIVE") {
    return NextResponse.json(
      { message: "Tài khoản chưa được kích hoạt" },
      { status: 403 },
    );
  }

  const session = await createSession(
    { id: user.id, phone: user.phone, email: user.email, role: user.role },
    req,
  );
  const response = NextResponse.json({
    accessToken: session.accessToken,
    user: {
      id: user.id,
      phone: user.phone,
      email: user.email,
      role: user.role,
      displayName: user.displayName,
      authProvider: user.authProvider,
    },
  });

  setAuthCookies(response, session.accessToken, session.refreshToken);

  return response;
}
