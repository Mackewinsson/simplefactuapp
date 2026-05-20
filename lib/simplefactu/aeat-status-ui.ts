/**
 * Human-readable labels and list badges for AEAT / Verifactu job states.
 */

export type AeatStatusBadge = { label: string; className: string };

/** Compact badge for invoice list rows (also respects successful cancellation). */
export function registrationStatusBadge(
  status: string,
  cancellationStatus: string
): AeatStatusBadge {
  if (cancellationStatus === "SUCCEEDED") {
    return {
      label: "Anulada",
      className: "line-through text-fg-subtle bg-surface-muted",
    };
  }
  switch (status) {
    case "SUCCEEDED":
      return { label: "Registrada", className: "text-success-foreground bg-success-hover" };
    case "PENDING":
    case "PROCESSING":
      return { label: "Enviando…", className: "text-warning-deep bg-warning-hover" };
    case "FAILED":
    case "DEAD":
      return { label: "Error", className: "text-danger-foreground bg-danger-hover" };
    default:
      return { label: "No enviada", className: "text-fg-subtle bg-surface-muted" };
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

export function registrationStatusBadgeClass(status: string): string {
  switch (status) {
    case "SUCCEEDED":
      return "text-success-foreground bg-success-hover";
    case "PENDING":
    case "PROCESSING":
      return "text-warning-deep bg-warning-hover";
    case "FAILED":
    case "DEAD":
      return "text-danger-foreground bg-danger-hover";
    case "NOT_SENT":
    default:
      return "text-fg-muted bg-surface-muted";
  }
}

export function cancellationStatusBadgeClass(status: string): string {
  switch (status) {
    case "SUCCEEDED":
      return "text-success-foreground bg-success-hover";
    case "PENDING":
      return "text-warning-deep bg-warning-hover";
    case "FAILED":
    case "DEAD":
      return "text-danger-foreground bg-danger-hover";
    case "NONE":
    default:
      return "text-fg-muted bg-surface-muted";
  }
}
