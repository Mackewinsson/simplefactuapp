import Link from "next/link";

export type InvoiceVista = "sin-enviar" | "verifactu";

type Props = {
  current: InvoiceVista;
  sinEnviarCount: number;
  verifactuCount: number;
  hrefVerifactu: string;
  hrefSinEnviar: string;
};

export function InvoiceViewTabs({
  current,
  sinEnviarCount,
  verifactuCount,
  hrefVerifactu,
  hrefSinEnviar,
}: Props) {
  const tabClass = (active: boolean) =>
    active
      ? "flex-1 rounded-md bg-surface px-3 py-2.5 text-center text-sm font-semibold text-fg shadow-sm ring-1 ring-outline-soft/80 sm:flex-none sm:min-w-[10rem] sm:px-5"
      : "flex-1 rounded-md px-3 py-2.5 text-center text-sm font-medium text-fg-muted transition hover:bg-surface-hover/80 hover:text-fg sm:flex-none sm:min-w-[10rem] sm:px-5";

  return (
    <div className="mb-5">
      <p className="mb-2 text-xs leading-snug text-fg-subtle sm:text-sm">
        {current === "sin-enviar"
          ? "Facturas creadas que aún no se han enviado a Verifactu."
          : "Envíos o registros en curso con el servicio Verifactu (pendiente, aceptada, fallida…)."}
      </p>
      <div
        className="flex w-full gap-1 rounded-lg bg-surface-muted p-1 sm:inline-flex sm:w-auto"
        role="tablist"
        aria-label="Vista de facturas"
      >
        <Link
          href={hrefVerifactu}
          role="tab"
          aria-selected={current === "verifactu"}
          className={tabClass(current === "verifactu")}
        >
          Verifactu
          <span className="ml-1.5 tabular-nums text-xs font-normal text-fg-subtle">({verifactuCount})</span>
        </Link>
        <Link
          href={hrefSinEnviar}
          role="tab"
          aria-selected={current === "sin-enviar"}
          className={tabClass(current === "sin-enviar")}
        >
          Por enviar
          <span className="ml-1.5 tabular-nums text-xs font-normal text-fg-subtle">({sinEnviarCount})</span>
        </Link>
      </div>
    </div>
  );
}
