"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendLeadNotificationEmail } from "@/lib/email/invoice-notifications";

const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 h

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
    // Rate limit: max RATE_LIMIT_MAX submissions per email in the last 24 h
    const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
    const recent = await prisma.lead.count({
      where: { email: parsed.data.email, createdAt: { gte: since } },
    });
    if (recent >= RATE_LIMIT_MAX) {
      return { ok: false, error: "Has enviado demasiados mensajes. Inténtalo mañana." };
    }

    const { consent: _consent, ...leadData } = parsed.data;
    await prisma.lead.create({ data: { ...leadData, source: "landing" } });
    void sendLeadNotificationEmail(leadData);
    return { ok: true };
  } catch {
    return { ok: false, error: "No hemos podido guardar tu mensaje. Inténtalo de nuevo." };
  }
}
