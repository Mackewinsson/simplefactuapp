"use client";

import { useState } from "react";
import { CustomerList } from "./CustomerList";
import { CustomerModal } from "./CustomerModal";
import type { CustomerRow } from "./actions";

type Props = {
  customers: CustomerRow[];
};

export function CustomerCatalog({ customers }: Props) {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="space-y-6 font-display animate-fade-in-up">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3.5xl font-black tracking-tight text-fg">Clientes</h1>
          <p className="mt-1.5 font-sans text-sm font-medium text-fg-muted">
            Gestiona tu cartera de destinatarios reutilizables en facturas Verifactu.
          </p>
        </div>
        <button type="button" onClick={() => setShowCreate(true)} className="btn btn-lg btn-primary shrink-0">
          Nuevo cliente
        </button>
      </div>

      <CustomerList customers={customers} onRequestCreate={() => setShowCreate(true)} />

      {showCreate ? <CustomerModal onClose={() => setShowCreate(false)} /> : null}
    </div>
  );
}
