CREATE TYPE "AdminNotificationType" AS ENUM (
  'NEW_ONLINE_ORDER',
  'ONLINE_PAYMENT_SUCCESS',
  'ONLINE_PAYMENT_FAILED',
  'ORDER_CANCELLED'
);

CREATE TYPE "NotificationOutboxStatus" AS ENUM (
  'PENDING',
  'PROCESSING',
  'SENT',
  'PARTIALLY_SENT',
  'FAILED'
);

CREATE TABLE "admin_notification" (
  "id" TEXT NOT NULL,
  "type" "AdminNotificationType" NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "orderId" INTEGER,
  "eventKey" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "admin_notification_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "admin_notification_recipient" (
  "id" TEXT NOT NULL,
  "notificationId" TEXT NOT NULL,
  "userId" INTEGER NOT NULL,
  "isRead" BOOLEAN NOT NULL DEFAULT false,
  "readAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "admin_notification_recipient_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "push_subscription" (
  "id" TEXT NOT NULL,
  "userId" INTEGER NOT NULL,
  "endpoint" TEXT NOT NULL,
  "p256dh" TEXT NOT NULL,
  "auth" TEXT NOT NULL,
  "deviceName" TEXT,
  "userAgent" TEXT,
  "platform" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "lastUsedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "push_subscription_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "notification_outbox" (
  "id" TEXT NOT NULL,
  "eventKey" TEXT NOT NULL,
  "eventType" "AdminNotificationType" NOT NULL,
  "aggregateId" INTEGER NOT NULL,
  "notificationId" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "status" "NotificationOutboxStatus" NOT NULL DEFAULT 'PENDING',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "nextRetryAt" TIMESTAMP(3),
  "processedAt" TIMESTAMP(3),
  "lastError" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "notification_outbox_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "admin_notification_eventKey_key" ON "admin_notification"("eventKey");
CREATE INDEX "admin_notification_type_createdAt_idx" ON "admin_notification"("type", "createdAt");
CREATE INDEX "admin_notification_orderId_idx" ON "admin_notification"("orderId");
CREATE UNIQUE INDEX "admin_notification_recipient_notificationId_userId_key" ON "admin_notification_recipient"("notificationId", "userId");
CREATE INDEX "admin_notification_recipient_userId_isRead_createdAt_idx" ON "admin_notification_recipient"("userId", "isRead", "createdAt");
CREATE UNIQUE INDEX "push_subscription_endpoint_key" ON "push_subscription"("endpoint");
CREATE INDEX "push_subscription_userId_isActive_idx" ON "push_subscription"("userId", "isActive");
CREATE UNIQUE INDEX "notification_outbox_eventKey_key" ON "notification_outbox"("eventKey");
CREATE INDEX "notification_outbox_status_nextRetryAt_idx" ON "notification_outbox"("status", "nextRetryAt");

ALTER TABLE "admin_notification" ADD CONSTRAINT "admin_notification_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "admin_notification_recipient" ADD CONSTRAINT "admin_notification_recipient_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "admin_notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "admin_notification_recipient" ADD CONSTRAINT "admin_notification_recipient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "push_subscription" ADD CONSTRAINT "push_subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notification_outbox" ADD CONSTRAINT "notification_outbox_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "admin_notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;
