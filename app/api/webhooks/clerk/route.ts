import { verifyWebhook } from "@clerk/nextjs/webhooks";
import type { NextRequest } from "next/server";
import { ensureVerifactuApiKey } from "@/lib/verifactu/provision";

/**
 * Provisions simplefactu tenant + API key when a Clerk user is created.
 * Configure in Clerk Dashboard → Webhooks; set CLERK_WEBHOOK_SIGNING_SECRET.
 */
export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);

    if (evt.type === "user.created") {
      const userId = evt.data.id;
      try {
        await ensureVerifactuApiKey(userId);
      } catch (err) {
        console.error("[clerk webhook] ensureVerifactuApiKey failed:", err);
        // Return 200 so Clerk does not retry indefinitely on misconfiguration;
        // user can still lazy-provision on first /settings or invoice action.
      }
    }

    return new Response("OK", { status: 200 });
  } catch (e) {
    console.error("[clerk webhook] verification failed:", e);
    return new Response("Verification failed", { status: 400 });
  }
}
