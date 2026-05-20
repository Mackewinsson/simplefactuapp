"use client";

import { useState } from "react";

type SeriesModalProps = {
  existingSeries: string[];
  onSelect: (serie: string) => void;
  onClose: () => void;
};

export function SeriesModal({ existingSeries, onSelect, onClose }: SeriesModalProps) {
  const [newSerie, setNewSerie] = useState("");

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-12"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm rounded-lg border border-outline-soft bg-surface p-5 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold text-fg">Gestión de series</h3>
          <button type="button" onClick={onClose} className="text-fg-subtle hover:text-fg-muted">
            ✕
          </button>
        </div>

        {existingSeries.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 text-xs font-medium text-fg-subtle uppercase tracking-wide">
              Series existentes
            </p>
            <ul className="space-y-1">
              {existingSeries.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(s);
                      onClose();
                    }}
                    className="w-full rounded px-3 py-2 text-left text-sm hover:bg-surface-muted"
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <p className="mb-2 text-xs font-medium text-fg-subtle uppercase tracking-wide">Nueva serie</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={newSerie}
              onChange={(e) => setNewSerie(e.target.value)}
              placeholder="p.ej. 2026"
              className="flex-1 rounded border border-outline px-3 py-2 text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter" && newSerie.trim()) {
                  onSelect(newSerie.trim());
                  onClose();
                }
              }}
            />
            <button
              type="button"
              disabled={!newSerie.trim()}
              onClick={() => {
                if (newSerie.trim()) {
                  onSelect(newSerie.trim());
                  onClose();
                }
              }}
              className="rounded border border-outline bg-surface px-3 py-2 text-sm font-medium hover:bg-surface-hover disabled:opacity-50"
            >
              Crear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
