/**
 * Design tokens — referencia para desarrolladores.
 *
 * Los valores reales viven en `app/theme.css`. Tailwind los expone como
 * utilidades (`bg-primary`, `text-accent`, `border-outline`, …) vía
 * `tailwind.config.ts`.
 *
 * Para cambiar la paleta de toda la app, edita solo `app/theme.css`.
 */

export const THEME_CSS_PATH = "app/theme.css" as const;

/** Nombres de familias de color disponibles en className. */
export const themeColorFamilies = [
  "primary",
  "cta",
  "accent",
  "surface",
  "outline",
  "fg",
  "code",
  "danger",
  "warning",
  "success",
  "info",
] as const;
