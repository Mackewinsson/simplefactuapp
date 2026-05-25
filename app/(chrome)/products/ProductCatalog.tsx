"use client";

import { useState } from "react";
import { ProductList } from "./ProductList";
import { ProductModal } from "./ProductModal";
import type { ProductRow } from "./actions";

type Props = {
  products: ProductRow[];
};

export function ProductCatalog({ products }: Props) {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="space-y-6 font-display animate-fade-in-up">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3.5xl font-black tracking-tight text-fg">Productos y servicios</h1>
          <p className="mt-1.5 font-sans text-sm font-medium text-fg-muted">
            Conceptos guardados para recuperar al facturar.
          </p>
        </div>
        <button type="button" onClick={() => setShowCreate(true)} className="btn btn-lg btn-primary shrink-0">
          Nuevo producto
        </button>
      </div>

      <ProductList products={products} onRequestCreate={() => setShowCreate(true)} />

      {showCreate ? <ProductModal onClose={() => setShowCreate(false)} /> : null}
    </div>
  );
}
