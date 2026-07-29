"use client";

import { useTransition } from "react";
import { startImpersonationAction } from "@/lib/auth/admin-impersonate-actions";

type ImpersonateButtonProps = {
  tenantId: string;
  tenantName?: string | null;
  /** Compact style for table rows */
  compact?: boolean;
};

export function ImpersonateButton({
  tenantId,
  tenantName,
  compact = false,
}: ImpersonateButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      title={`Ver la app como ${tenantId}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        startTransition(() => {
          startImpersonationAction(tenantId, tenantName ?? undefined);
        });
      }}
      className={
        compact
          ? "inline-flex items-center gap-1 rounded-lg border border-outline-soft/80 bg-surface px-2 py-1 text-[11px] font-bold text-fg hover:bg-surface-hover disabled:opacity-60"
          : "inline-flex items-center gap-1.5 rounded-xl border border-outline-soft/80 bg-surface px-3 py-2 text-sm font-bold text-fg hover:bg-surface-hover shadow-sm disabled:opacity-60"
      }
    >
      {isPending ? "Entrando…" : "Ver como este usuario"}
    </button>
  );
}
