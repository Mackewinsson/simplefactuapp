import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/money";

const PAGE_SIZE = 50;
const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "short" });

export const dynamic = "force-dynamic";

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
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 font-medium text-gray-900">Number</th>
                <th className="px-4 py-3 font-medium text-gray-900">Customer</th>
                <th className="px-4 py-3 font-medium text-gray-900">Issue Date</th>
                <th className="px-4 py-3 font-medium text-gray-900">Total</th>
                <th className="px-4 py-3 font-medium text-gray-900">Created</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv: InvoiceRow) => (
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
                  <td className="px-4 py-3 text-gray-700">{inv.customerName}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {dateFormat.format(inv.issueDate)}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {formatCents(inv.currency, inv.totalCents)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {dateFormat.format(inv.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
