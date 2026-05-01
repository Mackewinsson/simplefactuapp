-- CreateEnum
CREATE TYPE "AeatCancellationStatus" AS ENUM ('NONE', 'PENDING', 'SUCCEEDED', 'FAILED', 'DEAD');

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN "aeatCancellationJobId" TEXT,
ADD COLUMN "aeatCancellationStatus" "AeatCancellationStatus" NOT NULL DEFAULT 'NONE',
ADD COLUMN "aeatCancellationLastError" TEXT,
ADD COLUMN "aeatCancellationIdempotencyKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_aeatCancellationIdempotencyKey_key" ON "Invoice"("aeatCancellationIdempotencyKey");
