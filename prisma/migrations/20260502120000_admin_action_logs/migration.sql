-- Admin panel audit trail (simplefactuapp)
CREATE TABLE IF NOT EXISTS "admin_action_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "target" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_action_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "admin_action_logs_userId_idx" ON "admin_action_logs"("userId");
CREATE INDEX IF NOT EXISTS "admin_action_logs_createdAt_idx" ON "admin_action_logs"("createdAt");
