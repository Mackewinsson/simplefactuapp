import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/money";
import { extractSerie } from "@/lib/simplefactu/invoice-series";

const PAGE_SIZE = 50;
const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "short" });

export const dynamic = "force-dynamic";

type AeatStatus = string;

function aeatStatusBadge(
  status: AeatStatus,
  cancellationStatus: AeatStatus
): { label: string; className: string } {
  if (cancellationStatus === "SUCCEEDED") {
    return {
      label: "Anulada",
      className: "line-through text-gray-400 bg-gray-100",
    };
  }
  switch (status) {
    case "SUCCEEDED":
      return { label: "Registrada", className: "text-green-800 bg-green-100" };
    case "PENDING":
    case "PROCESSING":
      return { label: "Enviando…", className: "text-amber-800 bg-amber-100" };
    case "FAILED":
    case "DEAD":
      return { label: "Error", className: "text-red-800 bg-red-100" };
    default:
      return { label: "No enviada", className: "text-gray-500 bg-gray-100" };
  }
}

export default async function InvoicesPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const invoices = await prisma.invoice.findMany({
    where: { userId },
    take: PAGE_SIZE,
    orderBy: { createdAt: "desc" },
  });
  type InvoiceRow = (typeof invoices)[number];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Invoices</h1>
        <Link
          href="/invoices/new"
          className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          New invoice
        </Link>
      </div>

      {invoices.length === 0 ? (
        <div className="rounded border border-gray-200 bg-white p-8 text-center">
          <p className="mb-4 text-gray-600">No invoices yet.</p>
          <Link
            href="/invoices/new"
            className="inline-block rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Create invoice
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded border border-gray-200 bg-white">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 font-medium text-gray-900">Number</th>
                <th className="px-4 py-3 font-medium text-gray-900">Serie</th>
                <th className="px-4 py-3 font-medium text-gray-900">Customer</th>
                <th className="px-4 py-3 font-medium text-gray-900">Issue Date</th>
                <th className="px-4 py-3 font-medium text-gray-900">Total</th>
                <th className="px-4 py-3 font-medium text-gray-900">AEAT</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv: InvoiceRow) => {
                const badge = aeatStatusBadge(
                  inv.aeatStatus,
                  inv.aeatCancellationStatus
                );
                return (
                  <tr
                    key={inv.id}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/invoices/${inv.id}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {inv.number}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600 font-mono">
                        {extractSerie(inv.number)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{inv.customerName}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {dateFormat.format(inv.issueDate)}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {formatCents(inv.currency, inv.totalCents)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded px-1.5 py-0.5 text-xs font-medium ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
