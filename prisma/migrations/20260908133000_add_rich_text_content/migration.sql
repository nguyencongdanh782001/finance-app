ALTER TABLE "product" ADD COLUMN "descriptionContent" JSONB;
ALTER TABLE "product" ADD COLUMN "descriptionHtml" TEXT;
ALTER TABLE "store_policy" ADD COLUMN "contentJson" JSONB;
ALTER TABLE "store_policy" ADD COLUMN "contentHtml" TEXT;
