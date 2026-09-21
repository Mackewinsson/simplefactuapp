import { getAdminNotifyEmail, getFromEmail, getResend } from "./client";

/* ── Lead notification ──────────────────────────────── */

type LeadNotificationParams = {
  name: string;
  email: string;
  type: string;
  message?: string | null;
  id?: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function leadTypeLabel(type: string): string {
  return type === "autonomo" ? "Autónomo" : "Empresa / API";
}

function leadAdminUrl(id?: string): string {
  const origin = (process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://simplefactu.com").replace(
    /\/$/,
    ""
  );
  return id ? `${origin}/admin/leads/${encodeURIComponent(id)}` : `${origin}/admin/leads`;
}

/** Build the HTML + text bodies for a landing lead (exported for tests). */
export function buildLeadNotificationContent(params: LeadNotificationParams): {
  subject: string;
  html: string;
  text: string;
} {
  const typeLabel = leadTypeLabel(params.type);
  const message = (params.message ?? "").trim();
  const messageHtml = message
    ? `<p style="margin:8px 0 0;font-size:14px;color:#18181b;white-space:pre-wrap;word-break:break-word;">${escapeHtml(message)}</p>`
    : `<p style="margin:8px 0 0;font-size:13px;color:#a1a1aa;">(sin mensaje)</p>`;
  const adminUrl = leadAdminUrl(params.id);
  const subject = `Nuevo lead: ${params.name} (${typeLabel})`;

  const html = baseHtml(subject, `
    <h1 style="margin:0 0 8px;font-size:20px;font-weight:600;color:#18181b;">
      Nuevo lead en la landing
    </h1>
    <table style="border-collapse:collapse;width:100%;margin-top:12px;">
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#71717a;width:80px;">Nombre</td>
        <td style="padding:6px 0;font-size:14px;color:#18181b;font-weight:500;">${escapeHtml(params.name)}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#71717a;">Email</td>
        <td style="padding:6px 0;font-size:14px;color:#18181b;">
          <a href="mailto:${escapeHtml(params.email)}" style="color:#18181b;">${escapeHtml(params.email)}</a>
        </td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#71717a;">Perfil</td>
        <td style="padding:6px 0;font-size:14px;color:#18181b;">${escapeHtml(typeLabel)}</td>
      </tr>
    </table>
    <p style="margin:20px 0 0;font-size:12px;font-weight:600;color:#71717a;letter-spacing:.04em;text-transform:uppercase;">Mensaje</p>
    ${messageHtml}
    <p style="margin:20px 0 0;font-size:13px;">
      <a href="${escapeHtml(adminUrl)}" style="color:#18181b;">Ver el mensaje completo en el admin →</a>
    </p>
  `);

  const text = [
    "Nuevo lead en la landing",
    `Nombre: ${params.name}`,
    `Email: ${params.email}`,
    `Perfil: ${typeLabel}`,
    "",
    "Mensaje:",
    message || "(sin mensaje)",
    "",
    `Ver en admin: ${adminUrl}`,
  ].join("\n");

  return { subject, html, text };
}

export async function sendLeadNotificationEmail(params: LeadNotificationParams): Promise<void> {
  const resend = getResend();
  const notifyTo = getAdminNotifyEmail();
  if (!resend) {
    console.warn("[lead email] RESEND_API_KEY no está definida; no se envía aviso al admin.");
    return;
  }
  if (!notifyTo) {
    console.warn(
      "[lead email] ADMIN_NOTIFY_EMAIL (o LEAD_NOTIFY_EMAIL) no está definida; no se envía aviso."
    );
    return;
  }

  const { subject, html, text } = buildLeadNotificationContent(params);
  await resend.emails.send({
    from: getFromEmail(),
    to: notifyTo,
    replyTo: params.email,
    subject,
    html,
    text,
  });
}

type InvoiceEmailParams = {
  to: string;
  invoiceNumber: string;
  csv?: string | null;
  errorMessage?: string | null;
};

/* ── HTML helpers ───────────────────────────────────── */

function baseHtml(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:ui-sans-serif,system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:540px;background:#ffffff;border-radius:8px;border:1px solid #e4e4e7;padding:32px 32px 24px;">
        <tr><td>
          <p style="margin:0 0 24px;font-size:13px;font-weight:600;color:#71717a;letter-spacing:.05em;text-transform:uppercase;">Simple*Factu</p>
          ${body}
          <hr style="border:none;border-top:1px solid #e4e4e7;margin:24px 0;" />
          <p style="margin:0;font-size:12px;color:#a1a1aa;">
            Entra en <a href="https://simplefactu.com/invoices" style="color:#18181b;">simplefactu.com</a> para ver todos tus envíos.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/* ── Email senders ──────────────────────────────────── */

/**
 * Invoice accepted by AEAT (SEND_INVOICE + SUCCEEDED).
 */
export async function sendInvoiceAcceptedEmail(params: InvoiceEmailParams): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const subject = `Factura ${params.invoiceNumber} registrada en AEAT`;
  const csvLine = params.csv
    ? `<p style="margin:8px 0 0;font-size:14px;color:#52525b;">CSV: <strong style="color:#18181b;">${params.csv}</strong></p>`
    : "";

  const html = baseHtml(subject, `
    <h1 style="margin:0 0 8px;font-size:20px;font-weight:600;color:#18181b;">
      Factura registrada ✓
    </h1>
    <p style="margin:0 0 8px;font-size:15px;color:#3f3f46;">
      Tu factura <strong>${params.invoiceNumber}</strong> ha sido aceptada por Hacienda (AEAT) a través de Veri*Factu.
    </p>
    ${csvLine}
  `);

  await resend.emails.send({
    from: getFromEmail(),
    to: params.to,
    subject,
    html,
  });
}

/**
 * Invoice send failed permanently (SEND_INVOICE + DEAD).
 */
export async function sendInvoiceFailedEmail(params: InvoiceEmailParams): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const subject = `Factura ${params.invoiceNumber} — error al enviar a AEAT`;
  const errorLine = params.errorMessage
    ? `<p style="margin:12px 0 0;font-size:13px;color:#71717a;font-family:ui-monospace,monospace;white-space:pre-wrap;">${params.errorMessage}</p>`
    : "";

  const html = baseHtml(subject, `
    <h1 style="margin:0 0 8px;font-size:20px;font-weight:600;color:#18181b;">
      Error en el envío
    </h1>
    <p style="margin:0;font-size:15px;color:#3f3f46;">
      La factura <strong>${params.invoiceNumber}</strong> no pudo ser registrada en AEAT después de varios intentos.
    </p>
    ${errorLine}
    <p style="margin:16px 0 0;font-size:14px;color:#52525b;">
      Entra en la factura para ver el detalle del error y emitir una rectificativa si es necesario.
    </p>
  `);

  await resend.emails.send({
    from: getFromEmail(),
    to: params.to,
    subject,
    html,
  });
}

