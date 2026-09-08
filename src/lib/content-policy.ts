import { sanitizeRichTextHtml } from "@/lib/rich-text";

export const POLICY_TYPES = [
  "PURCHASE_GUIDE",
  "SHIPPING",
  "RETURN_REFUND",
  "PRIVACY",
  "TERMS",
  "PAYMENT",
  "OTHER",
] as const;

export const BANNER_PLACEMENTS = [
  "ANNOUNCEMENT_BAR",
  "HOME_HERO",
  "HOME_CAMPAIGN",
  "HOME_CATEGORY",
  "PRODUCT_LISTING",
] as const;

export const isSafeUrl = (value: string) => {
  if (!value) return true;
  if (value.startsWith("/")) return !value.startsWith("//");
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
};

export const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100) || "chinh-sach";

export const sanitizePolicyHtml = (value: string) =>
  sanitizeRichTextHtml(value);

export const policyTypeLabels: Record<(typeof POLICY_TYPES)[number], string> = {
  PURCHASE_GUIDE: "Hướng dẫn mua hàng",
  SHIPPING: "Chính sách vận chuyển",
  RETURN_REFUND: "Đổi trả và hoàn tiền",
  PRIVACY: "Chính sách bảo mật",
  TERMS: "Điều khoản sử dụng",
  PAYMENT: "Chính sách thanh toán",
  OTHER: "Khác",
};

export const bannerPlacementLabels: Record<
  (typeof BANNER_PLACEMENTS)[number],
  string
> = {
  ANNOUNCEMENT_BAR: "Thanh thông báo",
  HOME_HERO: "Hero trang chủ",
  HOME_CAMPAIGN: "Chiến dịch trang chủ",
  HOME_CATEGORY: "Banner danh mục",
  PRODUCT_LISTING: "Danh sách sản phẩm",
};
