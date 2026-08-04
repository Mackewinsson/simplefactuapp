import { getFromEmail, getResend } from "./client";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

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
            Panel admin: <a href="https://simplefactu.com/admin/requests" style="color:#18181b;">/admin/requests</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function adminNotifyEmail(): string | undefined {
  return process.env.ADMIN_NOTIFY_EMAIL?.trim() || process.env.LEAD_NOTIFY_EMAIL?.trim();
}

export async function sendActivationRequestAdminEmail(params: {
  companyName: string;
  email: string;
  nif: string;
  message?: string | null;
  userId: string;
}): Promise<void> {
  const resend = getResend();
  const notifyTo = adminNotifyEmail();
  if (!resend || !notifyTo) return;

  const messageBlock = params.message
    ? `<p style="margin:16px 0 0;font-size:14px;color:#3f3f46;white-space:pre-wrap;">${escapeHtml(params.message)}</p>`
    : "";

  const html = baseHtml(`Solicitud de activación: ${params.companyName}`, `
    <h1 style="margin:0 0 8px;font-size:20px;font-weight:600;color:#18181b;">
      Nueva solicitud de producción
    </h1>
    <p style="margin:0 0 12px;font-size:14px;color:#52525b;">
      Un integrador pide activar el acceso a producción tras probar en sandbox.
    </p>
    <table style="border-collapse:collapse;width:100%;margin-top:12px;">
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#71717a;width:100px;">Empresa</td>
        <td style="padding:6px 0;font-size:14px;color:#18181b;font-weight:500;">${escapeHtml(params.companyName)}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#71717a;">NIF</td>
        <td style="padding:6px 0;font-size:14px;color:#18181b;">${escapeHtml(params.nif)}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#71717a;">Email</td>
        <td style="padding:6px 0;font-size:14px;color:#18181b;">
          <a href="mailto:${escapeHtml(params.email)}" style="color:#18181b;">${escapeHtml(params.email)}</a>
        </td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#71717a;">Clerk ID</td>
        <td style="padding:6px 0;font-size:12px;color:#52525b;font-family:ui-monospace,monospace;">${escapeHtml(params.userId)}</td>
      </tr>
    </table>
    ${messageBlock}
  `);

  await resend.emails.send({
    from: getFromEmail(),
    to: notifyTo,
    replyTo: params.email,
    subject: `Activación producción: ${params.companyName}`,
    html,
  });
}

export async function sendActivationApprovedEmail(params: {
  to: string;
  companyName: string;
}): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const html = baseHtml("Acceso a producción activado", `
    <h1 style="margin:0 0 8px;font-size:20px;font-weight:600;color:#18181b;">
      Acceso a producción activado ✓
    </h1>
    <p style="margin:0;font-size:15px;color:#3f3f46;">
      Hemos aprobado la solicitud de <strong>${escapeHtml(params.companyName)}</strong>.
      Ya puedes entrar en la consola de integrador en producción.
    </p>
    <p style="margin:16px 0 0;">
      <a href="https://simplefactu.com/partner" style="display:inline-block;padding:10px 16px;background:#18181b;color:#fff;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;">
        Abrir consola
      </a>
    </p>
  `);

  await resend.emails.send({
    from: getFromEmail(),
    to: params.to,
    subject: "Tu acceso a producción Simple*Factu está activo",
    html,
  });
}

export async function sendActivationRejectedEmail(params: {
  to: string;
  companyName: string;
  note?: string | null;
}): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const noteBlock = params.note
    ? `<p style="margin:12px 0 0;font-size:14px;color:#52525b;white-space:pre-wrap;">${escapeHtml(params.note)}</p>`
    : "";

  const html = baseHtml("Solicitud de activación rechazada", `
    <h1 style="margin:0 0 8px;font-size:20px;font-weight:600;color:#18181b;">
      Solicitud rechazada
    </h1>
    <p style="margin:0;font-size:15px;color:#3f3f46;">
      No hemos podido activar aún el acceso a producción para <strong>${escapeHtml(params.companyName)}</strong>.
      Puedes seguir probando en sandbox y volver a solicitarlo.
    </p>
    ${noteBlock}
    <p style="margin:16px 0 0;font-size:14px;color:#52525b;">
      Sandbox: <a href="https://qa.simplefactu.com" style="color:#18181b;">qa.simplefactu.com</a>
    </p>
  `);

  await resend.emails.send({
    from: getFromEmail(),
    to: params.to,
    subject: "Solicitud de activación Simple*Factu",
    html,
  });
}
