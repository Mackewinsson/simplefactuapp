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

/** Etiquetas legacy en inglés del spec upstream → nombres públicos en español. */
const TAG_ALIASES: Record<string, string> = {
  Jobs: "Trabajos",
  Tenant: "Cuenta",
};

const PUBLIC_TAG_META: Record<string, { description: string }> = {
  Facturas: {
    description:
      "Alta y anulación de facturas Veri*Factu y consulta del ledger de registros aceptados por AEAT.",
  },
  Trabajos: {
    description:
      "Estado de los envíos asíncronos a AEAT (`GET /jobs/{jobId}`) tras `POST /send-invoice` o `/cancel-invoice`.",
  },
  "Verificación de NIF": {
    description: "Validación de NIF y nombre contra el servicio VNIF de la AEAT.",
  },
  Cuenta: {
    description:
      "Certificado digital AEAT del tenant (`POST /me/certificate`, `GET /me/certificate`).",
  },
  Facturación: {
    description: "Plan, uso mensual y checkout Stripe.",
  },
  Salud: {
    description: "Comprobaciones de vida y preparación del servicio.",
  },
};

type OpenApiDocument = {
  info?: { description?: string; [k: string]: unknown };
  paths?: Record<string, unknown>;
  tags?: Array<{ name: string; description?: string; [k: string]: unknown }>;
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

function renameOperationTags(paths: Record<string, unknown>): void {
  for (const pathItem of Object.values(paths)) {
    if (!pathItem || typeof pathItem !== "object") continue;
    for (const operation of Object.values(pathItem as Record<string, unknown>)) {
      if (!operation || typeof operation !== "object") continue;
      const op = operation as { tags?: unknown };
      if (!Array.isArray(op.tags)) continue;
      op.tags = op.tags.map((t) => (typeof t === "string" ? (TAG_ALIASES[t] ?? t) : t));
    }
  }
}

function buildPublicTags(used: Set<string>): Array<{ name: string; description: string }> {
  const ordered = [
    "Facturas",
    "Trabajos",
    "Verificación de NIF",
    "Cuenta",
    "Facturación",
    "Salud",
  ];
  const tags: Array<{ name: string; description: string }> = [];
  for (const name of ordered) {
    if (!used.has(name)) continue;
    tags.push({
      name,
      description: PUBLIC_TAG_META[name]?.description ?? name,
    });
  }
  for (const name of used) {
    if (ordered.includes(name)) continue;
    tags.push({
      name,
      description: PUBLIC_TAG_META[name]?.description ?? name,
    });
  }
  return tags;
}

function applyTagGroups(spec: OpenApiDocument, used: Set<string>): void {
  const groups: Array<{ name: string; tags: string[] }> = [];
  const facturacion = ["Facturas", "Trabajos", "Verificación de NIF"].filter((t) =>
    used.has(t)
  );
  if (facturacion.length > 0) {
    groups.push({ name: "Veri*Factu", tags: facturacion });
  }
  const cuenta = ["Cuenta", "Facturación"].filter((t) => used.has(t));
  if (cuenta.length > 0) {
    groups.push({ name: "Cuenta y plan", tags: cuenta });
  }
  if (used.has("Salud")) {
    groups.push({ name: "Sistema", tags: ["Salud"] });
  }
  if (groups.length > 0) {
    spec["x-tagGroups"] = groups;
  }
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
    renameOperationTags(filteredPaths);
    spec.paths = filteredPaths;

    const used = collectReferencedTags(filteredPaths);
    spec.tags = buildPublicTags(used);
    applyTagGroups(spec, used);
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
