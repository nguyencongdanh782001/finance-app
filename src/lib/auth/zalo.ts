import { OTP_EXPIRES_IN_MINUTES } from "./constants";

type SendZaloOtpResult = {
  sent: boolean;
  skipped: boolean;
  error?: string;
};

const normalizeVietnamPhone = (phone: string) => {
  const digits = phone.replace(/\D/g, "");

  if (digits.startsWith("84")) {
    return digits;
  }

  if (digits.startsWith("0")) {
    return `84${digits.slice(1)}`;
  }

  return digits;
};

export async function sendZaloOtp(
  phone: string,
  code: string,
): Promise<SendZaloOtpResult> {
  const accessToken = process.env.ZALO_ACCESS_TOKEN;
  const templateId = process.env.ZALO_OTP_TEMPLATE_ID;

  if (!accessToken || !templateId) {
    return { sent: false, skipped: true };
  }

  const endpoint =
    process.env.ZALO_ZNS_ENDPOINT ||
    "https://business.openapi.zalo.me/message/template";
  const codeField = process.env.ZALO_OTP_CODE_FIELD || "otp";
  const phoneField = process.env.ZALO_PHONE_FIELD || "phone";
  const templateData = {
    [codeField]: code,
    ...(process.env.ZALO_OTP_TTL_FIELD
      ? { [process.env.ZALO_OTP_TTL_FIELD]: `${OTP_EXPIRES_IN_MINUTES} phut` }
      : {}),
  };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        access_token: accessToken,
      },
      body: JSON.stringify({
        [phoneField]: normalizeVietnamPhone(phone),
        template_id: templateId,
        template_data: templateData,
        tracking_id: `otp_${Date.now()}`,
      }),
    });
    const data = (await response.json().catch(() => null)) as
      | { error?: number; message?: string }
      | null;

    if (!response.ok || (data?.error && data.error !== 0)) {
      return {
        sent: false,
        skipped: false,
        error: data?.message || `Zalo request failed with ${response.status}`,
      };
    }

    return { sent: true, skipped: false };
  } catch (error) {
    return {
      sent: false,
      skipped: false,
      error: error instanceof Error ? error.message : "Unable to send Zalo OTP",
    };
  }
}
