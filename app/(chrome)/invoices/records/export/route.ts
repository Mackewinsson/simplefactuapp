import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  fetchInvoiceRecordsForExport,
  invoiceRecordsToCsv,
} from "@/lib/simplefactu/invoice-records-csv";
import { formatVerifactuActionError } from "@/lib/simplefactu/api-errors";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const from = url.searchParams.get("from")?.trim() || undefined;
  const to = url.searchParams.get("to")?.trim() || undefined;
  const serie = url.searchParams.get("serie")?.trim() || undefined;
  const tipoParam = url.searchParams.get("tipo")?.trim();
  const tipo =
    tipoParam === "ALTA" || tipoParam === "ANULACION" ? tipoParam : undefined;

  try {
    const rows = await fetchInvoiceRecordsForExport(userId, { from, to, serie, tipo });
    const csv = invoiceRecordsToCsv(rows);
    const stamp = new Date().toISOString().slice(0, 10);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="registro-aeat-${stamp}.csv"`,
      },
    });
  } catch (e) {
    const message = formatVerifactuActionError(e);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
