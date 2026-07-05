-- CreateTable
CREATE TABLE "subscriptions" (
    "userId" TEXT NOT NULL,
    "simplefactuTenantId" TEXT NOT NULL,
    "lsSubscriptionId" TEXT NOT NULL,
    "lsCustomerId" TEXT,
    "lsVariantId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "planId" TEXT NOT NULL DEFAULT 'free',
    "renewsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "customerPortalUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_lsSubscriptionId_key" ON "subscriptions"("lsSubscriptionId");

-- CreateIndex
CREATE INDEX "subscriptions_simplefactuTenantId_idx" ON "subscriptions"("simplefactuTenantId");
