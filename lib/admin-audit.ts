import { prisma } from "@/lib/prisma";

export async function logAdminAction(params: {
  userId: string;
  action: string;
  target?: string | null;
  metadata?: Record<string, unknown> | null;
}): Promise<void> {
  try {
    await prisma.adminActionLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        target: params.target ?? null,
        metadata:
          params.metadata && Object.keys(params.metadata).length > 0
            ? JSON.stringify(params.metadata)
            : null,
      },
    });
  } catch (e) {
    console.error("[admin-audit] log failed", e);
  }
}
