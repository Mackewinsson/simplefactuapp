import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/money";

type Props = { params: Promise<{ id: string }> };

export default async function InvoiceDetailPage({ params }: Props) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id, userId },
    include: { items: true },
  });

  if (!invoice) notFound();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <Link href="/invoices" className="text-gray-600 hover:text-gray-900">
          ← Back to invoices
        </Link>
        <a
          href={`/invoices/${invoice.id}/pdf`}
          className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          download
        >
          Download PDF
        </a>
      </div>

      <div className="rounded border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-4 py-4">
          <h1 className="text-xl font-semibold">{invoice.number}</h1>
          <dl className="mt-2 grid gap-1 text-sm text-gray-700 sm:grid-cols-2">
            <div>
              <span className="font-medium">Customer:</span> {invoice.customerName}
            </div>
            {invoice.customerEmail ? (
              <div>
                <span className="font-medium">Email:</span> {invoice.customerEmail}
              </div>
            ) : null}
            <div>
              <span className="font-medium">Issue date:</span>{" "}
              {invoice.issueDate.toLocaleDateString()}
            </div>
            {invoice.dueDate ? (
              <div>
                <span className="font-medium">Due date:</span>{" "}
                {invoice.dueDate.toLocaleDateString()}
              </div>
            ) : null}
          </dl>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[400px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 font-medium text-gray-900">Description</th>
                <th className="px-4 py-3 font-medium text-gray-900">Qty</th>
                <th className="px-4 py-3 font-medium text-gray-900">Unit price</th>
                <th className="px-4 py-3 font-medium text-gray-900 text-right">
                  Line total
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-100 last:border-0"
                >
                  <td className="px-4 py-3">{item.description}</td>
                  <td className="px-4 py-3">{item.quantity}</td>
                  <td className="px-4 py-3">
                    {formatCents(invoice.currency, item.unitPriceCents)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatCents(invoice.currency, item.lineTotalCents)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-gray-200 px-4 py-3 text-sm">
          <div className="ml-auto flex max-w-xs flex-col gap-1 text-right">
            <div className="flex justify-between gap-4">
              <span className="text-gray-600">Subtotal</span>
              <span>{formatCents(invoice.currency, invoice.subtotalCents)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-600">Tax</span>
              <span>{formatCents(invoice.currency, invoice.taxCents)}</span>
            </div>
            <div className="flex justify-between gap-4 border-t border-gray-200 pt-2 font-medium">
              <span>Total</span>
              <span>{formatCents(invoice.currency, invoice.totalCents)}</span>
            </div>
          </div>
        </div>

        {invoice.notes ? (
          <div className="border-t border-gray-200 px-4 py-3 text-sm text-gray-600">
            <span className="font-medium text-gray-700">Notes:</span> {invoice.notes}
          </div>
        ) : null}
      </div>
    </div>
  );
}
