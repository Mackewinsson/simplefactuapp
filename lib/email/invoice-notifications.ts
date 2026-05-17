import { getFromEmail, getResend } from "./client";

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
      Tu factura <strong>${params.invoiceNumber}</strong> ha sido aceptada por Hacienda (AEAT) a través de Veri·Factu.
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
