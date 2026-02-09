import { NextRequest } from "next/server";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/money";

const COMPANY_NAME = "My Company";
const MARGIN = 50;
const LINE_HEIGHT = 14;
const FONT_SIZE = 11;
const FONT_SIZE_TITLE = 16;

function safeFilename(number: string): string {
  return number.replace(/[^a-zA-Z0-9-_]/g, "-");
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id, userId },
    include: { items: true },
  });

  if (!invoice) notFound();

  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const page = doc.addPage([595, 842]); // A4
  const { width, height } = page.getSize();
  let y = height - MARGIN;

  function draw(text: string, opts: { size?: number; x?: number } = {}) {
    const size = opts.size ?? FONT_SIZE;
    const x = opts.x ?? MARGIN;
    page.drawText(text, { x, y, size, font });
    y -= LINE_HEIGHT;
  }

  draw(COMPANY_NAME, { size: FONT_SIZE_TITLE });
  y -= 4;

  draw(`Invoice: ${invoice.number}`);
  draw(`Issue date: ${invoice.issueDate.toLocaleDateString()}`);
  if (invoice.dueDate) {
    draw(`Due date: ${invoice.dueDate.toLocaleDateString()}`);
  }
  draw(`Customer: ${invoice.customerName}`);
  if (invoice.customerEmail) {
    draw(`Email: ${invoice.customerEmail}`);
  }
  y -= LINE_HEIGHT;

  draw("Items", { size: FONT_SIZE });
  const colDesc = MARGIN;
  const colQty = 320;
  const colUnit = 380;
  const colTotal = 480;

  page.drawText("Description", { x: colDesc, y, size: FONT_SIZE, font });
  page.drawText("Qty", { x: colQty, y, size: FONT_SIZE, font });
  page.drawText("Unit", { x: colUnit, y, size: FONT_SIZE, font });
  page.drawText("Total", { x: colTotal, y, size: FONT_SIZE, font });
  y -= LINE_HEIGHT;

  for (const item of invoice.items) {
    const unitStr = formatCents(invoice.currency, item.unitPriceCents);
    const lineStr = formatCents(invoice.currency, item.lineTotalCents);
    const desc = item.description.slice(0, 35);
    page.drawText(desc, { x: colDesc, y, size: FONT_SIZE, font });
    page.drawText(String(item.quantity), { x: colQty, y, size: FONT_SIZE, font });
    page.drawText(unitStr, { x: colUnit, y, size: FONT_SIZE, font });
    page.drawText(lineStr, { x: colTotal, y, size: FONT_SIZE, font });
    y -= LINE_HEIGHT;
  }
  y -= LINE_HEIGHT;

  page.drawText("Subtotal:", { x: colDesc, y, size: FONT_SIZE, font });
  page.drawText(formatCents(invoice.currency, invoice.subtotalCents), { x: colTotal, y, size: FONT_SIZE, font });
  y -= LINE_HEIGHT;
  page.drawText("Tax:", { x: colDesc, y, size: FONT_SIZE, font });
  page.drawText(formatCents(invoice.currency, invoice.taxCents), { x: colTotal, y, size: FONT_SIZE, font });
  y -= LINE_HEIGHT;
  page.drawText("Total:", { x: colDesc, y, size: FONT_SIZE, font });
  page.drawText(formatCents(invoice.currency, invoice.totalCents), { x: colTotal, y, size: FONT_SIZE, font });
  y -= LINE_HEIGHT;

  if (invoice.notes) {
    y -= 4;
    draw("Notes:", { size: FONT_SIZE });
    const noteLines = invoice.notes.replace(/\r\n/g, "\n").split(/\n/);
    for (const line of noteLines) {
      if (y < MARGIN) break;
      page.drawText(line.slice(0, 80), { x: MARGIN, y, size: FONT_SIZE, font });
      y -= LINE_HEIGHT;
    }
  }

  const pdfBytes = await doc.save();
  const filename = `invoice-${safeFilename(invoice.number)}.pdf`;
  const body = Buffer.from(pdfBytes);

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(body.length),
    },
  });
}
