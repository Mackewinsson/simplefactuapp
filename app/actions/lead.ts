"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendLeadNotificationEmail } from "@/lib/email/invoice-notifications";

const schema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
  email: z.string().email("Email no válido"),
  type: z.enum(["autonomo", "empresa"]),
  message: z.string().max(2000).optional(),
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
    await prisma.lead.create({
      data: { ...parsed.data, source: "landing" },
    });
    void sendLeadNotificationEmail(parsed.data);
    return { ok: true };
  } catch {
    return { ok: false, error: "No hemos podido guardar tu mensaje. Inténtalo de nuevo." };
  }
}
