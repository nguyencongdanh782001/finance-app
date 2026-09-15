import { ADMIN_ROLES } from "@/lib/auth/constants";

type RouteUser = { role?: string | null } | null | undefined;

export const isAdminRole = (role?: string | null) => {
  return ADMIN_ROLES.includes(role as (typeof ADMIN_ROLES)[number]);
};

export const getDefaultRouteByRole = (role?: string | null) => {
  return isAdminRole(role) ? "/admin" : "/";
};

export const getSafeReturnPath = (returnPath: string | null) => {
  if (
    !returnPath ||
    !returnPath.startsWith("/") ||
    returnPath.startsWith("//") ||
    returnPath.startsWith("/login") ||
    returnPath.startsWith("/register")
  ) {
    return "/";
  }

  return returnPath;
};

export const buildLoginUrl = (currentUrl: string) =>
  `/login?callbackUrl=${encodeURIComponent(getSafeReturnPath(currentUrl) || "/")}`;

export const getRouteAfterAuth = (user: RouteUser, returnPath: string) => {
  if (isAdminRole(user?.role)) {
    return "/admin";
  }

  if (returnPath.startsWith("/admin")) {
    return "/";
  }

  return returnPath;
};
