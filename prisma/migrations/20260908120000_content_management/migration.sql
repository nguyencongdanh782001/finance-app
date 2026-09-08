ALTER TYPE "HomepageBannerPlacement" ADD VALUE IF NOT EXISTS 'ANNOUNCEMENT_BAR';
ALTER TYPE "HomepageBannerPlacement" ADD VALUE IF NOT EXISTS 'HOME_HERO';
ALTER TYPE "HomepageBannerPlacement" ADD VALUE IF NOT EXISTS 'HOME_CAMPAIGN';
ALTER TYPE "HomepageBannerPlacement" ADD VALUE IF NOT EXISTS 'HOME_CATEGORY';
ALTER TYPE "HomepageBannerPlacement" ADD VALUE IF NOT EXISTS 'PRODUCT_LISTING';

CREATE TYPE "BannerTextAlignment" AS ENUM ('LEFT', 'CENTER', 'RIGHT');
CREATE TYPE "BannerTextTheme" AS ENUM ('LIGHT', 'DARK');
CREATE TYPE "PolicyStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'HIDDEN');
CREATE TYPE "PolicyType" AS ENUM ('PURCHASE_GUIDE', 'SHIPPING', 'RETURN_REFUND', 'PRIVACY', 'TERMS', 'PAYMENT', 'OTHER');

ALTER TABLE "homepage_banner"
  ADD COLUMN "internalName" TEXT NOT NULL DEFAULT 'Banner trang chủ',
  ADD COLUMN "eyebrow" TEXT,
  ADD COLUMN "description" TEXT,
  ADD COLUMN "mobileImagePublicId" TEXT,
  ADD COLUMN "imageAlt" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "primaryCtaLabel" TEXT,
  ADD COLUMN "primaryCtaUrl" TEXT,
  ADD COLUMN "secondaryCtaLabel" TEXT,
  ADD COLUMN "secondaryCtaUrl" TEXT,
  ADD COLUMN "textAlignment" "BannerTextAlignment" NOT NULL DEFAULT 'LEFT',
  ADD COLUMN "textTheme" "BannerTextTheme" NOT NULL DEFAULT 'LIGHT',
  ADD COLUMN "overlayOpacity" INTEGER NOT NULL DEFAULT 20,
  ADD COLUMN "createdById" INTEGER,
  ADD COLUMN "updatedById" INTEGER;

CREATE INDEX "homepage_banner_placement_isActive_position_idx"
  ON "homepage_banner"("placement", "isActive", "position");
CREATE INDEX "homepage_banner_startsAt_endsAt_idx"
  ON "homepage_banner"("startsAt", "endsAt");

CREATE TABLE "store_policy" (
  "id" SERIAL NOT NULL,
  "type" "PolicyType" NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "summary" TEXT,
  "content" JSONB NOT NULL,
  "status" "PolicyStatus" NOT NULL DEFAULT 'DRAFT',
  "showInFooter" BOOLEAN NOT NULL DEFAULT true,
  "footerOrder" INTEGER NOT NULL DEFAULT 0,
  "seoTitle" TEXT,
  "seoDescription" TEXT,
  "publishedAt" TIMESTAMP(3),
  "createdById" INTEGER,
  "updatedById" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "store_policy_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "store_policy_slug_key" ON "store_policy"("slug");
CREATE INDEX "store_policy_status_showInFooter_footerOrder_idx"
  ON "store_policy"("status", "showInFooter", "footerOrder");
CREATE INDEX "store_policy_type_idx" ON "store_policy"("type");
