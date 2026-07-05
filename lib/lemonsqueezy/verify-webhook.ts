import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Verify Lemon Squeezy webhook `X-Signature` (HMAC SHA-256 hex digest).
 */
export function verifyLemonSqueezyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string
): boolean {
  if (!signatureHeader?.trim()) return false;

  const digest = createHmac("sha256", secret).update(rawBody).digest("hex");
  const expected = Buffer.from(digest, "utf8");
  const received = Buffer.from(signatureHeader.trim(), "utf8");

  if (expected.length !== received.length) return false;
  return timingSafeEqual(expected, received);
}
