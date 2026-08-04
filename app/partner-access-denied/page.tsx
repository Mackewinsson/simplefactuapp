import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getUserAccountType } from "@/lib/auth/account-type";

export default async function PartnerAccessDeniedPage() {
  const { userId } = await auth();
  const accountType = userId ? await getUserAccountType(userId) : null;

  if (accountType === "integrator") {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <h1 className="text-xl font-semibold text-fg">Activación de producción pendiente</h1>
        <p className="text-sm text-fg-muted">
          Tu cuenta de integrador aún no tiene acceso a la consola de producción.
          Prueba primero en sandbox y solicita la activación.
        </p>
        <Link href="/partner/activation" className="btn btn-primary inline-flex">
          Ir a activación →
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <h1 className="text-xl font-semibold text-fg">Acceso al panel de gestoría</h1>
      <p className="text-sm text-fg-muted">
        Tu cuenta no tiene permisos de partner (gestoría). Este panel permite gestionar
        autónomos vinculados sin usar la clave de administración global.
      </p>
      <div className="rounded-lg border border-outline bg-surface-muted px-4 py-3 text-sm text-fg-muted">
        <p className="font-medium text-fg">Cómo habilitar el acceso</p>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>
            Si eres integrador API, completa el flujo en{" "}
            <Link href="/partner/activation" className="text-accent underline-offset-2 hover:underline">
              /partner/activation
            </Link>
            .
          </li>
          <li>
            O pide a un operador que te asigne{" "}
            <code className="text-xs">publicMetadata.role = &quot;partner&quot;</code> en Clerk.
          </li>
        </ul>
        {userId ? (
          <p className="mt-3 break-all text-xs text-fg-subtle">
            Tu <span className="font-medium">userId</span>:{" "}
            <code className="rounded bg-surface px-1 py-0.5">{userId}</code>
          </p>
        ) : null}
      </div>
      <Link
        href="/invoices"
        className="inline-block text-sm font-medium text-fg underline-offset-2 hover:underline"
      >
        Volver a facturas
      </Link>
    </div>
  );
}
