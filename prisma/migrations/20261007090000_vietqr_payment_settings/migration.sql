ALTER TABLE "store_setting"
ADD COLUMN "onlinePaymentEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "vietQrBankCode" TEXT,
ADD COLUMN "vietQrAccountNumber" TEXT,
ADD COLUMN "vietQrAccountName" TEXT;
