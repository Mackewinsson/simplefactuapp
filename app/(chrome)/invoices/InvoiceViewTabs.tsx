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
      ? "flex-1 rounded-md bg-white px-3 py-2.5 text-center text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-gray-200/80 sm:flex-none sm:min-w-[10rem] sm:px-5"
      : "flex-1 rounded-md px-3 py-2.5 text-center text-sm font-medium text-gray-600 transition hover:bg-gray-50/80 hover:text-gray-900 sm:flex-none sm:min-w-[10rem] sm:px-5";

  return (
    <div className="mb-5">
      <p className="mb-2 text-xs leading-snug text-gray-500 sm:text-sm">
        {current === "sin-enviar"
          ? "Facturas creadas que aún no se han enviado a Verifactu."
          : "Envíos o registros en curso con el servicio Verifactu (pendiente, aceptada, fallida…)."}
      </p>
      <div
        className="flex w-full gap-1 rounded-lg bg-gray-100 p-1 sm:inline-flex sm:w-auto"
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
          <span className="ml-1.5 tabular-nums text-xs font-normal text-gray-500">({verifactuCount})</span>
        </Link>
        <Link
          href={hrefSinEnviar}
          role="tab"
          aria-selected={current === "sin-enviar"}
          className={tabClass(current === "sin-enviar")}
        >
          Por enviar
          <span className="ml-1.5 tabular-nums text-xs font-normal text-gray-500">({sinEnviarCount})</span>
        </Link>
      </div>
    </div>
  );
}
