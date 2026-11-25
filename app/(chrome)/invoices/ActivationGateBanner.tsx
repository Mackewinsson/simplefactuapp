import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import {
  getUserAccountType,
  isPendingIntegrator,
  needsAccountTypeSelection,
} from "@/lib/auth/account-type";
import {
  getLatestActivationRequest,
  isAutonomoProductionActivated,
  isSandboxAutoApproveActivation,
} from "@/lib/verifactu/activation";

/**
 * Shown on invoice list/new when setup is done but production send is not approved.
 */
export async function ActivationGateBanner() {
  const { userId } = await auth();
  if (!userId) return null;
  if (isSandboxAutoApproveActivation()) return null;
  if (await isPendingIntegrator(userId)) return null;
  if (await needsAccountTypeSelection(userId)) return null;
  const accountType = await getUserAccountType(userId);
  if (accountType === "integrator") return null;

  if (await isAutonomoProductionActivated(userId)) return null;

  const latest = await getLatestActivationRequest(userId, "AUTONOMO");
  const pending = latest?.status === "PENDING";
  const rejected = latest?.status === "REJECTED";

  return (
    <div role="status" className="alert-warning mb-6">
      <p className="font-medium">
        {pending
          ? "Solicitud de activación pendiente"
          : rejected
            ? "Activación rechazada — vuelve a solicitarla"
            : "Cuenta sin activar"}
      </p>
      <p className="mt-1 text-warning-deep">
        Puedes crear borradores, pero el envío a AEAT está bloqueado hasta que aprobemos tu
        solicitud.
      </p>
      <Link
        href="/settings/activation"
        className="mt-3 inline-block text-sm font-medium underline hover:text-warning-deeper"
      >
        {pending ? "Ver estado de la solicitud" : "Solicitar activación"}
      </Link>
    </div>
  );
}
