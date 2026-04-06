/*
  Warnings:

  - You are about to alter the column `importPrice` on the `daily_sold_product` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Decimal(65,30)`.

*/
-- AlterTable
ALTER TABLE "daily_sold_product" ALTER COLUMN "importPrice" DROP DEFAULT,
ALTER COLUMN "importPrice" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "sales" DROP DEFAULT;
