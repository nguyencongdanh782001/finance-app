CREATE TYPE "MembershipBenefitType" AS ENUM (
  'PERCENTAGE_ORDER_DISCOUNT',
  'FIXED_ORDER_DISCOUNT',
  'FREE_SHIPPING',
  'BIRTHDAY_VOUCHER',
  'EARLY_ACCESS',
  'EXCLUSIVE_PRODUCTS',
  'BONUS_POINTS',
  'CAMPAIGN_ACCESS',
  'FREE_GIFT',
  'CUSTOM_TEXT'
);

CREATE TYPE "MembershipResetStatus" AS ENUM ('RUNNING', 'COMPLETED', 'FAILED');

ALTER TABLE "membership" ADD COLUMN "code" TEXT;
ALTER TABLE "membership" ADD COLUMN "terms" TEXT;
UPDATE "membership" SET "code" = 'MEMBERSHIP-' || "id" WHERE "code" IS NULL;
ALTER TABLE "membership" ALTER COLUMN "code" SET NOT NULL;
CREATE UNIQUE INDEX "membership_code_key" ON "membership"("code");

CREATE TABLE "membership_history" (
  "id" SERIAL NOT NULL,
  "userId" INTEGER NOT NULL,
  "membershipId" INTEGER,
  "membershipNameSnapshot" TEXT NOT NULL,
  "minSpendAmountSnapshot" DECIMAL(65,30) NOT NULL DEFAULT 0,
  "discountRateSnapshot" DECIMAL(65,30) NOT NULL DEFAULT 0,
  "cycleYear" INTEGER NOT NULL,
  "spending" DECIMAL(65,30) NOT NULL DEFAULT 0,
  "rankStartDate" TIMESTAMP(3) NOT NULL,
  "rankEndDate" TIMESTAMP(3) NOT NULL,
  "reason" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "membership_history_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "membership_history_userId_cycleYear_key" ON "membership_history"("userId", "cycleYear");
CREATE INDEX "membership_history_cycleYear_idx" ON "membership_history"("cycleYear");
CREATE INDEX "membership_history_membershipId_cycleYear_idx" ON "membership_history"("membershipId", "cycleYear");

CREATE TABLE "membership_benefit" (
  "id" SERIAL NOT NULL,
  "name" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "description" TEXT,
  "type" "MembershipBenefitType" NOT NULL,
  "icon" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "position" INTEGER NOT NULL DEFAULT 0,
  "startsAt" TIMESTAMP(3),
  "endsAt" TIMESTAMP(3),
  "usageLimit" INTEGER,
  "usedCount" INTEGER NOT NULL DEFAULT 0,
  "usageLimitPerUser" INTEGER,
  "automatic" BOOLEAN NOT NULL DEFAULT true,
  "requiresRedemption" BOOLEAN NOT NULL DEFAULT false,
  "minOrderValue" DECIMAL(65,30),
  "maxDiscountAmount" DECIMAL(65,30),
  "salesChannels" JSONB,
  "canCombineWithCoupons" BOOLEAN NOT NULL DEFAULT false,
  "canCombineWithBenefits" BOOLEAN NOT NULL DEFAULT false,
  "priority" INTEGER NOT NULL DEFAULT 0,
  "internalNotes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "membership_benefit_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "membership_benefit_code_key" ON "membership_benefit"("code");
CREATE INDEX "membership_benefit_isActive_startsAt_endsAt_idx" ON "membership_benefit"("isActive", "startsAt", "endsAt");
CREATE INDEX "membership_benefit_type_idx" ON "membership_benefit"("type");
CREATE INDEX "membership_benefit_position_idx" ON "membership_benefit"("position");

CREATE TABLE "membership_benefit_tier" (
  "id" SERIAL NOT NULL,
  "benefitId" INTEGER NOT NULL,
  "membershipId" INTEGER NOT NULL,
  "value" DECIMAL(65,30),
  "config" JSONB,
  CONSTRAINT "membership_benefit_tier_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "membership_benefit_tier_benefitId_membershipId_key" ON "membership_benefit_tier"("benefitId", "membershipId");
CREATE INDEX "membership_benefit_tier_membershipId_idx" ON "membership_benefit_tier"("membershipId");

CREATE TABLE "membership_benefit_redemption" (
  "id" SERIAL NOT NULL,
  "benefitId" INTEGER NOT NULL,
  "userId" INTEGER NOT NULL,
  "orderId" INTEGER,
  "cycleYear" INTEGER NOT NULL,
  "valueSnapshot" DECIMAL(65,30),
  "nameSnapshot" TEXT NOT NULL,
  "typeSnapshot" "MembershipBenefitType" NOT NULL,
  "amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
  "redeemedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "membership_benefit_redemption_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "membership_benefit_redemption_benefitId_userId_orderId_key" ON "membership_benefit_redemption"("benefitId", "userId", "orderId");
CREATE INDEX "membership_benefit_redemption_userId_cycleYear_idx" ON "membership_benefit_redemption"("userId", "cycleYear");
CREATE INDEX "membership_benefit_redemption_benefitId_redeemedAt_idx" ON "membership_benefit_redemption"("benefitId", "redeemedAt");

CREATE TABLE "membership_reset_run" (
  "id" SERIAL NOT NULL,
  "cycleYear" INTEGER NOT NULL,
  "status" "MembershipResetStatus" NOT NULL DEFAULT 'RUNNING',
  "reason" TEXT,
  "processedCount" INTEGER NOT NULL DEFAULT 0,
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  "errorMessage" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "membership_reset_run_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "membership_reset_run_cycleYear_key" ON "membership_reset_run"("cycleYear");
CREATE INDEX "membership_reset_run_status_idx" ON "membership_reset_run"("status");

CREATE TABLE "audit_log" (
  "id" SERIAL NOT NULL,
  "actorId" INTEGER,
  "action" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" INTEGER,
  "previousValue" JSONB,
  "newValue" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "audit_log_entityType_entityId_idx" ON "audit_log"("entityType", "entityId");
CREATE INDEX "audit_log_actorId_createdAt_idx" ON "audit_log"("actorId", "createdAt");

ALTER TABLE "membership_history" ADD CONSTRAINT "membership_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "membership_history" ADD CONSTRAINT "membership_history_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "membership_benefit_tier" ADD CONSTRAINT "membership_benefit_tier_benefitId_fkey" FOREIGN KEY ("benefitId") REFERENCES "membership_benefit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "membership_benefit_tier" ADD CONSTRAINT "membership_benefit_tier_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "membership"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "membership_benefit_redemption" ADD CONSTRAINT "membership_benefit_redemption_benefitId_fkey" FOREIGN KEY ("benefitId") REFERENCES "membership_benefit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "membership_benefit_redemption" ADD CONSTRAINT "membership_benefit_redemption_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "membership_benefit_redemption" ADD CONSTRAINT "membership_benefit_redemption_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
