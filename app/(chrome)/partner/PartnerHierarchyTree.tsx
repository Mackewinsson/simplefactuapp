"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateSubtenantStatusAction } from "@/app/(chrome)/partner/actions";

export interface PartnerSubtenantNode {
  id: string;
  name: string | null;
  allowed_nif: string | null;
  status: string;
  has_certificate?: boolean | number;
}

interface PartnerHierarchyTreeProps {
  partnerId: string;
  partnerName?: string;
  subtenants: PartnerSubtenantNode[];
}

export function PartnerHierarchyTree({
  partnerId,
  partnerName = "Cuenta Gestoría / Integrador",
  subtenants,
}: PartnerHierarchyTreeProps) {
  const [activeTab, setActiveTab] = useState<"tree" | "grid">("tree");

  // Health Metrics
  const readyCount = subtenants.filter((s) => s.status === "ACTIVE" && !!s.has_certificate).length;
  const pendingCertCount = subtenants.filter((s) => !s.has_certificate).length;
  const inactiveCount = subtenants.filter((s) => s.status !== "ACTIVE").length;

  return (
    <div className="panel-premium rounded-3xl p-6 sm:p-8 space-y-6 overflow-hidden">
      {/* Header & Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-soft/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-accent animate-pulse" />
            <h2 className="text-xl font-extrabold tracking-tight text-fg font-display">
              Mapa de Estructura Multi-NIF
            </h2>
          </div>
          <p className="mt-1 text-xs text-fg-muted font-medium">
            Visualización en tiempo real del estado de emisión y certificados de tus NIFs gestionados.
          </p>
        </div>

        <div className="inline-flex rounded-xl bg-surface-muted/80 p-1 border border-outline-soft/60">
          <button
            type="button"
            onClick={() => setActiveTab("tree")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold font-display rounded-lg transition-all ${
              activeTab === "tree"
                ? "bg-surface text-fg shadow-sm border border-outline-soft/80"
                : "text-fg-muted hover:text-fg"
            }`}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Árbol Jerárquico
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("grid")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold font-display rounded-lg transition-all ${
              activeTab === "grid"
                ? "bg-surface text-fg shadow-sm border border-outline-soft/80"
                : "text-fg-muted hover:text-fg"
            }`}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Tarjetas
          </button>
        </div>
      </div>

      {activeTab === "tree" ? (
        /* Visual Tree View */
        <div className="py-2 space-y-8">
          {/* Root Node (Partner Account) */}
          <div className="flex justify-center">
            <div className="relative group max-w-md w-full rounded-2xl border-2 border-accent/40 bg-surface/90 p-5 shadow-md backdrop-blur-md transition-all hover:border-accent hover:shadow-lg">
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/25">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  Cuenta Titular (Padre)
                </span>
                <span className="font-mono text-[11px] text-fg-subtle font-bold">
                  {partnerId}
                </span>
              </div>

              <p className="text-base font-extrabold text-fg font-display">
                {partnerName}
              </p>

              {/* Health Bar (Semáforo de Salud) */}
              <div className="mt-4 pt-3 border-t border-outline-soft/40 space-y-2">
                <div className="flex items-center justify-between text-xs font-display font-semibold">
                  <span className="text-fg-muted">Salud global de emisión:</span>
                  <span className="font-mono text-fg-subtle">{readyCount}/{subtenants.length} listos</span>
                </div>

                <div className="flex items-center gap-3 text-[11px] font-medium text-fg-muted">
                  <span className="inline-flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-success-emphasis" />
                    <strong>{readyCount}</strong> Listos AEAT
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-warning-emphasis" />
                    <strong>{pendingCertCount}</strong> Falta Cert.
                  </span>
                  {inactiveCount > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-fg-subtle/50" />
                      <strong>{inactiveCount}</strong> Inactivos
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Vertical Connecting Stem */}
          {subtenants.length > 0 && (
            <div className="flex flex-col items-center -my-1" aria-hidden>
              <div className="h-8 w-0.5 bg-gradient-to-b from-accent/50 to-outline-soft" />
              <div className="h-2 w-2 rounded-full border-2 border-outline-soft bg-surface" />
            </div>
          )}

          {/* Children Nodes */}
          {subtenants.length > 0 ? (
            <div className="relative pt-1">
              {subtenants.length > 1 && (
                <div
                  className="hidden md:block absolute top-0 left-[16%] right-[16%] h-0.5 bg-outline-soft"
                  aria-hidden
                />
              )}

              <div
                className={
                  subtenants.length === 1
                    ? "flex justify-center"
                    : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                }
              >
                {subtenants.map((node) => (
                  <SubtenantCard
                    key={node.id}
                    node={node}
                    centered={subtenants.length === 1}
                  />
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-outline-soft/40 flex flex-wrap items-center justify-center gap-4 text-xs text-fg-muted font-medium">
                <span className="font-bold font-display text-fg">Leyenda de estados:</span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-success-emphasis" />
                  Verde: Activo y listo para emitir a la AEAT
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-warning-emphasis" />
                  Naranja: Requiere subir certificado PFX
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-fg-subtle/50" />
                  Gris: Inactivo — actívalo cuando cumpla los requisitos
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-sm text-fg-muted">
              No hay NIFs emisores vinculados a esta cuenta titular todavía.
            </div>
          )}
        </div>
      ) : (
        /* Compact Grid View */
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {subtenants.map((node) => (
            <div
              key={node.id}
              className="flex items-center justify-between p-3.5 rounded-xl border border-outline-soft/60 bg-surface-muted/30"
            >
              <div>
                <p className="font-bold text-fg text-sm font-display">{node.name || node.id}</p>
                <p className="font-mono text-xs text-accent font-semibold">{node.allowed_nif || node.id}</p>
              </div>
              <Link
                href={`/partner/tenants/${encodeURIComponent(node.id)}`}
                className="btn btn-xs btn-secondary"
              >
                Ficha
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SubtenantCard({
  node,
  centered,
}: {
  node: PartnerSubtenantNode;
  centered: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isActive = node.status === "ACTIVE";
  const hasCert = !!node.has_certificate;
  const isReady = isActive && hasCert;
  const href = `/partner/tenants/${encodeURIComponent(node.id)}`;

  const tone = isReady
    ? {
        card: "border-success-outline/45 hover:border-success-emphasis",
        badge: "bg-success/15 text-success-emphasis border-success-outline/30",
        accentBar: "bg-success-emphasis",
      }
    : !hasCert
      ? {
          card: "border-warning-outline/55 hover:border-warning-emphasis",
          badge: "bg-warning/20 text-warning-emphasis border-warning-outline/40",
          accentBar: "bg-warning-emphasis",
        }
      : {
          card: "border-outline-soft hover:border-fg-subtle/60",
          badge: "bg-surface-muted text-fg-subtle border-outline-soft",
          accentBar: "bg-fg-subtle/50",
        };

  function activate() {
    setError(null);
    startTransition(async () => {
      const res = await updateSubtenantStatusAction(node.id, "ACTIVE");
      if (res.ok) {
        router.refresh();
      } else {
        setError(res.errors.join(", "));
      }
    });
  }

  return (
    <div
      className={`relative overflow-hidden flex flex-col rounded-2xl border-2 bg-surface/90 p-5 shadow-md backdrop-blur-md transition-all duration-200 hover:shadow-lg group ${tone.card} ${
        centered ? "max-w-md w-full" : ""
      }`}
    >
      <span aria-hidden className={`absolute inset-y-0 left-0 w-1 ${tone.accentBar}`} />

      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pl-1">
        <span
          className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${tone.badge}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${tone.accentBar}`} />
          NIF Emisor
        </span>
        <span
          className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
            isActive
              ? "bg-success/15 text-success-emphasis border-success-outline/30"
              : "bg-surface-muted text-fg-subtle border-outline-soft"
          }`}
        >
          {isActive ? "Activo" : "Inactivo"}
        </span>
      </div>

      <div className="pl-1 min-w-0">
        <p className="font-mono text-xs font-bold text-accent tracking-wide">
          {node.allowed_nif ? `NIF ${node.allowed_nif}` : "Sin NIF asignado"}
        </p>
        <Link
          href={href}
          className="mt-1 block text-base font-extrabold text-fg font-display hover:text-accent transition-colors truncate"
        >
          {node.name || node.id}
        </Link>
        <p className="mt-0.5 font-mono text-[11px] text-fg-subtle truncate">ID: {node.id}</p>
      </div>

      <div className="mt-4 ml-1 pt-3 border-t border-outline-soft/50 flex flex-wrap items-center justify-between gap-2">
        <span
          className={`inline-flex items-center gap-1.5 text-[11px] font-semibold ${
            isReady
              ? "text-success-emphasis"
              : !hasCert
                ? "text-warning-emphasis"
                : "text-fg-subtle"
          }`}
        >
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${
              isReady ? "bg-success-emphasis" : !hasCert ? "bg-warning-emphasis" : "bg-fg-subtle/50"
            }`}
          />
          {isReady
            ? "Listo AEAT"
            : !hasCert
              ? "Falta certificado PFX"
              : "Inactivo — requisitos OK"}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          {!isActive && hasCert ? (
            <button
              type="button"
              onClick={activate}
              disabled={pending}
              className="btn btn-xs btn-accent"
            >
              {pending ? "Activando…" : "Activar"}
            </button>
          ) : null}
          <Link
            href={href}
            className="font-display font-bold text-accent text-xs hover:underline inline-flex items-center gap-0.5"
          >
            Gestionar →
          </Link>
        </div>
      </div>

      {error ? (
        <p className="mt-2 pl-1 text-xs text-danger-emphasis font-semibold">{error}</p>
      ) : null}
    </div>
  );
}
