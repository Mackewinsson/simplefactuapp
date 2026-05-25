import { CreateSubtenantForm } from "../../CreateSubtenantForm";

export default function PartnerNewTenantPage() {
  return (
    <div className="max-w-xl space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-fg font-display">
          Agregar cliente
        </h1>
        <p className="mt-1 text-sm text-fg-muted font-medium">
          Introduce los datos del cliente. Después podrás subir su certificado
          y generar una API key desde su ficha.
        </p>
      </div>
      <CreateSubtenantForm />
    </div>
  );
}
