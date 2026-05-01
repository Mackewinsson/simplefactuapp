import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { NewInvoiceForm } from "./NewInvoiceForm";
import { prisma } from "@/lib/prisma";
import { extractSerie } from "@/lib/simplefactu/invoice-series";

export default async function NewInvoicePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();

  const invoiceNumbers = await prisma.invoice.findMany({
    where: { userId },
    select: { number: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  const existingSeries = [
    ...new Set(invoiceNumbers.map((i) => extractSerie(i.number))),
  ];

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
        existingSeries={existingSeries}
      />
    </div>
  );
}
