export const VIETNAM_PHONE_REGEX = /^(0|\+84)(3|5|7|8|9)\d{8}$/;
export const MIN_PASSWORD_LENGTH = 8;

export function normalizeVietnamesePhone(value: string) {
  const normalized = value.replace(/\s/g, "").replace(/[^\d+]/g, "");

  if (normalized.startsWith("+84")) {
    return `0${normalized.slice(3)}`;
  }

  if (normalized.startsWith("84")) {
    return `0${normalized.slice(2)}`;
  }

  return normalized;
}

export function isValidVietnamesePhone(value: string) {
  return VIETNAM_PHONE_REGEX.test(value);
}

export function isValidPassword(value: string) {
  return value.length >= MIN_PASSWORD_LENGTH;
}
