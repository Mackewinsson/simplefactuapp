"use client";

import { useEffect, type RefObject } from "react";

/**
 * Scalar API Reference ships UI chrome in English (Search, Introduction,
 * Operations, Models, …). Until Scalar exposes i18n, patch visible labels
 * in our mount subtree after render.
 */
const EXACT_LABELS_ES: Record<string, string> = {
  Search: "Buscar",
  Introduction: "Introducción",
  Models: "Modelos",
  Operations: "Operaciones",
  "Show More": "Ver más",
  "Show more": "Ver más",
  Jobs: "Trabajos",
  Tenant: "Cuenta",
  "API Reference": "Referencia API",
  Quickstart: "Inicio rápido",
};

function translateTextNodes(root: HTMLElement): void {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const raw = node.textContent;
    if (!raw) continue;
    const trimmed = raw.trim();
    const replacement = EXACT_LABELS_ES[trimmed];
    if (!replacement) continue;
    node.textContent = raw.replace(trimmed, replacement);
  }
}

export function useLocalizeScalarUi(containerRef: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    translateTextNodes(root);

    const observer = new MutationObserver(() => {
      translateTextNodes(root);
    });
    observer.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, [containerRef]);
}
