"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendLeadNotificationEmail } from "@/lib/email/invoice-notifications";

const RATE_LIMIT_MAX_EMAIL = 3;
const RATE_LIMIT_MAX_IP = 10;
const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 h

function clientIpFromHeaders(h: Headers): string | null {
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first.slice(0, 64);
  }
  const real = h.get("x-real-ip")?.trim();
  return real ? real.slice(0, 64) : null;
}

const schema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
  email: z.string().email("Email no válido"),
  type: z.enum(["autonomo", "empresa"]),
  message: z.string().max(2000).optional(),
  consent: z.literal("on").refine((v) => v === "on", "Debes aceptar la Política de Privacidad."),
});

export async function submitLead(
  _prev: { ok: boolean; error?: string } | null,
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: first?.message ?? "Datos inválidos" };
  }

  try {
    const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
    const h = await headers();
    const submitterIp = clientIpFromHeaders(h);

    const recentEmail = await prisma.lead.count({
      where: { email: parsed.data.email, createdAt: { gte: since } },
    });
    if (recentEmail >= RATE_LIMIT_MAX_EMAIL) {
      return { ok: false, error: "Has enviado demasiados mensajes. Inténtalo mañana." };
    }

    if (submitterIp) {
      const recentIp = await prisma.lead.count({
        where: { submitterIp, createdAt: { gte: since } },
      });
      if (recentIp >= RATE_LIMIT_MAX_IP) {
        return { ok: false, error: "Demasiados envíos desde esta red. Inténtalo más tarde." };
      }
    }

    const { consent: _consent, ...leadData } = parsed.data;
    const consentAt = new Date();
    await prisma.lead.create({
      data: { ...leadData, source: "landing", consentAt, submitterIp },
    });
    void sendLeadNotificationEmail(leadData);
    return { ok: true };
  } catch {
    return { ok: false, error: "No hemos podido guardar tu mensaje. Inténtalo de nuevo." };
  }
}
