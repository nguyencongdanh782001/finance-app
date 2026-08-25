export const ACCESS_TOKEN_COOKIE = "access_token";
export const REFRESH_TOKEN_COOKIE = "refresh_token";

export const ACCESS_TOKEN_EXPIRES_IN_SECONDS = 3 * 24 * 60 * 60;
export const REFRESH_TOKEN_EXPIRES_IN_SECONDS = 30 * 24 * 60 * 60;
export const OTP_EXPIRES_IN_MINUTES = 2;
export const MAX_OTP_ATTEMPTS = 5;

export const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN"] as const;

export const isDevOtpEnabled = () => {
  return (
    process.env.AUTH_DEV_OTP_ENABLED === "true" ||
    process.env.NEXT_PUBLIC_NODE_ENV === "local" ||
    process.env.NODE_ENV !== "production"
  );
};
