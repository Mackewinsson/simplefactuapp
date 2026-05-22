import { CreateSubtenantForm } from "../../CreateSubtenantForm";

export default function PartnerNewTenantPage() {
  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-xl font-semibold text-fg">Alta autónomo</h1>
      <p className="text-sm text-fg-muted">
        Crea un sub-tenant con NIF autorizado. Después podrás subir su certificado y emitir una
        API key desde el detalle.
      </p>
      <CreateSubtenantForm />
    </div>
  );
}
