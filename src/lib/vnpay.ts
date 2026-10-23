import crypto from "node:crypto";

export type VnpayConfig = {
  tmnCode: string;
  hashSecret: string;
  paymentUrl: string;
  returnUrl: string;
  version: string;
  command: string;
  orderType: string;
  locale: string;
};

export function getVnpayConfig(origin?: string): VnpayConfig | null {
  const tmnCode = process.env.VNPAY_TMN_CODE?.trim();
  const hashSecret = process.env.VNPAY_HASH_SECRET?.trim();
  if (!tmnCode || !hashSecret) return null;

  const returnUrl =
    process.env.VNPAY_RETURN_URL?.trim() ||
    `${(origin || process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "")}/api/payments/vnpay/return`;
  if (!returnUrl.startsWith("http")) return null;

  return {
    tmnCode,
    hashSecret,
    paymentUrl:
      process.env.VNPAY_PAYMENT_URL?.trim() ||
      "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
    returnUrl,
    version: "2.1.0",
    command: "pay",
    orderType: "other",
    locale: "vn",
  };
}

const encode = (value: string) => encodeURIComponent(value).replace(/%20/g, "+");

export function sortParams(params: Record<string, string>) {
  return Object.keys(params)
    .sort()
    .map((key) => `${encode(key)}=${encode(params[key])}`)
    .join("&");
}

export function signVnpay(query: string, secret: string) {
  return crypto.createHmac("sha512", secret).update(query).digest("hex");
}

export function buildVnpayPaymentUrl({
  config,
  orderNumber,
  amount,
  ipAddress,
}: {
  config: VnpayConfig;
  orderNumber: string;
  amount: number;
  ipAddress?: string;
}) {
  const now = new Date();
  const createDate = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
    .format(now)
    .replace(/[/, :]/g, "");
  const params: Record<string, string> = {
    vnp_Version: config.version,
    vnp_Command: config.command,
    vnp_TmnCode: config.tmnCode,
    vnp_Amount: String(Math.round(amount) * 100),
    vnp_CurrCode: "VND",
    vnp_TxnRef: orderNumber,
    vnp_OrderInfo: `Thanh toan don hang ${orderNumber}`,
    vnp_OrderType: config.orderType,
    vnp_Locale: config.locale,
    vnp_ReturnUrl: config.returnUrl,
    vnp_IpAddr: ipAddress || "127.0.0.1",
    vnp_CreateDate: createDate,
  };
  const query = sortParams(params);
  return `${config.paymentUrl}?${query}&vnp_SecureHash=${signVnpay(query, config.hashSecret)}`;
}

export function verifyVnpayResponse(
  params: URLSearchParams,
  secret: string,
) {
  const received = params.get("vnp_SecureHash") || "";
  const values: Record<string, string> = {};
  for (const [key, value] of params.entries()) {
    if (key.startsWith("vnp_") && key !== "vnp_SecureHash" && key !== "vnp_SecureHashType") values[key] = value;
  }
  const expected = signVnpay(sortParams(values), secret);
  return received.length === expected.length && crypto.timingSafeEqual(Buffer.from(received.toLowerCase()), Buffer.from(expected.toLowerCase()));
}
