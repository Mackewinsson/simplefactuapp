-- CreateEnum
CREATE TYPE "AeatJobStatus" AS ENUM ('NOT_SENT', 'PENDING', 'SUCCEEDED', 'FAILED', 'DEAD');

-- CreateTable
CREATE TABLE "user_verifactu_accounts" (
    "userId" TEXT NOT NULL,
    "simplefactuTenantId" TEXT NOT NULL,
    "apiKeyEncrypted" TEXT NOT NULL,
    "issuerNif" TEXT,
    "issuerLegalName" TEXT,
    "certificateUploadedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_verifactu_accounts_pkey" PRIMARY KEY ("userId")
);

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "customerNif" TEXT,
ADD COLUMN     "taxRatePercent" INTEGER NOT NULL DEFAULT 21,
ADD COLUMN     "aeatStatus" "AeatJobStatus" NOT NULL DEFAULT 'NOT_SENT',
ADD COLUMN     "aeatJobId" TEXT,
ADD COLUMN     "aeatLastError" TEXT,
ADD COLUMN     "aeatCsv" TEXT,
ADD COLUMN     "aeatQrText" TEXT,
ADD COLUMN     "aeatIdempotencyKey" TEXT,
ADD COLUMN     "aeatUpdatedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_aeatIdempotencyKey_key" ON "Invoice"("aeatIdempotencyKey");
