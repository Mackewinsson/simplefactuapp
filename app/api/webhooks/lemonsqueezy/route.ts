import { NextResponse } from "next/server";
import { getLemonSqueezyConfig } from "@/lib/lemonsqueezy/config";
import { applyLemonSqueezyWebhook } from "@/lib/billing/subscription-store";
import { verifyLemonSqueezyWebhookSignature } from "@/lib/lemonsqueezy/verify-webhook";
import type { LemonSqueezyWebhookPayload } from "@/lib/lemonsqueezy/types";

export const runtime = "nodejs";

const HANDLED_EVENTS = new Set([
  "subscription_created",
  "subscription_updated",
  "subscription_cancelled",
  "subscription_resumed",
  "subscription_expired",
  "subscription_paused",
  "subscription_unpaused",
  "subscription_payment_success",
  "subscription_payment_failed",
  "subscription_payment_recovered",
]);

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-signature");

  let config;
  try {
    config = getLemonSqueezyConfig();
  } catch (error) {
    console.error("[lemonsqueezy webhook] missing config", error);
    return NextResponse.json({ error: "Billing not configured" }, { status: 503 });
  }

  if (!verifyLemonSqueezyWebhookSignature(rawBody, signature, config.webhookSecret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: LemonSqueezyWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as LemonSqueezyWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventName = payload.meta?.event_name ?? "";
  if (!HANDLED_EVENTS.has(eventName)) {
    return NextResponse.json({ received: true, ignored: true, eventName });
  }

  try {
    await applyLemonSqueezyWebhook(payload, config.proVariantId);
    return NextResponse.json({ received: true, eventName });
  } catch (error) {
    console.error("[lemonsqueezy webhook] processing failed", { eventName, error });
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
