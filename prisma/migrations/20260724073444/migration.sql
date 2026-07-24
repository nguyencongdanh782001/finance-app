-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'CUSTOMER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED');

-- CreateEnum
CREATE TYPE "OtpPurpose" AS ENUM ('LOGIN', 'REGISTER', 'VERIFY_PHONE', 'RESET_PASSWORD');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED', 'OUT_OF_STOCK');

-- CreateEnum
CREATE TYPE "ProductGender" AS ENUM ('WOMEN', 'MEN', 'UNISEX', 'KIDS');

-- CreateEnum
CREATE TYPE "UserGender" AS ENUM ('FEMALE', 'MALE', 'OTHER', 'UNSPECIFIED');

-- CreateEnum
CREATE TYPE "ProductVisibility" AS ENUM ('PUBLIC', 'HIDDEN', 'PRIVATE');

-- CreateEnum
CREATE TYPE "AddressType" AS ENUM ('SHIPPING', 'BILLING', 'BOTH');

-- CreateEnum
CREATE TYPE "CartStatus" AS ENUM ('ACTIVE', 'ABANDONED', 'CONVERTED');

-- CreateEnum
CREATE TYPE "OrderSource" AS ENUM ('OFFLINE', 'ONLINE');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PREPARING', 'READY_TO_SHIP', 'SHIPPING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PENDING', 'PROCESSING', 'AUTHORIZED', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('COD', 'CARD', 'BANK_TRANSFER', 'MOMO', 'ZALOPAY', 'PAYPAL', 'STRIPE');

-- CreateEnum
CREATE TYPE "ShippingStatus" AS ENUM ('PENDING', 'READY_TO_SHIP', 'IN_TRANSIT', 'DELIVERED', 'FAILED', 'RETURNED');

-- CreateEnum
CREATE TYPE "CouponType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ORDER', 'PAYMENT', 'SHIPPING', 'PROMOTION', 'SYSTEM');

-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "InventoryTransactionType" AS ENUM ('IMPORT', 'EXPORT', 'SALE', 'RETURN', 'ADJUSTMENT', 'RESERVATION', 'RELEASE');

-- CreateEnum
CREATE TYPE "HomepageBannerPlacement" AS ENUM ('HERO', 'TOP', 'MIDDLE', 'BOTTOM');

-- CreateEnum
CREATE TYPE "HomepageSectionType" AS ENUM ('BANNER', 'FEATURED_PRODUCTS', 'CATEGORY_PRODUCTS', 'CUSTOM');

-- CreateEnum
CREATE TYPE "PaymentLogType" AS ENUM ('CREATED', 'REDIRECTED', 'WEBHOOK_RECEIVED', 'VERIFIED', 'SUCCEEDED', 'FAILED', 'CANCELLED', 'REFUNDED', 'MANUAL_UPDATE');

-- AlterTable
ALTER TABLE "category" ADD COLUMN     "description" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "metaRobots" TEXT,
ADD COLUMN     "parentId" INTEGER,
ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "seoImage" TEXT,
ADD COLUMN     "slug" TEXT;

-- AlterTable
ALTER TABLE "product" ADD COLUMN     "brand" TEXT,
ADD COLUMN     "brandId" INTEGER,
ADD COLUMN     "careInstructions" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "gender" "ProductGender",
ADD COLUMN     "height" DECIMAL(65,30),
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "length" DECIMAL(65,30),
ADD COLUMN     "material" TEXT,
ADD COLUMN     "productStatus" "ProductStatus" DEFAULT 'DRAFT',
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "seoDescription" TEXT,
ADD COLUMN     "seoKeywords" TEXT,
ADD COLUMN     "seoTitle" TEXT,
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "soldCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tags" JSONB,
ADD COLUMN     "videoUrl" TEXT,
ADD COLUMN     "viewCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "visibility" "ProductVisibility" NOT NULL DEFAULT 'PUBLIC',
ADD COLUMN     "weight" DECIMAL(65,30),
ADD COLUMN     "width" DECIMAL(65,30);