/**
 * Cancellation accepted by AEAT (CANCEL_INVOICE + SUCCEEDED).
 */
export async function sendCancellationAcceptedEmail(params: InvoiceEmailParams): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const subject = `Anulación de la factura ${params.invoiceNumber} aceptada`;

  const html = baseHtml(subject, `
    <h1 style="margin:0 0 8px;font-size:20px;font-weight:600;color:#18181b;">
      Anulación registrada ✓
    </h1>
    <p style="margin:0;font-size:15px;color:#3f3f46;">
      La anulación de la factura <strong>${params.invoiceNumber}</strong> ha sido aceptada por Hacienda (AEAT).
    </p>
  `);

  await resend.emails.send({
    from: getFromEmail(),
    to: params.to,
    subject,
    html,
  });
}

/**
 * Cancellation failed permanently (CANCEL_INVOICE + DEAD).
 */
export async function sendCancellationFailedEmail(params: InvoiceEmailParams): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const subject = `Error al anular la factura ${params.invoiceNumber} en AEAT`;
  const errorLine = params.errorMessage
    ? `<p style="margin:12px 0 0;font-size:13px;color:#71717a;font-family:ui-monospace,monospace;white-space:pre-wrap;">${params.errorMessage}</p>`
    : "";

  const html = baseHtml(subject, `
    <h1 style="margin:0 0 8px;font-size:20px;font-weight:600;color:#18181b;">
      Error en la anulación
    </h1>
    <p style="margin:0;font-size:15px;color:#3f3f46;">
      La anulación de la factura <strong>${params.invoiceNumber}</strong> no pudo procesarse en AEAT.
    </p>
    ${errorLine}
  `);

  await resend.emails.send({
    from: getFromEmail(),
    to: params.to,
    subject,
    html,
  });
}
