"use client";

import { useTransition } from "react";
import { setAdminPreviewRoleAction } from "@/lib/auth/admin-preview-actions";
import { stopImpersonationAction } from "@/lib/auth/admin-impersonate-actions";
import type { AppRole } from "@/lib/auth/app-role";

interface AdminPreviewBannerProps {
  currentRole: AppRole | null;
  impersonation?: { tenantId: string; name?: string } | null;
}

export function AdminPreviewBanner({
  currentRole,
  impersonation,
}: AdminPreviewBannerProps) {
  const [isPending, startTransition] = useTransition();

  const handleSetRole = (role: AppRole | "clear") => {
    startTransition(() => {
      setAdminPreviewRoleAction(role);
    });
  };

  const handleStopImpersonation = () => {
    startTransition(() => {
      stopImpersonationAction("/admin/users");
    });
  };

  if (impersonation?.tenantId) {
    const label = impersonation.name
      ? `${impersonation.name} (${impersonation.tenantId})`
      : impersonation.tenantId;

    return (
      <aside
        aria-label="Modo impersonación activo"
        className="border-b border-danger-emphasis-hover bg-danger-emphasis text-white text-xs font-display"
      >
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="font-black tracking-wide uppercase">
              Modo impersonación activo
            </span>
            <span className="text-white/95">
              Viendo la plataforma como{" "}
              <span className="font-mono font-bold">{label}</span>
            </span>
          </div>
          <button
            type="button"
            disabled={isPending}
            onClick={handleStopImpersonation}
            className="shrink-0 rounded bg-surface px-3 py-1 text-[11px] font-black text-danger-foreground hover:bg-surface-muted transition-all shadow-sm disabled:opacity-60"
          >
            Salir de impersonación
          </button>
        </div>
      </aside>
    );
  }

  const isPreview = currentRole === "partner" || currentRole === "user";

  return (
    <aside
      aria-label="Modo de vista previa de administrador"
      className={`border-b text-xs font-display transition-all ${
        isPreview
          ? "bg-warning-deeper/90 text-white border-warning-emphasis"
          : "bg-surface-muted/90 text-fg-muted border-outline-soft/60"
      }`}
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="font-bold">
            {isPreview ? "Vista previa activa:" : "Administrador de plataforma:"}
          </span>
          <span>
            {currentRole === "partner"
              ? "Viendo la app como Gestoría / Integrador"
              : currentRole === "user"
                ? "Viendo la app como Autónomo / Pyme Web"
                : "Modo Operador de Plataforma"}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-medium opacity-80 mr-1 hidden sm:inline">
            Ver como:
          </span>

          <button
            type="button"
            disabled={isPending || currentRole === "user"}
            onClick={() => handleSetRole("user")}
            className={`px-2.5 py-1 rounded font-bold text-[11px] transition-all ${
              currentRole === "user"
                ? "bg-white text-fg shadow-sm cursor-default"
                : "bg-black/20 hover:bg-black/40 text-white"
            }`}
          >
            Autónomo
          </button>

          <button
            type="button"
            disabled={isPending || currentRole === "partner"}
            onClick={() => handleSetRole("partner")}
            className={`px-2.5 py-1 rounded font-bold text-[11px] transition-all ${
              currentRole === "partner"
                ? "bg-white text-fg shadow-sm cursor-default"
                : "bg-black/20 hover:bg-black/40 text-white"
            }`}
          >
            Gestoría
          </button>

          {isPreview && (
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleSetRole("clear")}
              className="ml-2 px-2.5 py-1 rounded bg-white text-warning-deeper font-black text-[11px] hover:bg-surface transition-all shadow-sm"
            >
              Restablecer a Admin
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
