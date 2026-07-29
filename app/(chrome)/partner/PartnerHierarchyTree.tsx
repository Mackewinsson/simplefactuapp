"use client";

import Link from "next/link";
import { useState } from "react";

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

  const activeCount = subtenants.filter((s) => s.status === "ACTIVE").length;

  return (
    <div className="panel-premium rounded-3xl p-6 sm:p-8 space-y-6 overflow-hidden">
      {/* Header & Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-soft/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            <h2 className="text-xl font-extrabold tracking-tight text-fg font-display">
              Mapa de Estructura Multi-NIF
            </h2>
          </div>
          <p className="mt-1 text-xs text-fg-muted font-medium">
            Visualización jerárquica de tu cuenta titular y NIFs emisores gestionados.
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
            Vista Jerárquica
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
            <div className="relative group max-w-sm w-full rounded-2xl border-2 border-accent/40 bg-surface/90 p-4 shadow-md backdrop-blur-md transition-all hover:border-accent hover:shadow-lg">
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/25">
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
              <div className="mt-3 flex items-center justify-between text-xs text-fg-muted font-medium border-t border-outline-soft/40 pt-2.5">
                <span>NIFs gestionados: <strong className="text-fg">{subtenants.length}</strong></span>
                <span>Activos: <strong className="text-success-emphasis">{activeCount}</strong></span>
              </div>
            </div>
          </div>

          {/* Vertical Connecting Stem */}
          {subtenants.length > 0 && (
            <div className="flex flex-col items-center">
              <div className="h-6 w-0.5 bg-gradient-to-b from-accent/60 to-outline-soft" />
            </div>
          )}

          {/* Children Nodes Grid */}
          {subtenants.length > 0 ? (
            <div className="relative">
              {/* Horizontal Connecting Line (if multiple children) */}
              {subtenants.length > 1 && (
                <div className="hidden md:block absolute -top-4 left-[15%] right-[15%] h-0.5 bg-outline-soft" />
              )}

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {subtenants.map((node) => {
                  const isActive = node.status === "ACTIVE";
                  const hasCert = !!node.has_certificate;
                  const href = `/partner/tenants/${encodeURIComponent(node.id)}`;

                  return (
                    <div
                      key={node.id}
                      className="relative flex flex-col justify-between rounded-2xl border border-outline-soft/80 bg-surface-muted/40 p-4 transition-all duration-200 hover:bg-surface-hover/80 hover:border-accent/50 hover:shadow-md group"
                    >
                      <div>
                        {/* Top Badge Row */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="font-mono text-[11px] font-bold text-accent">
                            {node.allowed_nif ? `NIF: ${node.allowed_nif}` : "Sin NIF"}
                          </span>
                          <span
                            className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              isActive
                                ? "bg-success/15 text-success-emphasis border border-success-outline/30"
                                : "bg-danger/15 text-danger-emphasis border border-danger-outline/30"
                            }`}
                          >
                            {isActive ? "Activo" : "Suspendido"}
                          </span>
                        </div>

                        {/* Name */}
                        <Link
                          href={href}
                          className="font-extrabold text-fg font-display text-sm hover:text-accent transition-colors block line-clamp-1 mb-1"
                        >
                          {node.name || node.id}
                        </Link>
                        <p className="font-mono text-[11px] text-fg-subtle">
                          ID: {node.id}
                        </p>
                      </div>

                      {/* Footer Info & Action */}
                      <div className="mt-4 pt-3 border-t border-outline-soft/40 flex items-center justify-between text-xs">
                        <span className="inline-flex items-center gap-1 text-[11px] text-fg-muted font-medium">
                          <span className={`h-1.5 w-1.5 rounded-full ${hasCert ? "bg-success-emphasis" : "bg-warning-emphasis"}`} />
                          {hasCert ? "Certificado OK" : "Certificado Pendiente"}
                        </span>
                        <Link
                          href={href}
                          className="font-display font-bold text-accent text-xs group-hover:underline inline-flex items-center gap-0.5"
                        >
                          Gestionar →
                        </Link>
                      </div>
                    </div>
                  );
                })}
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
