-- CreateEnum
CREATE TYPE "ActivationRequestKind" AS ENUM ('AUTONOMO', 'INTEGRATOR');

-- AlterTable
ALTER TABLE "activation_requests" ADD COLUMN "kind" "ActivationRequestKind" NOT NULL DEFAULT 'INTEGRATOR';

-- CreateIndex
CREATE INDEX "activation_requests_kind_idx" ON "activation_requests"("kind");
