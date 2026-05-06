"use server";

import { auth } from "@clerk/nextjs/server";
import { createSimplefactuClient, getSimplefactuBaseUrl } from "@/lib/simplefactu/client";
import { ensureVerifactuApiKey } from "@/lib/verifactu/provision";
import { formatSimplefactuHttpError } from "@/lib/simplefactu/api-errors";

export type VerifyRecipientNifResult =
  | { kind: "identified"; nif: string; nombre: string; resultado: string }
  | {
      kind: "not_identified";
      resultado: string;
      message?: string;
      nif?: string;
      nombre?: string;
    }
  | { kind: "error"; error: string };

/**
 * Calls simplefactu POST /verify-nif (VNifV2 / calidad datos identificativos).
 * Only meaningful for Spanish NIF/CIF + name pairs.
 */
export async function verifyRecipientNif(
  nif: string,
  nombre: string
): Promise<VerifyRecipientNifResult> {
  const { userId } = await auth();
  if (!userId) {
    return { kind: "error", error: "Debes iniciar sesión." };
  }

  const n = String(nif ?? "").trim();
  const nom = String(nombre ?? "").trim();
  if (!n || !nom) {
    return {
      kind: "error",
      error: "Indica NIF/CIF y razón social o nombre para verificar.",
    };
  }

  try {
    const { apiKey } = await ensureVerifactuApiKey(userId);
    const client = createSimplefactuClient({
      baseUrl: getSimplefactuBaseUrl(),
      apiKey,
    });

    const res = await client.postVerifyNif({ nif: n, nombre: nom });
    const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;

    if (!res.ok) {
      const errMsg =
        res.status === 403
          ? "La API key no tiene permiso nif:read. Revisa Ajustes → Verifactu o vuelve a provisionar la cuenta."
          : formatSimplefactuHttpError(res.status, json);
      return { kind: "error", error: errMsg };
    }

    const success = json.success === true;
    const resultado = json.resultado != null ? String(json.resultado).trim() : "";
    const outNif = json.nif != null ? String(json.nif).trim() : n;
    const outNombre = json.nombre != null ? String(json.nombre).trim() : nom;

    if (success) {
      return {
        kind: "identified",
        nif: outNif,
        nombre: outNombre,
        resultado: resultado || "Identificado",
      };
    }

    const message =
      typeof json.message === "string"
        ? json.message
        : resultado
          ? `Resultado: ${resultado}`
          : "No identificado ante AEAT.";

    return {
      kind: "not_identified",
      resultado: resultado || "—",
      message,
      nif: outNif,
      nombre: outNombre,
    };
  } catch (e) {
    return {
      kind: "error",
      error: e instanceof Error ? e.message : "Error al contactar Verifactu.",
    };
  }
}