-- CreateTable
CREATE TABLE "brand" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo" TEXT,
    "description" TEXT,
    "website" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "phone" TEXT NOT NULL,
    "passwordHash" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "firstName" TEXT,
    "lastName" TEXT,
    "displayName" TEXT,
    "avatarUrl" TEXT,
    "birthday" TIMESTAMP(3),
    "gender" "UserGender",
    "totalOrders" INTEGER NOT NULL DEFAULT 0,
    "totalSpent" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "rewardPoints" INTEGER NOT NULL DEFAULT 0,
    "phoneVerifiedAt" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "membershipId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_session" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "device" TEXT,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membership" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "level" INTEGER NOT NULL DEFAULT 0,
    "color" TEXT,
    "icon" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "benefits" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "minSpendAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "discountRate" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "membership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "phone" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "purpose" "OtpPurpose" NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "ipAddress" TEXT,
    "device" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_address" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" "AddressType" NOT NULL DEFAULT 'BOTH',
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "line1" TEXT NOT NULL,
    "line2" TEXT,
    "ward" TEXT,
    "district" TEXT,
    "city" TEXT NOT NULL,
    "province" TEXT,
    "postalCode" TEXT,
    "country" TEXT NOT NULL DEFAULT 'VN',
    "latitude" DECIMAL(65,30),
    "longitude" DECIMAL(65,30),
    "isDefaultShipping" BOOLEAN NOT NULL DEFAULT false,
    "isDefaultBilling" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_image" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "variantId" INTEGER,
    "url" TEXT NOT NULL,
    "publicId" TEXT,
    "altText" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "variant_group" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "variant_group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "variant_option" (
    "id" SERIAL NOT NULL,
    "groupId" INTEGER NOT NULL,
    "value" TEXT NOT NULL,
    "slug" TEXT,
    "metadata" JSONB,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "variant_option_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_variant" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "sku" TEXT NOT NULL,
    "size" TEXT,
    "color" TEXT,
    "barcode" TEXT,
    "price" DECIMAL(65,30),
    "importPrice" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "sellPrice" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "comparePrice" DECIMAL(65,30),
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "reservedQuantity" INTEGER NOT NULL DEFAULT 0,
    "lowStockThreshold" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "weight" DECIMAL(65,30),
    "averageCost" DECIMAL(65,30),
    "imagePriority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_variant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_variant_option" (
    "id" SERIAL NOT NULL,
    "variantId" INTEGER NOT NULL,
    "optionId" INTEGER NOT NULL,

    CONSTRAINT "product_variant_option_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_variant_image" (
    "id" SERIAL NOT NULL,
    "variantId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT,
    "altText" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_variant_image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "status" "CartStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart_item" (
    "id" SERIAL NOT NULL,
    "cartId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "variantId" INTEGER,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cart_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wishlist" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "name" TEXT NOT NULL DEFAULT 'Default',
    "isDefault" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wishlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wishlist_item" (
    "id" SERIAL NOT NULL,
    "wishlistId" INTEGER NOT NULL,
    "userId" INTEGER,
    "productId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wishlist_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order" (
    "id" SERIAL NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "userId" INTEGER,
    "shippingAddressId" INTEGER,
    "billingAddressId" INTEGER,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "source" "OrderSource" NOT NULL DEFAULT 'ONLINE',
    "subtotal" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "discountAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "shippingFee" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "taxAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "paidAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "remainingAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "paymentMethod" "PaymentMethod",
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" TIMESTAMP(3),
    "couponId" INTEGER,
    "receiverName" TEXT,
    "receiverPhone" TEXT,
    "receiverAddress" TEXT,
    "receiverWard" TEXT,
    "receiverDistrict" TEXT,
    "receiverProvince" TEXT,
    "latitude" DECIMAL(65,30),
    "longitude" DECIMAL(65,30),
    "note" TEXT,
    "placedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_item" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "variantId" INTEGER,
    "productTitle" TEXT NOT NULL,
    "sku" TEXT,
    "size" TEXT,
    "color" TEXT,
    "variantOptionsSnapshot" JSONB,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(65,30) NOT NULL,
    "totalPrice" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_transaction" (
    "id" SERIAL NOT NULL,
    "variantId" INTEGER NOT NULL,
    "type" "InventoryTransactionType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "referenceType" TEXT,
    "referenceId" INTEGER,
    "note" TEXT,
    "unitImportPrice" DECIMAL(65,30),
    "unitSellPrice" DECIMAL(65,30),
    "warehouseId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_status_history" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "previousStatus" "OrderStatus",
    "currentStatus" "OrderStatus" NOT NULL,
    "changedById" INTEGER,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouse" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "ward" TEXT,
    "district" TEXT,
    "province" TEXT,
    "country" TEXT NOT NULL DEFAULT 'VN',
    "latitude" DECIMAL(65,30),
    "longitude" DECIMAL(65,30),
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warehouse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouse_inventory" (
    "id" SERIAL NOT NULL,
    "warehouseId" INTEGER NOT NULL,
    "variantId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "reservedQuantity" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warehouse_inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'VND',
    "transactionId" TEXT,
    "providerTransactionId" TEXT,
    "providerResponse" JSONB,
    "failureReason" TEXT,
    "webhookPayload" JSONB,
    "providerPayload" JSONB,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_log" (
    "id" SERIAL NOT NULL,
    "paymentId" INTEGER NOT NULL,
    "type" "PaymentLogType" NOT NULL,
    "message" TEXT,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipping" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "warehouseId" INTEGER,
    "carrier" TEXT,
    "trackingNumber" TEXT,
    "status" "ShippingStatus" NOT NULL DEFAULT 'PENDING',
    "shippingDistanceKm" DECIMAL(65,30),
    "shippingFee" DECIMAL(65,30),
    "estimatedMinutes" INTEGER,
    "routePolyline" TEXT,
    "originLatitude" DECIMAL(65,30),
    "originLongitude" DECIMAL(65,30),
    "destinationLatitude" DECIMAL(65,30),
    "destinationLongitude" DECIMAL(65,30),
    "shippedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupon" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "CouponType" NOT NULL,
    "value" DECIMAL(65,30) NOT NULL,
    "minOrderAmount" DECIMAL(65,30),
    "maxDiscountAmount" DECIMAL(65,30),
    "usageLimit" INTEGER,
    "usageLimitPerUser" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "firstOrderOnly" BOOLEAN NOT NULL DEFAULT false,
    "maximumUsagePerDay" INTEGER,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupon_product" (
    "id" SERIAL NOT NULL,
    "couponId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,

    CONSTRAINT "coupon_product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupon_category" (
    "id" SERIAL NOT NULL,
    "couponId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,

    CONSTRAINT "coupon_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupon_membership" (
    "id" SERIAL NOT NULL,
    "couponId" INTEGER NOT NULL,
    "membershipId" INTEGER NOT NULL,

    CONSTRAINT "coupon_membership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "excluded_coupon_product" (
    "id" SERIAL NOT NULL,
    "couponId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,

    CONSTRAINT "excluded_coupon_product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "excluded_coupon_category" (
    "id" SERIAL NOT NULL,
    "couponId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,

    CONSTRAINT "excluded_coupon_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "productId" INTEGER NOT NULL,
    "variantId" INTEGER,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "comment" TEXT,
    "adminReply" TEXT,
    "repliedAt" TIMESTAMP(3),
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_image" (
    "id" SERIAL NOT NULL,
    "reviewId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT,
    "altText" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "priority" "NotificationPriority" NOT NULL DEFAULT 'NORMAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_history" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "keyword" TEXT NOT NULL,
    "filters" JSONB,
    "resultCount" INTEGER,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "search_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recently_viewed_product" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recently_viewed_product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "homepage_banner" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "imageUrl" TEXT NOT NULL,
    "desktopImage" TEXT,
    "mobileImage" TEXT,
    "imagePublicId" TEXT,
    "linkUrl" TEXT,
    "placement" "HomepageBannerPlacement" NOT NULL DEFAULT 'HERO',
    "position" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "homepage_banner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "homepage_featured_product" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "title" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "homepage_featured_product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "homepage_section" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "type" "HomepageSectionType" NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "homepage_section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "homepage_section_product" (
    "id" SERIAL NOT NULL,
    "sectionId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "homepage_section_product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "brand_name_key" ON "brand"("name");

-- CreateIndex
CREATE UNIQUE INDEX "brand_slug_key" ON "brand"("slug");

-- CreateIndex
CREATE INDEX "brand_isActive_idx" ON "brand"("isActive");

-- CreateIndex
CREATE INDEX "brand_sortOrder_idx" ON "brand"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "user_phone_key" ON "user"("phone");

-- CreateIndex
CREATE INDEX "user_phone_idx" ON "user"("phone");

-- CreateIndex
CREATE INDEX "user_role_idx" ON "user"("role");

-- CreateIndex
CREATE INDEX "user_status_idx" ON "user"("status");

-- CreateIndex
CREATE INDEX "user_membershipId_idx" ON "user"("membershipId");

-- CreateIndex
CREATE INDEX "user_totalOrders_idx" ON "user"("totalOrders");

-- CreateIndex
CREATE INDEX "user_rewardPoints_idx" ON "user"("rewardPoints");

-- CreateIndex
CREATE UNIQUE INDEX "user_session_tokenHash_key" ON "user_session"("tokenHash");

-- CreateIndex
CREATE INDEX "user_session_userId_idx" ON "user_session"("userId");

-- CreateIndex
CREATE INDEX "user_session_expiresAt_idx" ON "user_session"("expiresAt");

-- CreateIndex
CREATE INDEX "user_session_refreshTokenExpiresAt_idx" ON "user_session"("refreshTokenExpiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "membership_name_key" ON "membership"("name");

-- CreateIndex
CREATE INDEX "membership_level_idx" ON "membership"("level");

-- CreateIndex
CREATE INDEX "membership_priority_idx" ON "membership"("priority");

-- CreateIndex
CREATE INDEX "membership_isActive_idx" ON "membership"("isActive");

-- CreateIndex
CREATE INDEX "otp_userId_idx" ON "otp"("userId");

-- CreateIndex
CREATE INDEX "otp_phone_purpose_idx" ON "otp"("phone", "purpose");

-- CreateIndex
CREATE INDEX "otp_expiresAt_idx" ON "otp"("expiresAt");

-- CreateIndex
CREATE INDEX "otp_ipAddress_idx" ON "otp"("ipAddress");

-- CreateIndex
CREATE INDEX "user_address_userId_idx" ON "user_address"("userId");

-- CreateIndex
CREATE INDEX "user_address_latitude_longitude_idx" ON "user_address"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "product_image_productId_idx" ON "product_image"("productId");

-- CreateIndex
CREATE INDEX "product_image_variantId_idx" ON "product_image"("variantId");

-- CreateIndex
CREATE INDEX "variant_group_productId_idx" ON "variant_group"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "variant_group_productId_name_key" ON "variant_group"("productId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "variant_group_productId_slug_key" ON "variant_group"("productId", "slug");

-- CreateIndex
CREATE INDEX "variant_option_groupId_idx" ON "variant_option"("groupId");

-- CreateIndex
CREATE UNIQUE INDEX "variant_option_groupId_value_key" ON "variant_option"("groupId", "value");

-- CreateIndex
CREATE UNIQUE INDEX "variant_option_groupId_slug_key" ON "variant_option"("groupId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "product_variant_sku_key" ON "product_variant"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "product_variant_barcode_key" ON "product_variant"("barcode");

-- CreateIndex
CREATE INDEX "product_variant_productId_idx" ON "product_variant"("productId");

-- CreateIndex
CREATE INDEX "product_variant_size_idx" ON "product_variant"("size");

-- CreateIndex
CREATE INDEX "product_variant_color_idx" ON "product_variant"("color");

-- CreateIndex
CREATE INDEX "product_variant_barcode_idx" ON "product_variant"("barcode");

-- CreateIndex
CREATE INDEX "product_variant_isActive_idx" ON "product_variant"("isActive");

-- CreateIndex
CREATE INDEX "product_variant_imagePriority_idx" ON "product_variant"("imagePriority");

-- CreateIndex
CREATE INDEX "product_variant_option_variantId_idx" ON "product_variant_option"("variantId");

-- CreateIndex
CREATE INDEX "product_variant_option_optionId_idx" ON "product_variant_option"("optionId");

-- CreateIndex
CREATE UNIQUE INDEX "product_variant_option_variantId_optionId_key" ON "product_variant_option"("variantId", "optionId");

-- CreateIndex
CREATE INDEX "product_variant_image_variantId_idx" ON "product_variant_image"("variantId");

-- CreateIndex
CREATE INDEX "cart_userId_idx" ON "cart"("userId");

-- CreateIndex
CREATE INDEX "cart_status_idx" ON "cart"("status");

-- CreateIndex
CREATE INDEX "cart_item_cartId_idx" ON "cart_item"("cartId");

-- CreateIndex
CREATE INDEX "cart_item_productId_idx" ON "cart_item"("productId");

-- CreateIndex
CREATE INDEX "cart_item_variantId_idx" ON "cart_item"("variantId");

-- CreateIndex
CREATE UNIQUE INDEX "cart_item_cartId_productId_variantId_key" ON "cart_item"("cartId", "productId", "variantId");

-- CreateIndex
CREATE INDEX "wishlist_userId_idx" ON "wishlist"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "wishlist_userId_name_key" ON "wishlist"("userId", "name");

-- CreateIndex
CREATE INDEX "wishlist_item_wishlistId_idx" ON "wishlist_item"("wishlistId");

-- CreateIndex
CREATE INDEX "wishlist_item_userId_idx" ON "wishlist_item"("userId");

-- CreateIndex
CREATE INDEX "wishlist_item_productId_idx" ON "wishlist_item"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "wishlist_item_wishlistId_productId_key" ON "wishlist_item"("wishlistId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "wishlist_item_userId_productId_key" ON "wishlist_item"("userId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "order_orderNumber_key" ON "order"("orderNumber");

-- CreateIndex
CREATE INDEX "order_userId_idx" ON "order"("userId");

-- CreateIndex
CREATE INDEX "order_shippingAddressId_idx" ON "order"("shippingAddressId");

-- CreateIndex
CREATE INDEX "order_billingAddressId_idx" ON "order"("billingAddressId");

-- CreateIndex
CREATE INDEX "order_couponId_idx" ON "order"("couponId");

-- CreateIndex
CREATE INDEX "order_status_idx" ON "order"("status");

-- CreateIndex
CREATE INDEX "order_source_idx" ON "order"("source");

-- CreateIndex
CREATE INDEX "order_paymentMethod_idx" ON "order"("paymentMethod");

-- CreateIndex
CREATE INDEX "order_paymentStatus_idx" ON "order"("paymentStatus");

-- CreateIndex
CREATE INDEX "order_isPaid_idx" ON "order"("isPaid");

-- CreateIndex
CREATE INDEX "order_paidAt_idx" ON "order"("paidAt");

-- CreateIndex
CREATE INDEX "order_latitude_longitude_idx" ON "order"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "order_item_orderId_idx" ON "order_item"("orderId");

-- CreateIndex
CREATE INDEX "order_item_productId_idx" ON "order_item"("productId");

-- CreateIndex
CREATE INDEX "order_item_variantId_idx" ON "order_item"("variantId");

-- CreateIndex
CREATE INDEX "inventory_transaction_variantId_idx" ON "inventory_transaction"("variantId");

-- CreateIndex
CREATE INDEX "inventory_transaction_warehouseId_idx" ON "inventory_transaction"("warehouseId");

-- CreateIndex
CREATE INDEX "inventory_transaction_type_idx" ON "inventory_transaction"("type");

-- CreateIndex
CREATE INDEX "inventory_transaction_referenceType_referenceId_idx" ON "inventory_transaction"("referenceType", "referenceId");

-- CreateIndex
CREATE INDEX "inventory_transaction_createdAt_idx" ON "inventory_transaction"("createdAt");

-- CreateIndex
CREATE INDEX "order_status_history_orderId_idx" ON "order_status_history"("orderId");

-- CreateIndex
CREATE INDEX "order_status_history_changedById_idx" ON "order_status_history"("changedById");

-- CreateIndex
CREATE INDEX "order_status_history_currentStatus_idx" ON "order_status_history"("currentStatus");

-- CreateIndex
CREATE INDEX "order_status_history_createdAt_idx" ON "order_status_history"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "warehouse_code_key" ON "warehouse"("code");

-- CreateIndex
CREATE INDEX "warehouse_isDefault_idx" ON "warehouse"("isDefault");

-- CreateIndex
CREATE INDEX "warehouse_isActive_idx" ON "warehouse"("isActive");

-- CreateIndex
CREATE INDEX "warehouse_latitude_longitude_idx" ON "warehouse"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "warehouse_inventory_warehouseId_idx" ON "warehouse_inventory"("warehouseId");

-- CreateIndex
CREATE INDEX "warehouse_inventory_variantId_idx" ON "warehouse_inventory"("variantId");

-- CreateIndex
CREATE UNIQUE INDEX "warehouse_inventory_warehouseId_variantId_key" ON "warehouse_inventory"("warehouseId", "variantId");

-- CreateIndex
CREATE INDEX "payment_orderId_idx" ON "payment"("orderId");

-- CreateIndex
CREATE INDEX "payment_method_idx" ON "payment"("method");

-- CreateIndex
CREATE INDEX "payment_status_idx" ON "payment"("status");

-- CreateIndex
CREATE INDEX "payment_transactionId_idx" ON "payment"("transactionId");

-- CreateIndex
CREATE INDEX "payment_providerTransactionId_idx" ON "payment"("providerTransactionId");

-- CreateIndex
CREATE INDEX "payment_log_paymentId_idx" ON "payment_log"("paymentId");

-- CreateIndex
CREATE INDEX "payment_log_type_idx" ON "payment_log"("type");

-- CreateIndex
CREATE INDEX "payment_log_createdAt_idx" ON "payment_log"("createdAt");

-- CreateIndex
CREATE INDEX "shipping_orderId_idx" ON "shipping"("orderId");

-- CreateIndex
CREATE INDEX "shipping_warehouseId_idx" ON "shipping"("warehouseId");

-- CreateIndex
CREATE INDEX "shipping_trackingNumber_idx" ON "shipping"("trackingNumber");

-- CreateIndex
CREATE INDEX "shipping_status_idx" ON "shipping"("status");

-- CreateIndex
CREATE UNIQUE INDEX "coupon_code_key" ON "coupon"("code");

-- CreateIndex
CREATE INDEX "coupon_code_idx" ON "coupon"("code");

-- CreateIndex
CREATE INDEX "coupon_isActive_idx" ON "coupon"("isActive");

-- CreateIndex
CREATE INDEX "coupon_firstOrderOnly_idx" ON "coupon"("firstOrderOnly");

-- CreateIndex
CREATE INDEX "coupon_product_couponId_idx" ON "coupon_product"("couponId");

-- CreateIndex
CREATE INDEX "coupon_product_productId_idx" ON "coupon_product"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "coupon_product_couponId_productId_key" ON "coupon_product"("couponId", "productId");

-- CreateIndex
CREATE INDEX "coupon_category_couponId_idx" ON "coupon_category"("couponId");

-- CreateIndex
CREATE INDEX "coupon_category_categoryId_idx" ON "coupon_category"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "coupon_category_couponId_categoryId_key" ON "coupon_category"("couponId", "categoryId");

-- CreateIndex
CREATE INDEX "coupon_membership_couponId_idx" ON "coupon_membership"("couponId");

-- CreateIndex
CREATE INDEX "coupon_membership_membershipId_idx" ON "coupon_membership"("membershipId");

-- CreateIndex
CREATE UNIQUE INDEX "coupon_membership_couponId_membershipId_key" ON "coupon_membership"("couponId", "membershipId");

-- CreateIndex
CREATE INDEX "excluded_coupon_product_couponId_idx" ON "excluded_coupon_product"("couponId");

-- CreateIndex
CREATE INDEX "excluded_coupon_product_productId_idx" ON "excluded_coupon_product"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "excluded_coupon_product_couponId_productId_key" ON "excluded_coupon_product"("couponId", "productId");

-- CreateIndex
CREATE INDEX "excluded_coupon_category_couponId_idx" ON "excluded_coupon_category"("couponId");

-- CreateIndex
CREATE INDEX "excluded_coupon_category_categoryId_idx" ON "excluded_coupon_category"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "excluded_coupon_category_couponId_categoryId_key" ON "excluded_coupon_category"("couponId", "categoryId");

-- CreateIndex
CREATE INDEX "review_productId_idx" ON "review"("productId");

-- CreateIndex
CREATE INDEX "review_variantId_idx" ON "review"("variantId");

-- CreateIndex
CREATE INDEX "review_userId_idx" ON "review"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "review_userId_productId_key" ON "review"("userId", "productId");

-- CreateIndex
CREATE INDEX "review_image_reviewId_idx" ON "review_image"("reviewId");

-- CreateIndex
CREATE INDEX "notification_userId_idx" ON "notification"("userId");

-- CreateIndex
CREATE INDEX "notification_isRead_idx" ON "notification"("isRead");

-- CreateIndex
CREATE INDEX "notification_readAt_idx" ON "notification"("readAt");

-- CreateIndex
CREATE INDEX "notification_priority_idx" ON "notification"("priority");

-- CreateIndex
CREATE INDEX "search_history_userId_idx" ON "search_history"("userId");

-- CreateIndex
CREATE INDEX "search_history_keyword_idx" ON "search_history"("keyword");

-- CreateIndex
CREATE INDEX "search_history_createdAt_idx" ON "search_history"("createdAt");

-- CreateIndex
CREATE INDEX "recently_viewed_product_userId_idx" ON "recently_viewed_product"("userId");

-- CreateIndex
CREATE INDEX "recently_viewed_product_productId_idx" ON "recently_viewed_product"("productId");

-- CreateIndex
CREATE INDEX "recently_viewed_product_viewedAt_idx" ON "recently_viewed_product"("viewedAt");

-- CreateIndex
CREATE UNIQUE INDEX "recently_viewed_product_userId_productId_key" ON "recently_viewed_product"("userId", "productId");

-- CreateIndex
CREATE INDEX "homepage_banner_placement_idx" ON "homepage_banner"("placement");

-- CreateIndex
CREATE INDEX "homepage_banner_isActive_idx" ON "homepage_banner"("isActive");

-- CreateIndex
CREATE INDEX "homepage_banner_position_idx" ON "homepage_banner"("position");

-- CreateIndex
CREATE INDEX "homepage_featured_product_isActive_idx" ON "homepage_featured_product"("isActive");

-- CreateIndex
CREATE INDEX "homepage_featured_product_position_idx" ON "homepage_featured_product"("position");

-- CreateIndex
CREATE UNIQUE INDEX "homepage_featured_product_productId_key" ON "homepage_featured_product"("productId");

-- CreateIndex
CREATE INDEX "homepage_section_type_idx" ON "homepage_section"("type");

-- CreateIndex
CREATE INDEX "homepage_section_isActive_idx" ON "homepage_section"("isActive");

-- CreateIndex
CREATE INDEX "homepage_section_position_idx" ON "homepage_section"("position");

-- CreateIndex
CREATE INDEX "homepage_section_product_sectionId_idx" ON "homepage_section_product"("sectionId");

-- CreateIndex
CREATE INDEX "homepage_section_product_productId_idx" ON "homepage_section_product"("productId");

-- CreateIndex
CREATE INDEX "homepage_section_product_position_idx" ON "homepage_section_product"("position");

-- CreateIndex
CREATE UNIQUE INDEX "homepage_section_product_sectionId_productId_key" ON "homepage_section_product"("sectionId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "category_slug_key" ON "category"("slug");

-- CreateIndex
CREATE INDEX "category_parentId_idx" ON "category"("parentId");

-- CreateIndex
CREATE INDEX "category_position_idx" ON "category"("position");

-- CreateIndex
CREATE INDEX "category_isActive_idx" ON "category"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "product_slug_key" ON "product"("slug");

-- CreateIndex
CREATE INDEX "product_brandId_idx" ON "product"("brandId");

-- CreateIndex
CREATE INDEX "product_brand_idx" ON "product"("brand");

-- CreateIndex
CREATE INDEX "product_isFeatured_idx" ON "product"("isFeatured");

-- CreateIndex
CREATE INDEX "product_isPublished_idx" ON "product"("isPublished");

-- CreateIndex
CREATE INDEX "product_visibility_idx" ON "product"("visibility");

-- AddForeignKey
ALTER TABLE "category" ADD CONSTRAINT "category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_session" ADD CONSTRAINT "user_session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "otp" ADD CONSTRAINT "otp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_address" ADD CONSTRAINT "user_address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_image" ADD CONSTRAINT "product_image_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_image" ADD CONSTRAINT "product_image_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "variant_group" ADD CONSTRAINT "variant_group_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "variant_option" ADD CONSTRAINT "variant_option_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "variant_group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variant" ADD CONSTRAINT "product_variant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variant_option" ADD CONSTRAINT "product_variant_option_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variant_option" ADD CONSTRAINT "product_variant_option_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "variant_option"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variant_image" ADD CONSTRAINT "product_variant_image_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart" ADD CONSTRAINT "cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlist" ADD CONSTRAINT "wishlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlist_item" ADD CONSTRAINT "wishlist_item_wishlistId_fkey" FOREIGN KEY ("wishlistId") REFERENCES "wishlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlist_item" ADD CONSTRAINT "wishlist_item_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlist_item" ADD CONSTRAINT "wishlist_item_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_shippingAddressId_fkey" FOREIGN KEY ("shippingAddressId") REFERENCES "user_address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_billingAddressId_fkey" FOREIGN KEY ("billingAddressId") REFERENCES "user_address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "coupon"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_transaction" ADD CONSTRAINT "inventory_transaction_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_transaction" ADD CONSTRAINT "inventory_transaction_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_inventory" ADD CONSTRAINT "warehouse_inventory_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_inventory" ADD CONSTRAINT "warehouse_inventory_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_log" ADD CONSTRAINT "payment_log_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping" ADD CONSTRAINT "shipping_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping" ADD CONSTRAINT "shipping_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_product" ADD CONSTRAINT "coupon_product_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "coupon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_product" ADD CONSTRAINT "coupon_product_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_category" ADD CONSTRAINT "coupon_category_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "coupon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_category" ADD CONSTRAINT "coupon_category_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_membership" ADD CONSTRAINT "coupon_membership_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "coupon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_membership" ADD CONSTRAINT "coupon_membership_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "membership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "excluded_coupon_product" ADD CONSTRAINT "excluded_coupon_product_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "coupon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "excluded_coupon_product" ADD CONSTRAINT "excluded_coupon_product_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "excluded_coupon_category" ADD CONSTRAINT "excluded_coupon_category_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "coupon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "excluded_coupon_category" ADD CONSTRAINT "excluded_coupon_category_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_image" ADD CONSTRAINT "review_image_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "search_history" ADD CONSTRAINT "search_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recently_viewed_product" ADD CONSTRAINT "recently_viewed_product_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recently_viewed_product" ADD CONSTRAINT "recently_viewed_product_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homepage_featured_product" ADD CONSTRAINT "homepage_featured_product_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homepage_section_product" ADD CONSTRAINT "homepage_section_product_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "homepage_section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homepage_section_product" ADD CONSTRAINT "homepage_section_product_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
