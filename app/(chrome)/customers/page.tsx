import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CustomerList } from "./CustomerList";

export default async function CustomersPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const customers = await prisma.customer.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    select: { id: true, name: true, nif: true, email: true, tipoPersona: true },
  });

  return (
    <div>
      <div className="mb-6">
        <Link href="/invoices" className="text-fg-muted hover:text-fg">
          ← Volver a facturas
        </Link>
      </div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Clientes</h1>
        <Link
          href="/invoices/new"
          className="rounded bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
        >
          Nueva factura (alta cliente)
        </Link>
      </div>
      <p className="mb-4 text-sm text-fg-muted">
        Los clientes se pueden crear al emitir una factura o editarlos aquí.
      </p>
      <CustomerList customers={customers} />
    </div>
  );
}
