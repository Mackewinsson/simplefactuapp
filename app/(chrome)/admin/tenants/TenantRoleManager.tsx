"use client";

import { useState, useTransition } from "react";
import { adminSetUserRoleAction } from "@/app/(chrome)/admin/actions";

type AssignableRole = "admin" | "partner" | null;

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  partner: "Integrador",
  user: "Autónomo",
};

const ROLE_BADGE: Record<string, string> = {
  admin:
    "text-warning-deep bg-warning/60 border border-warning-outline/40",
  partner:
    "text-accent-foreground-muted bg-accent-muted/60 border border-accent-outline/30",
  user: "text-fg-subtle bg-surface-muted border border-outline-soft/60",
};

export function TenantRoleManager({
  clerkUserId,
  currentRole,
}: {
  clerkUserId: string;
  currentRole: string | null;
}) {
  const role = currentRole ?? "user";
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function setRole(newRole: AssignableRole) {
    setMsg(null);
    startTransition(async () => {
      const res = await adminSetUserRoleAction(clerkUserId, newRole);
      if (res) {
        setMsg({ ok: res.ok, text: res.ok ? res.message! : res.error! });
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-fg font-display">Rol actual:</span>
        <span
          className={`inline-flex items-center gap-1.5 text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full ${ROLE_BADGE[role] ?? ROLE_BADGE.user}`}
        >
          {ROLE_LABELS[role] ?? role}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {role !== "partner" && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => setRole("partner")}
            className="btn btn-sm btn-accent"
          >
            {isPending ? "…" : "Asignar Integrador"}
          </button>
        )}
        {role !== "admin" && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => setRole("admin")}
            className="btn btn-sm btn-warning"
          >
            {isPending ? "…" : "Asignar Admin"}
          </button>
        )}
        {role !== "user" && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => setRole(null)}
            className="btn btn-sm btn-secondary"
          >
            {isPending ? "…" : "Quitar rol (Autónomo)"}
          </button>
        )}
      </div>

      {msg && (
        <p
          className={`text-sm font-semibold ${
            msg.ok ? "text-success-emphasis" : "text-danger-emphasis"
          }`}
        >
          {msg.text}
        </p>
      )}
    </div>
  );
}
