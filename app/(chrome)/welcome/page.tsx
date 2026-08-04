import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import {
  getUserAccountType,
  isSandboxAutoApproveIntegrators,
  shouldSkipWelcome,
} from "@/lib/auth/account-type";
import { getDefaultAppRedirect } from "@/lib/auth/app-role";
import { WelcomeAccountTypePicker } from "./WelcomeAccountTypePicker";

export const dynamic = "force-dynamic";

export default async function WelcomePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const accountType = await getUserAccountType(userId);
  if (accountType === "autonomo") {
    redirect("/invoices");
  }
  if (accountType === "integrator") {
    redirect(isSandboxAutoApproveIntegrators() ? "/partner" : "/partner/activation");
  }

  if (await shouldSkipWelcome(userId)) {
    redirect(await getDefaultAppRedirect(userId));
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 font-display animate-fade-in-up">
      <div className="text-center sm:text-left">
        <p className="text-xs font-bold uppercase tracking-widest text-accent">Bienvenido</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-fg sm:text-3.5xl">
          ¿Cómo vas a usar Simple*Factu?
        </h1>
        <p className="mt-3 max-w-xl text-sm font-medium leading-relaxed text-fg-muted font-sans">
          Elige el tipo de cuenta. Si eres integrador API o gestoría, te guiamos
          primero por el sandbox para que pruebes sin riesgo antes de producción.
        </p>
      </div>
      <WelcomeAccountTypePicker />
    </div>
  );
}
