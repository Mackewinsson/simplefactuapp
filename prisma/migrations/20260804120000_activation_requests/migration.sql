-- CreateEnum
CREATE TYPE "ActivationRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "activation_requests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "nif" TEXT NOT NULL,
    "message" TEXT,
    "status" "ActivationRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decidedAt" TIMESTAMP(3),
    "decidedBy" TEXT,
    "decisionNote" TEXT,

    CONSTRAINT "activation_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "activation_requests_userId_idx" ON "activation_requests"("userId");

-- CreateIndex
CREATE INDEX "activation_requests_status_idx" ON "activation_requests"("status");

-- CreateIndex
CREATE INDEX "activation_requests_createdAt_idx" ON "activation_requests"("createdAt");
