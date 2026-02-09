import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { NewInvoiceForm } from "./NewInvoiceForm";

export default async function NewInvoicePage() {
  const user = await currentUser();
  return (
    <div>
      <div className="mb-6">
        <Link href="/invoices" className="text-gray-600 hover:text-gray-900">
          ← Back to invoices
        </Link>
      </div>
      <h1 className="mb-6 text-2xl font-semibold">New invoice</h1>
      <NewInvoiceForm
        defaultCreatedByFirstName={user?.firstName ?? ""}
        defaultCreatedByLastName={user?.lastName ?? ""}
      />
    </div>
  );
}
