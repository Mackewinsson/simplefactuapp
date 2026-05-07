/**
 * Strip non-public surface (admin/* and webhooks/*) from an OpenAPI 3.x
 * document before serving it to the integrator-facing docs portal.
 *
 * Kept as a pure function to make it easy to unit-test in the future and to
 * reuse from other surfaces (CLI, snapshot, etc.).
 */

const HIDDEN_PATH_PREFIXES = ["/admin", "/webhooks"];

const PUBLIC_DESCRIPTION_SUFFIX =
  "\n\nLos endpoints administrativos quedan fuera de este portal.";

type OpenApiDocument = {
  info?: { description?: string; [k: string]: unknown };
  paths?: Record<string, unknown>;
  tags?: Array<{ name: string; [k: string]: unknown }>;
  [k: string]: unknown;
};

function isHiddenPath(path: string): boolean {
  return HIDDEN_PATH_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`)
  );
}

function collectReferencedTags(paths: Record<string, unknown>): Set<string> {
  const referenced = new Set<string>();
  for (const pathItem of Object.values(paths)) {
    if (!pathItem || typeof pathItem !== "object") continue;
    for (const operation of Object.values(pathItem as Record<string, unknown>)) {
      if (!operation || typeof operation !== "object") continue;
      const tags = (operation as { tags?: unknown }).tags;
      if (!Array.isArray(tags)) continue;
      for (const t of tags) {
        if (typeof t === "string") referenced.add(t);
      }
    }
  }
  return referenced;
}

export function filterPublicOpenApi(input: unknown): unknown {
  if (!input || typeof input !== "object") return input;
  const spec = { ...(input as OpenApiDocument) };

  if (spec.paths && typeof spec.paths === "object") {
    const filteredPaths: Record<string, unknown> = {};
    for (const [path, value] of Object.entries(spec.paths)) {
      if (isHiddenPath(path)) continue;
      filteredPaths[path] = value;
    }
    spec.paths = filteredPaths;

    if (Array.isArray(spec.tags)) {
      const used = collectReferencedTags(filteredPaths);
      spec.tags = spec.tags.filter((t) => t && used.has(t.name));
    }
  }

  if (spec.info && typeof spec.info === "object") {
    const current = typeof spec.info.description === "string" ? spec.info.description : "";
    if (!current.includes(PUBLIC_DESCRIPTION_SUFFIX.trim())) {
      spec.info = {
        ...spec.info,
        description: `${current}${PUBLIC_DESCRIPTION_SUFFIX}`.trim(),
      };
    }
  }

  return spec;
}
