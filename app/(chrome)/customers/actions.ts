"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const customerSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  nif: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  tipoPersona: z.enum(["F", "J"]).optional(),
});

export type CustomerRow = {
  id: string;
  name: string;
  nif: string | null;
  email: string | null;
  tipoPersona: string | null;
};

export async function getCustomersAction(): Promise<{ ok: boolean; customers: CustomerRow[] }> {
  const { userId } = await auth();
  if (!userId) return { ok: false, customers: [] };

  const customers = await prisma.customer.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    select: { id: true, name: true, nif: true, email: true, tipoPersona: true },
  });
  return { ok: true, customers };
}

export async function createCustomerAction(
  data: { name: string; nif?: string; email?: string; tipoPersona?: string }
): Promise<{ ok: boolean; customer?: CustomerRow; error?: string }> {
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "Sesión requerida." };

  const parsed = customerSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const { name, nif, email, tipoPersona } = parsed.data;

  const customer = await prisma.customer.create({
    data: {
      userId,
      name,
      nif: nif || null,
      email: email || null,
      tipoPersona: tipoPersona || null,
    },
    select: { id: true, name: true, nif: true, email: true, tipoPersona: true },
  });

  revalidatePath("/invoices/new");
  return { ok: true, customer };
}

export async function updateCustomerAction(
  id: string,
  data: { name: string; nif?: string; email?: string; tipoPersona?: string }
): Promise<{ ok: boolean; error?: string }> {
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "Sesión requerida." };

  const parsed = customerSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const { name, nif, email, tipoPersona } = parsed.data;
  const updated = await prisma.customer.updateMany({
    where: { id, userId },
    data: {
      name,
      nif: nif || null,
      email: email || null,
      tipoPersona: tipoPersona || null,
    },
  });
  if (updated.count === 0) return { ok: false, error: "Cliente no encontrado." };

  revalidatePath("/customers");
  revalidatePath("/invoices/new");
  return { ok: true };
}

export async function deleteCustomerAction(id: string): Promise<{ ok: boolean; error?: string }> {
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "Sesión requerida." };

  await prisma.customer.deleteMany({ where: { id, userId } });
  revalidatePath("/customers");
  revalidatePath("/invoices/new");
  return { ok: true };
}
