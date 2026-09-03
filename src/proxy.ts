import { NextRequest, NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE, ADMIN_ROLES } from "@/lib/auth/constants";
import { verifyJwt } from "@/lib/auth/crypto";

const AUTH_PATH_PREFIX = "/api/auth";

const allowedOrigins = () => {
  if (
    process.env.NODE_ENV === "production" ||
    process.env.NEXT_PUBLIC_NODE_ENV === "production"
  ) {
    return ["https://quynhnhistore.com"];
  }

  return (
    process.env.CORS_ALLOWED_ORIGINS ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    ""
  )
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean);
};

const withCors = (response: NextResponse, request: NextRequest) => {
  const origin = request.headers.get("origin")?.replace(/\/$/, "");
  if (origin && allowedOrigins().includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Vary", "Origin");
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With",
    );
    response.headers.set("Access-Control-Max-Age", "86400");
  }
  return response;
};

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  if (req.method === "OPTIONS") {
    return withCors(new NextResponse(null, { status: 204 }), req);
  }

  if (pathname.startsWith(AUTH_PATH_PREFIX)) {
    return withCors(NextResponse.next(), req);
  }

  const bearerToken = req.headers
    .get("authorization")
    ?.replace(/^Bearer\s+/i, "");
  const cookieToken = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const token = bearerToken || cookieToken;

  if (!token) {
    return withCors(
      NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
      req,
    );
  }

  const payload = await verifyJwt(token).catch(() => null);

  if (!payload) {
    return withCors(
      NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
      req,
    );
  }

  const isMembershipSelfApi = pathname === "/api/memberships/me";

  if (
    !isMembershipSelfApi &&
    !ADMIN_ROLES.includes(payload.role as (typeof ADMIN_ROLES)[number])
  ) {
    return withCors(
      NextResponse.json({ message: "Forbidden" }, { status: 403 }),
      req,
    );
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-user-id", payload.sub);
  requestHeaders.set("x-user-role", payload.role);

  return withCors(
    NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    }),
    req,
  );
}

export const config = {
  matcher: ["/api/:path*"],
};
