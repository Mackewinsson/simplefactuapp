/**
 * Human-readable labels and list badges for AEAT / Verifactu job states.
 */

import { statusBadgeClass } from "@/lib/ui/status-badge";

export type AeatStatusBadge = { label: string; className: string };

/** Maps Prisma job status + AEAT ESTADOENVIO to UI status key. */
export function resolveRegistrationUiStatus(
  aeatStatus: string,
  aeatEstadoEnvio?: string | null
): string {
  if (
    aeatStatus === "SUCCEEDED" &&
    aeatEstadoEnvio === "ParcialmenteCorrecto"
  ) {
    return "SUCCEEDED_WARN";
  }
  return aeatStatus;
}

function registrationBadgeClassName(
  status: string,
  aeatEstadoEnvio?: string | null
): string {
  const ui = resolveRegistrationUiStatus(status, aeatEstadoEnvio);
  switch (ui) {
    case "SUCCEEDED":
      return statusBadgeClass("success");
    case "SUCCEEDED_WARN":
      return statusBadgeClass("warning");
    case "PENDING":
    case "PROCESSING":
      return statusBadgeClass("warning");
    case "FAILED":
    case "DEAD":
      return statusBadgeClass("danger");
    case "NOT_SENT":
    default:
      return statusBadgeClass("neutral");
  }
}

/** Compact badge for invoice list rows (also respects successful cancellation). */
export function registrationStatusBadge(
  status: string,
  cancellationStatus: string,
  aeatEstadoEnvio?: string | null
): AeatStatusBadge {
  if (cancellationStatus === "SUCCEEDED") {
    return {
      label: "Anulada",
      className: `${statusBadgeClass("neutral")} line-through opacity-80`,
    };
  }
  const ui = resolveRegistrationUiStatus(status, aeatEstadoEnvio);
  switch (ui) {
    case "SUCCEEDED":
      return { label: "Registrada", className: statusBadgeClass("success") };
    case "SUCCEEDED_WARN":
      return { label: "Aceptada con avisos", className: statusBadgeClass("warning") };
    case "PENDING":
    case "PROCESSING":
      return { label: "Enviando…", className: statusBadgeClass("warning") };
    case "FAILED":
    case "DEAD":
      return { label: "Error", className: statusBadgeClass("danger") };
    default:
      return { label: "No enviada", className: statusBadgeClass("neutral") };
  }
}

/** Longer copy for invoice detail / Verifactu panel. */
export function registrationStatusDetailLabel(status: string): string {
  switch (status) {
    case "NOT_SENT":
      return "Borrador — aún no enviada a Verifactu";
    case "PENDING":
      return "En cola o enviándose a Verifactu…";
    case "PROCESSING":
      return "Procesándose en el servidor AEAT…";
    case "SUCCEEDED":
      return "Registrada correctamente en Verifactu";
    case "SUCCEEDED_WARN":
      return "Aceptada con advertencias en Verifactu (revisa el detalle)";
    case "FAILED":
      return "Error al enviar (puedes reintentar)";
    case "DEAD":
      return "Rechazada — sin reintento automático";
    default:
      return status;
  }
}

export function cancellationStatusDetailLabel(status: string): string {
  switch (status) {
    case "NONE":
      return "Sin solicitud de anulación";
    case "PENDING":
      return "Anulación en curso…";
    case "SUCCEEDED":
      return "Anulada en Verifactu";
    case "FAILED":
      return "Error al anular (puedes reintentar)";
    case "DEAD":
      return "Anulación rechazada — sin reintento automático";
    default:
      return status;
  }
}

export function registrationStatusBadgeClass(
  status: string,
  aeatEstadoEnvio?: string | null
): string {
  return registrationBadgeClassName(status, aeatEstadoEnvio);
}

export function cancellationStatusBadgeClass(status: string): string {
  switch (status) {
    case "SUCCEEDED":
      return statusBadgeClass("success");
    case "PENDING":
      return statusBadgeClass("warning");
    case "FAILED":
    case "DEAD":
      return statusBadgeClass("danger");
    case "NONE":
    default:
      return statusBadgeClass("neutral");
  }
}
