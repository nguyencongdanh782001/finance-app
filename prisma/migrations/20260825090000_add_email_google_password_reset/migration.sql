-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('WEB', 'GOOGLE');

-- AlterTable
ALTER TABLE "user" ADD COLUMN "email" TEXT,
ADD COLUMN "googleId" TEXT,
ADD COLUMN "authProvider" "AuthProvider" NOT NULL DEFAULT 'WEB',
ADD COLUMN "emailVerifiedAt" TIMESTAMP(3);

ALTER TABLE "user" ALTER COLUMN "phone" DROP NOT NULL;

-- AlterTable
ALTER TABLE "otp" ADD COLUMN "email" TEXT;

ALTER TABLE "otp" ALTER COLUMN "phone" DROP NOT NULL;

-- CreateTable
CREATE TABLE "password_reset_token" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_googleId_key" ON "user"("googleId");

-- CreateIndex
CREATE INDEX "user_email_idx" ON "user"("email");

-- CreateIndex
CREATE INDEX "user_googleId_idx" ON "user"("googleId");

-- CreateIndex
CREATE INDEX "user_authProvider_idx" ON "user"("authProvider");

-- CreateIndex
CREATE INDEX "otp_email_purpose_idx" ON "otp"("email", "purpose");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_token_tokenHash_key" ON "password_reset_token"("tokenHash");

-- CreateIndex
CREATE INDEX "password_reset_token_userId_idx" ON "password_reset_token"("userId");

-- CreateIndex
CREATE INDEX "password_reset_token_expiresAt_idx" ON "password_reset_token"("expiresAt");

-- AddForeignKey
ALTER TABLE "password_reset_token" ADD CONSTRAINT "password_reset_token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
