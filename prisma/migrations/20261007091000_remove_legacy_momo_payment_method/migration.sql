-- Historical MoMo values are normalized to bank transfer before removing the
-- legacy enum value from the database. VietQR uses BANK_TRANSFER internally.
UPDATE "order" SET "paymentMethod" = 'BANK_TRANSFER' WHERE "paymentMethod"::text = 'MOMO';
UPDATE "order_invoice" SET "paymentMethodSnapshot" = 'BANK_TRANSFER' WHERE "paymentMethodSnapshot"::text = 'MOMO';
UPDATE "payment" SET "method" = 'BANK_TRANSFER' WHERE "method"::text = 'MOMO';

CREATE TYPE "PaymentMethod_new" AS ENUM ('CASH', 'COD', 'CARD', 'BANK_TRANSFER', 'ZALOPAY', 'PAYPAL', 'STRIPE');

ALTER TABLE "order"
  ALTER COLUMN "paymentMethod" TYPE "PaymentMethod_new"
  USING ("paymentMethod"::text::"PaymentMethod_new");
ALTER TABLE "order_invoice"
  ALTER COLUMN "paymentMethodSnapshot" TYPE "PaymentMethod_new"
  USING ("paymentMethodSnapshot"::text::"PaymentMethod_new");
ALTER TABLE "payment"
  ALTER COLUMN "method" TYPE "PaymentMethod_new"
  USING ("method"::text::"PaymentMethod_new");

DROP TYPE "PaymentMethod";
ALTER TYPE "PaymentMethod_new" RENAME TO "PaymentMethod";
