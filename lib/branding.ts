/**
 * Single source of truth for the public product name in UI, metadata, and
 * user-facing copy. Change here only.
 *
 * Markdown under `content/docs/` may use the placeholder `{{APP_DISPLAY_NAME}}`;
 * it is replaced when rendering (see `lib/docs/source.ts`).
 */
export const APP_DISPLAY_NAME = "Simple*Factu";

/** Docs site label (nav + browser titles under /docs). */
export const APP_DOCS_LABEL = `${APP_DISPLAY_NAME} Docs`;

/** Default meta description for the docs index (overrides index.md when applied in loader). */
export const APP_DOCS_INDEX_DESCRIPTION =
  `Documentación de la API ${APP_DISPLAY_NAME} para integraciones con Veri*Factu (AEAT).`;

/** Legal and settings pages: "Page title — product name". */
export function appDocumentTitle(pageTitle: string): string {
  return `${pageTitle} — ${APP_DISPLAY_NAME}`;
}

/** Docs section browser titles: "Page title — docs site label". */
export function docsBrowserPageTitle(docPageTitle: string): string {
  return `${docPageTitle} — ${APP_DOCS_LABEL}`;
}
