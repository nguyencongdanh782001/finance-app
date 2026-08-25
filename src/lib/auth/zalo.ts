import { OTP_EXPIRES_IN_MINUTES } from "./constants";

type SendZaloOtpResult = {
  sent: boolean;
  skipped: boolean;
  error?: string;
};

type ZaloApiResponse = {
  error?: number;
  message?: string;
};

type ZaloTokenResponse = ZaloApiResponse & {
  access_token?: string;
  refresh_token?: string;
};

let cachedAccessToken = process.env.ZALO_ACCESS_TOKEN || "";
let cachedRefreshToken = process.env.ZALO_REFRESH_TOKEN || "";

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

const shouldRefreshToken = (
  response: Response,
  data: ZaloApiResponse | null,
) => {
  return response.status === 401 || data?.error === -216;
};

async function refreshZaloAccessToken() {
  const appId = process.env.ZALO_APP_ID;
  const appSecret = process.env.ZALO_APP_SECRET;
  const tokenEndpoint =
    process.env.ZALO_OA_TOKEN_ENDPOINT ||
    "https://oauth.zaloapp.com/v4/oa/access_token";
  const refreshToken = cachedRefreshToken || process.env.ZALO_REFRESH_TOKEN;

  if (!appId || !appSecret || !refreshToken) {
    return null;
  }

  const response = await fetch(tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      secret_key: appSecret,
    },
    body: new URLSearchParams({
      app_id: appId,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });
  const data = (await response
    .json()
    .catch(() => null)) as ZaloTokenResponse | null;

  if (
    !response.ok ||
    (data?.error && data.error !== 0) ||
    !data?.access_token
  ) {
    return null;
  }

  cachedAccessToken = data.access_token;

  if (data.refresh_token) {
    cachedRefreshToken = data.refresh_token;
  }

  return cachedAccessToken;
}

async function requestZaloOtp({
  endpoint,
  accessToken,
  phoneField,
  phone,
  templateId,
  templateData,
}: {
  endpoint: string;
  accessToken: string;
  phoneField: string;
  phone: string;
  templateId: string;
  templateData: Record<string, string>;
}) {
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
  const data = (await response
    .json()
    .catch(() => null)) as ZaloApiResponse | null;

  return { response, data };
}

export async function sendZaloOtp(
  phone: string,
  code: string,
): Promise<SendZaloOtpResult> {
  const accessToken = cachedAccessToken || process.env.ZALO_ACCESS_TOKEN;
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
    let { response, data } = await requestZaloOtp({
      endpoint,
      accessToken,
      phoneField,
      phone,
      templateId,
      templateData,
    });
    console.log(data);
    if (shouldRefreshToken(response, data)) {
      const refreshedAccessToken = await refreshZaloAccessToken();

      if (refreshedAccessToken) {
        ({ response, data } = await requestZaloOtp({
          endpoint,
          accessToken: refreshedAccessToken,
          phoneField,
          phone,
          templateId,
          templateData,
        }));
      }
    }

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
