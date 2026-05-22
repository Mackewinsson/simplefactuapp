-- CreateTable
CREATE TABLE "user_partner_accounts" (
    "userId" TEXT NOT NULL,
    "partnerTenantId" TEXT NOT NULL,
    "apiKeyEncrypted" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_partner_accounts_pkey" PRIMARY KEY ("userId")
);
