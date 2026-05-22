import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";
import QRCode from "qrcode";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { AeatCancellationStatus, AeatJobStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/money";

/* ── Layout constants ────────────────────────────────── */
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
const RED = rgb(0.8, 0.1, 0.1);

/* ── Column right edges ──────────────────────────────── */
const RIGHT = MARGIN + CONTENT_W;
const COL_QTY = MARGIN + 260;
const COL_UNIT = MARGIN + 380;
const COL_AMT = RIGHT;
const AMT_RIGHT_PADDING = 4; // avoid amount touching edge (e.g. € clipping)
const TOTALS_AMOUNT_EDGE = RIGHT - AMT_RIGHT_PADDING;

/** QR image size in PDF points (72 pt ≈ 1 in). */
const VERIFACTU_QR_PDF_PT = 108;

function safeFilename(number: string): string {
  return number.replace(/[^a-zA-Z0-9-_]/g, "-");
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString("es", {
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

  if (invoice.aeatStatus !== AeatJobStatus.SUCCEEDED) {
    return new NextResponse(
      "El PDF está disponible cuando la factura se ha registrado correctamente en Verifactu (AEAT).",
      { status: 403, headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
  }

  const account = await prisma.userVerifactuAccount.findUnique({
    where: { userId },
    select: { issuerNif: true, issuerLegalName: true },
  });
  const issuerName = (account?.issuerLegalName || "").trim();
  const issuerNif = (account?.issuerNif || "").trim();
  if (!issuerName) {
    return new NextResponse(
      "Configura la razón social del emisor en Ajustes → Verifactu antes de descargar el PDF.",
      { status: 403, headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
  }

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
  // Left: fiscal issuer (Verifactu profile); Right: invoice reference block
  const isCancelled =
    invoice.aeatCancellationStatus === AeatCancellationStatus.SUCCEEDED;

  text(issuerName, MARGIN, { size: FONT_LG, font: bold });
  const invLabel = isCancelled
    ? `Factura ${invoice.number} — ANULADA`
    : `Factura ${invoice.number}`;
  textR(invLabel, RIGHT, {
    size: FONT_LG,
    font: bold,
    color: isCancelled ? RED : BLACK,
  });
  y -= LH + 6;

  if (issuerNif) {
    text(`NIF: ${issuerNif}`, MARGIN, { size: FONT_SM, color: GRAY });
    y -= LH_SM;
  }

  textR(`Fecha: ${fmtDate(invoice.issueDate)}`, RIGHT, { size: FONT_SM, color: GRAY });
  y -= LH_SM;

  if (invoice.dueDate) {
    textR(`Vencimiento: ${fmtDate(invoice.dueDate)}`, RIGHT, { size: FONT_SM, color: GRAY });
    y -= LH_SM;
  }

  y -= GAP_MD;

  /* ── 1b. Cancelled banner ───────────────────────────── */
  if (isCancelled) {
    // Draw filled red banner
    page.drawRectangle({
      x: MARGIN,
      y: y - 20,
      width: CONTENT_W,
      height: 22,
      color: rgb(0.95, 0.22, 0.22),
      opacity: 0.12,
    });
    const bannerText = "FACTURA ANULADA — Anulación registrada en Veri*Factu (AEAT)";
    const bannerX = MARGIN + CONTENT_W / 2 - tw(bannerText, FONT_SM, bold) / 2;
    page.drawText(bannerText, {
      x: bannerX,
      y: y - 14,
      size: FONT_SM,
      font: bold,
      color: RED,
    });
    y -= 34;
  }

  /* ── 2. Bill To ─────────────────────────────────────── */
  text("DATOS DEL CLIENTE", MARGIN, { size: FONT_SM, font: bold, color: GRAY });
  y -= LH;
  text(invoice.customerName, MARGIN, { size: FONT_MD, font: bold });
  y -= LH;
  if (invoice.customerNif) {
    text(`NIF/CIF: ${invoice.customerNif}`, MARGIN, { size: FONT_SM, color: GRAY });
    y -= LH_SM;
  }
  if (invoice.customerEmail) {
    text(invoice.customerEmail, MARGIN, { size: FONT_SM, color: GRAY });
    y -= LH_SM;
  }

  y -= GAP_MD;

  /* ── 3. Items table ─────────────────────────────────── */
  // Column headers
  text("Concepto", MARGIN, { size: FONT_SM, font: bold, color: GRAY });
  textR("Cant.", COL_QTY, { size: FONT_SM, font: bold, color: GRAY });
  textR("Precio u.", COL_UNIT, { size: FONT_SM, font: bold, color: GRAY });
  textR("Importe", COL_AMT, { size: FONT_SM, font: bold, color: GRAY });
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

  textR("Base imponible", totalsLabelEdge, { size: FONT_MD, color: GRAY });
  textR(formatCents(invoice.currency, invoice.subtotalCents), totalsAmountEdge, { size: FONT_MD });
  y -= LH;

  textR("IVA", totalsLabelEdge, { size: FONT_MD, color: GRAY });
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

  /* ── 4b. Verifactu (AEAT) ───────────────────────────── */
  const hasAeatSubmission = !!(invoice.aeatCsv?.trim() || invoice.aeatStatus === "SUCCEEDED");
  const qrPayload = hasAeatSubmission ? invoice.aeatQrText?.trim() || null : null;
  if (invoice.aeatCsv || qrPayload) {
    const dim = VERIFACTU_QR_PDF_PT; // 108pt
    const qrX = RIGHT - dim;
    const sectionTopY = y;

    // Left column: label + CSV + verification note
    text("VERIFACTU (AEAT)", MARGIN, { size: FONT_SM, font: bold, color: GRAY });
    y -= LH;

    if (invoice.aeatCsv) {
      text(`CSV: ${invoice.aeatCsv}`, MARGIN, { size: FONT_SM, color: GRAY });
      y -= LH_SM;
    }

    // Short verification note instead of the full URL (URL is encoded in the QR)
    if (qrPayload) {
      text("Escanea el código QR para verificar", MARGIN, { size: FONT_SM, color: GRAY });
      y -= LH_SM;
      text("en la sede electrónica de la AEAT.", MARGIN, { size: FONT_SM, color: GRAY });
      y -= LH_SM;
    }

    // Right column: QR image
    if (qrPayload) {
      try {
        const pngBuffer = await QRCode.toBuffer(qrPayload, {
          type: "png",
          width: 240,
          margin: 1,
          errorCorrectionLevel: "M",
        });
        const qrImage = await doc.embedPng(pngBuffer);
        page.drawImage(qrImage, {
          x: qrX,
          y: sectionTopY - dim,
          width: dim,
          height: dim,
        });
        // Ensure y advances past the QR bottom
        const qrBottom = sectionTopY - dim;
        if (y > qrBottom) y = qrBottom;
      } catch {
        text("(QR no disponible)", MARGIN, { size: FONT_SM, color: GRAY });
        y -= LH_SM;
      }
    }

    y -= GAP_SM;
  }

  /* ── 5. Notes ───────────────────────────────────────── */
  if (invoice.notes) {
    text("NOTAS", MARGIN, { size: FONT_SM, font: bold, color: GRAY });
    y -= LH;
    for (const line of invoice.notes.replace(/\r\n/g, "\n").split(/\n/)) {
      if (y < MARGIN) break;
      text(line.slice(0, 90), MARGIN, { size: FONT_SM, color: GRAY });
      y -= LH_SM;
    }
  }

  /* ── Watermark (cancelled) ──────────────────────────── */
  if (isCancelled) {
    page.drawText("ANULADA", {
      x: 90,
      y: PAGE_H / 2 - 60,
      size: 110,
      font: bold,
      color: rgb(0.85, 0.1, 0.1),
      opacity: 0.07,
      rotate: degrees(45),
    });
  }

  /* ── Serialize ──────────────────────────────────────── */
  const pdfBytes = await doc.save();
  const suffix = isCancelled ? "-anulada" : "";
  const filename = `factura-${safeFilename(invoice.number)}${suffix}.pdf`;
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
