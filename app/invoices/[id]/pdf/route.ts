import { NextRequest } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/money";

/* ── Layout constants ────────────────────────────────── */
const FALLBACK_COMPANY_NAME = process.env.INVOICE_COMPANY_NAME ?? "";
const PAGE_W = 595;
const PAGE_H = 842; // A4
const MARGIN = 50;
const CONTENT_W = PAGE_W - MARGIN * 2;

const FONT_SM = 9;
const FONT_MD = 10;
const FONT_LG = 16;
const FONT_TOTAL = 12;

const LH = 16; // normal line height
const LH_SM = 14; // tight line height
const GAP_SM = 14;
const GAP_MD = 26;

const GRAY = rgb(0.45, 0.45, 0.45);
const RULE_COLOR = rgb(0.8, 0.8, 0.8);
const ROW_RULE = rgb(0.92, 0.92, 0.92);
const BLACK = rgb(0, 0, 0);

/* ── Column right edges ──────────────────────────────── */
const RIGHT = MARGIN + CONTENT_W;
const COL_QTY = MARGIN + 260;
const COL_UNIT = MARGIN + 380;
const COL_AMT = RIGHT;
const AMT_RIGHT_PADDING = 4; // avoid amount touching edge (e.g. € clipping)
const TOTALS_AMOUNT_EDGE = RIGHT - AMT_RIGHT_PADDING;

function safeFilename(number: string): string {
  return number.replace(/[^a-zA-Z0-9-_]/g, "-");
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
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

  /* ── Setup ──────────────────────────────────────────── */
  const doc = await PDFDocument.create();
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const page = doc.addPage([PAGE_W, PAGE_H]);
  const { height } = page.getSize();
  let y = height - MARGIN;

  /* ── Helpers ────────────────────────────────────────── */
  const tw = (t: string, s: number, f = regular) => f.widthOfTextAtSize(t, s);

  const text = (
    t: string,
    x: number,
    opts: { size?: number; font?: typeof regular; color?: typeof BLACK } = {}
  ) => {
    page.drawText(t, {
      x,
      y,
      size: opts.size ?? FONT_MD,
      font: opts.font ?? regular,
      color: opts.color ?? BLACK,
    });
  };

  const textR = (
    t: string,
    edge: number,
    opts: { size?: number; font?: typeof regular; color?: typeof BLACK } = {}
  ) => {
    const s = opts.size ?? FONT_MD;
    const f = opts.font ?? regular;
    text(t, edge - tw(t, s, f), opts);
  };

  const rule = (x1: number, x2: number, color = RULE_COLOR) => {
    page.drawLine({
      start: { x: x1, y },
      end: { x: x2, y },
      thickness: 0.5,
      color,
    });
  };

  /* ── 1. Header ──────────────────────────────────────── */
  // Top-left: created-by name (from invoice) or env company name
  const createdByName = [invoice.createdByFirstName, invoice.createdByLastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  const topLeftLabel = createdByName || FALLBACK_COMPANY_NAME;
  if (topLeftLabel) {
    text(topLeftLabel, MARGIN, { size: FONT_LG, font: bold });
  }

  const invLabel = `Invoice ${invoice.number}`;
  textR(invLabel, RIGHT, { size: FONT_MD, font: bold });
  y -= LH + 2;

  textR(`Issue date: ${fmtDate(invoice.issueDate)}`, RIGHT, { size: FONT_SM, color: GRAY });
  y -= LH_SM;

  if (invoice.dueDate) {
    textR(`Due date: ${fmtDate(invoice.dueDate)}`, RIGHT, { size: FONT_SM, color: GRAY });
    y -= LH_SM;
  }

  y -= GAP_MD;

  /* ── 2. Bill To ─────────────────────────────────────── */
  text("BILL TO", MARGIN, { size: FONT_SM, font: bold, color: GRAY });
  y -= LH;
  text(invoice.customerName, MARGIN, { size: FONT_MD, font: bold });
  y -= LH;
  if (invoice.customerEmail) {
    text(invoice.customerEmail, MARGIN, { size: FONT_SM, color: GRAY });
    y -= LH_SM;
  }

  y -= GAP_MD;

  /* ── 3. Items table ─────────────────────────────────── */
  // Column headers
  text("Description", MARGIN, { size: FONT_SM, font: bold, color: GRAY });
  textR("Qty", COL_QTY, { size: FONT_SM, font: bold, color: GRAY });
  textR("Unit Price", COL_UNIT, { size: FONT_SM, font: bold, color: GRAY });
  textR("Amount", COL_AMT, { size: FONT_SM, font: bold, color: GRAY });
  y -= 12;
  rule(MARGIN, RIGHT);
  y -= 14;

  // Rows
  for (let i = 0; i < invoice.items.length; i++) {
    const item = invoice.items[i];
    const unitStr = formatCents(invoice.currency, item.unitPriceCents);
    const lineStr = formatCents(invoice.currency, item.lineTotalCents);
    const desc =
      item.description.length > 40
        ? item.description.slice(0, 38) + "..."
        : item.description;

    text(desc, MARGIN, { size: FONT_MD });
    textR(String(item.quantity), COL_QTY, { size: FONT_MD });
    textR(unitStr, COL_UNIT, { size: FONT_MD });
    textR(lineStr, COL_AMT, { size: FONT_MD });
    y -= LH;

    // Light separator between rows (skip after last)
    if (i < invoice.items.length - 1) {
      rule(MARGIN, RIGHT, ROW_RULE);
      y -= 4;
    }
  }

  y -= 6;
  rule(MARGIN, RIGHT);
  y -= GAP_SM;

  /* ── 4. Totals ──────────────────────────────────────── */
  const totalsLabelEdge = COL_UNIT - 20; // label column (more space before amount)
  const totalsAmountEdge = TOTALS_AMOUNT_EDGE;

  textR("Subtotal", totalsLabelEdge, { size: FONT_MD, color: GRAY });
  textR(formatCents(invoice.currency, invoice.subtotalCents), totalsAmountEdge, { size: FONT_MD });
  y -= LH;

  textR("Tax", totalsLabelEdge, { size: FONT_MD, color: GRAY });
  textR(formatCents(invoice.currency, invoice.taxCents), totalsAmountEdge, { size: FONT_MD });
  y -= LH;

  y -= 4;
  rule(totalsLabelEdge - 60, RIGHT);
  y -= 14;

  textR("Total", totalsLabelEdge, { size: FONT_TOTAL, font: bold });
  textR(formatCents(invoice.currency, invoice.totalCents), totalsAmountEdge, {
    size: FONT_TOTAL,
    font: bold,
  });
  y -= LH;

  y -= GAP_MD;

  /* ── 5. Notes ───────────────────────────────────────── */
  if (invoice.notes) {
    text("NOTES", MARGIN, { size: FONT_SM, font: bold, color: GRAY });
    y -= LH;
    for (const line of invoice.notes.replace(/\r\n/g, "\n").split(/\n/)) {
      if (y < MARGIN) break;
      text(line.slice(0, 90), MARGIN, { size: FONT_SM, color: GRAY });
      y -= LH_SM;
    }
  }

  /* ── Serialize ──────────────────────────────────────── */
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
