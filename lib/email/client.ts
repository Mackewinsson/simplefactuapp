import { Resend } from "resend";

let _resend: Resend | null = null;

export function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

export function getFromEmail(): string {
  return process.env.RESEND_FROM_EMAIL ?? "Simple*Factu <noreply@simplefactu.com>";
}

/**
 * Inbox for operator-only alerts (landing leads, activation requests).
 * Prefer ADMIN_NOTIFY_EMAIL; LEAD_NOTIFY_EMAIL is a legacy alias.
 * Returns a single address — never a list — so leads go only to the admin.
 */
export function getAdminNotifyEmail(): string | undefined {
  const raw =
    process.env.ADMIN_NOTIFY_EMAIL?.trim() || process.env.LEAD_NOTIFY_EMAIL?.trim() || "";
  if (!raw) return undefined;
  const first = raw.split(",")[0]?.trim();
  return first || undefined;
}
