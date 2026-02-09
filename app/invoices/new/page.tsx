import Link from "next/link";
import { NewInvoiceForm } from "./NewInvoiceForm";

export default function NewInvoicePage() {
  return (
    <div>
      <div className="mb-6">
        <Link href="/invoices" className="text-gray-600 hover:text-gray-900">
          ← Back to invoices
        </Link>
      </div>
      <h1 className="mb-6 text-2xl font-semibold">New invoice</h1>
      <NewInvoiceForm />
    </div>
  );
}
