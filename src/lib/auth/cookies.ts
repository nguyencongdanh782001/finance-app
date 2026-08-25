import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_EXPIRES_IN_SECONDS,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_EXPIRES_IN_SECONDS,
} from "./constants";

export function getAuthCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export function setAuthCookies(
  response: Response & {
    cookies: {
      set: (name: string, value: string, options: ReturnType<typeof getAuthCookieOptions>) => void;
    };
  },
  accessToken: string,
  refreshToken: string,
) {
  response.cookies.set(
    ACCESS_TOKEN_COOKIE,
    accessToken,
    getAuthCookieOptions(ACCESS_TOKEN_EXPIRES_IN_SECONDS),
  );
  response.cookies.set(
    REFRESH_TOKEN_COOKIE,
    refreshToken,
    getAuthCookieOptions(REFRESH_TOKEN_EXPIRES_IN_SECONDS),
  );
}

export function clearAuthCookies(
  response: Response & {
    cookies: {
      set: (name: string, value: string, options: ReturnType<typeof getAuthCookieOptions>) => void;
    };
  },
) {
  response.cookies.set(ACCESS_TOKEN_COOKIE, "", getAuthCookieOptions(0));
  response.cookies.set(REFRESH_TOKEN_COOKIE, "", getAuthCookieOptions(0));
}
