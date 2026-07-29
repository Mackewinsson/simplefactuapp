import { CreateSubtenantForm } from "../../CreateSubtenantForm";

export default function PartnerNewTenantPage() {
  return (
    <div className="max-w-xl space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-fg font-display">
          Alta de NIF Emisor / Empresa
        </h1>
        <p className="mt-1 text-sm text-fg-muted font-medium">
          Introduce los datos fiscales de la empresa o autónomo. Cada NIF registrado actúa como emisor independiente con su propio certificado digital.
        </p>
      </div>
      <CreateSubtenantForm />
    </div>
  );
}
