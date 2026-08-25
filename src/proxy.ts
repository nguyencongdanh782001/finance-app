import { NextRequest, NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE, ADMIN_ROLES } from "@/lib/auth/constants";
import { verifyJwt } from "@/lib/auth/crypto";

const AUTH_PATH_PREFIX = "/api/auth";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/api") || pathname.startsWith(AUTH_PATH_PREFIX)) {
    return NextResponse.next();
  }

  const bearerToken = req.headers
    .get("authorization")
    ?.replace(/^Bearer\s+/i, "");
  const cookieToken = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const token = bearerToken || cookieToken;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const payload = await verifyJwt(token).catch(() => null);

  if (!payload) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!ADMIN_ROLES.includes(payload.role as (typeof ADMIN_ROLES)[number])) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-user-id", payload.sub);
  requestHeaders.set("x-user-role", payload.role);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/api/:path*"],
};
