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
      <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-5 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">Gestión de series</h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700">
            ✕
          </button>
        </div>

        {existingSeries.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
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
                    className="w-full rounded px-3 py-2 text-left text-sm hover:bg-gray-100"
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <p className="mb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Nueva serie</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={newSerie}
              onChange={(e) => setNewSerie(e.target.value)}
              placeholder="p.ej. 2026"
              className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm"
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
              className="rounded border border-gray-300 bg-white px-3 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              Crear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
