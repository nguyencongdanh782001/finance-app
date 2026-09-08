-- DropIndex
DROP INDEX "product_visibility_idx";

-- AlterTable
ALTER TABLE "coupon_membership" ALTER COLUMN "discountRate" DROP DEFAULT;

-- AlterTable
ALTER TABLE "daily_sold_product_contribution" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "order_item" ALTER COLUMN "updatedAt" DROP DEFAULT;
