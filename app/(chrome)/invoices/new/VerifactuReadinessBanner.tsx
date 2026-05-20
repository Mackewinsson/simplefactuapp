import Link from "next/link";
import type { VerifactuReadiness } from "@/lib/verifactu/readiness";

type Props = {
  readiness: VerifactuReadiness;
};

/**
 * Shown on /invoices/new when Verifactu is not fully configured.
 * Prevents silent failures after submit when sendToAeat is checked.
 */
export function VerifactuReadinessBanner({ readiness }: Props) {
  if (readiness.provisionError) {
    return (
      <div className="mb-6 rounded border border-danger-outline bg-danger p-4 text-sm text-danger-foreground">
        <p className="font-medium">No se pudo conectar con Verifactu</p>
        <p className="mt-2">{readiness.provisionError}</p>
        <p className="mt-3 text-danger-deep">
          Si acabas de desplegar, comprueba que{" "}
          <code className="rounded bg-surface-muted px-1">SIMPLEFACTU_ADMIN_KEY</code> en el front
          coincide con <code className="rounded bg-surface-muted px-1">ADMIN_KEY</code> del API del
          mismo entorno.
        </p>
        <Link href="/settings/verifactu" className="mt-3 inline-block text-sm font-medium underline">
          Ir a Ajustes → Verifactu
        </Link>
      </div>
    );
  }

  const missing: { label: string; href: string }[] = [];
  if (!readiness.issuerReady) {
    missing.push({ label: "Datos del emisor (NIF y razón social)", href: "/settings/verifactu" });
  }
  if (!readiness.certificateReady) {
    missing.push({ label: "Certificado AEAT (.pfx)", href: "/settings/verifactu" });
  }

  if (missing.length === 0) return null;

  return (
    <div className="mb-6 rounded border border-warning-outline bg-warning p-4 text-sm text-warning-foreground">
      <p className="font-medium">Antes de enviar a AEAT</p>
      <p className="mt-1 text-warning-deep">
        Puedes guardar la factura en borrador, pero el envío a Verifactu fallará hasta completar:
      </p>
      <ul className="mt-2 list-inside list-disc">
        {missing.map((m) => (
          <li key={m.label}>
            <Link href={m.href} className="font-medium underline hover:text-warning-deeper">
              {m.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
