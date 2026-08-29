CREATE TYPE "CouponSource" AS ENUM ('MANUAL', 'BIRTHDAY');

ALTER TABLE "coupon" ADD COLUMN "source" "CouponSource" NOT NULL DEFAULT 'MANUAL';
ALTER TABLE "coupon" ADD COLUMN "recipientUserId" INTEGER;
ALTER TABLE "coupon" ADD COLUMN "birthdayYear" INTEGER;
ALTER TABLE "membership" ADD COLUMN "birthdayMaxDiscountAmount" DECIMAL(65,30);

CREATE INDEX "coupon_source_birthdayYear_idx" ON "coupon"("source", "birthdayYear");
CREATE UNIQUE INDEX "coupon_recipientUserId_birthdayYear_key" ON "coupon"("recipientUserId", "birthdayYear");
ALTER TABLE "coupon" ADD CONSTRAINT "coupon_recipientUserId_fkey" FOREIGN KEY ("recipientUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
