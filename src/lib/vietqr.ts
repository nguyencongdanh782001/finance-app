import prisma from "@/lib/db";

export type VietQrConfig = {
  bankCode: string;
  accountNumber: string;
  accountName: string;
  template: string;
};

const fromEnv = (): VietQrConfig | null => {
  const bankCode = process.env.VIETQR_BANK_BIN?.trim();
  const accountNumber = process.env.VIETQR_ACCOUNT_NUMBER?.trim();
  if (!bankCode || !accountNumber) return null;
  return {
    bankCode,
    accountNumber,
    accountName: process.env.VIETQR_ACCOUNT_NAME?.trim() || "",
    template: process.env.VIETQR_TEMPLATE?.trim() || "compact2",
  };
};

export async function getVietQrConfig() {
  const settings = await prisma.storeSetting.findUnique({
    where: { id: 1 },
    select: {
      onlinePaymentEnabled: true,
      vietQrBankCode: true,
      vietQrAccountNumber: true,
      vietQrAccountName: true,
    },
  });
  const config =
    settings?.vietQrBankCode && settings.vietQrAccountNumber
      ? {
          bankCode: settings.vietQrBankCode,
          accountNumber: settings.vietQrAccountNumber,
          accountName: settings.vietQrAccountName || "",
          template: process.env.VIETQR_TEMPLATE?.trim() || "compact2",
        }
      : fromEnv();

  const hasDatabaseConfig = Boolean(
    settings?.vietQrBankCode && settings.vietQrAccountNumber,
  );
  return {
    enabled: Boolean(config && (hasDatabaseConfig ? settings?.onlinePaymentEnabled : true)),
    config,
  };
}

export function buildVietQrUrl(
  config: VietQrConfig,
  amount: number,
  orderNumber: string,
) {
  const params = new URLSearchParams({
    amount: String(Math.max(0, Math.round(amount))),
    addInfo: `THANH TOAN DON HANG ${orderNumber}`,
    accountName: config.accountName,
  });
  return `https://img.vietqr.io/image/${encodeURIComponent(config.bankCode)}-${encodeURIComponent(config.accountNumber)}-${encodeURIComponent(config.template)}.png?${params.toString()}`;
}
