"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "@/lib/zod-es";
import { prisma } from "@/lib/prisma";

const AEAT_ID_TYPES = ["02", "03", "04", "05", "06"] as const;

const customerSchema = z
  .object({
    name: z.string().min(1, "El nombre es obligatorio"),
    nif: z.string().optional(),
    email: z.string().email("Correo no válido").optional().or(z.literal("")),
    tipoPersona: z.enum(["F", "J"]).optional(),
    idScheme: z.enum(["NIF", "ID_OTRO"]).default("NIF"),
    idType: z.string().optional(),
    codigoPais: z.string().optional(),
    foreignId: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.idScheme === "NIF") return;
    const idType = (data.idType ?? "").trim();
    const id = (data.foreignId ?? "").trim();
    const pais = (data.codigoPais ?? "").trim().toUpperCase();
    if (!idType || !AEAT_ID_TYPES.includes(idType as (typeof AEAT_ID_TYPES)[number])) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Tipo de identificación (IDType AEAT) obligatorio: 02–06.",
      });
    }
    if (!id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Identificador del destinatario obligatorio.",
      });
    }
    if (idType !== "02" && !/^[A-Z]{2}$/.test(pais)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Código país ISO-2 obligatorio (salvo IDType 02 NIF-IVA).",
      });
    }
  });

export type CustomerRow = {
  id: string;
  name: string;
  nif: string | null;
  email: string | null;
  tipoPersona: string | null;
  idScheme: string;
  idType: string | null;
  codigoPais: string | null;
  foreignId: string | null;
};

const customerSelect = {
  id: true,
  name: true,
  nif: true,
  email: true,
  tipoPersona: true,
  idScheme: true,
  idType: true,
  codigoPais: true,
  foreignId: true,
} as const;

export async function getCustomersAction(): Promise<{ ok: boolean; customers: CustomerRow[] }> {
  const { userId } = await auth();
  if (!userId) return { ok: false, customers: [] };

  const customers = await prisma.customer.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    select: customerSelect,
  });
  return { ok: true, customers };
}

export async function createCustomerAction(data: {
  name: string;
  nif?: string;
  email?: string;
  tipoPersona?: string;
  idScheme?: string;
  idType?: string;
  codigoPais?: string;
  foreignId?: string;
}): Promise<{ ok: boolean; customer?: CustomerRow; error?: string }> {
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "Sesión requerida." };

  const parsed = customerSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const { name, nif, email, tipoPersona, idScheme, idType, codigoPais, foreignId } = parsed.data;
  const scheme = idScheme ?? "NIF";

  const customer = await prisma.customer.create({
    data: {
      userId,
      name,
      nif: scheme === "NIF" ? nif?.trim() || null : null,
      email: email || null,
      tipoPersona: tipoPersona || null,
      idScheme: scheme,
      idType: scheme === "ID_OTRO" ? idType?.trim() || null : null,
      codigoPais:
        scheme === "ID_OTRO" ? (codigoPais?.trim().toUpperCase() || null) : null,
      foreignId: scheme === "ID_OTRO" ? foreignId?.trim() || null : null,
    },
    select: customerSelect,
  });

  revalidatePath("/customers");
  revalidatePath("/invoices/new");
  return { ok: true, customer };
}

export async function updateCustomerAction(
  id: string,
  data: {
    name: string;
    nif?: string;
    email?: string;
    tipoPersona?: string;
    idScheme?: string;
    idType?: string;
    codigoPais?: string;
    foreignId?: string;
  }
): Promise<{ ok: boolean; error?: string }> {
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "Sesión requerida." };

  const parsed = customerSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const { name, nif, email, tipoPersona, idScheme, idType, codigoPais, foreignId } = parsed.data;
  const scheme = idScheme ?? "NIF";
  const updated = await prisma.customer.updateMany({
    where: { id, userId },
    data: {
      name,
      nif: scheme === "NIF" ? nif?.trim() || null : null,
      email: email || null,
      tipoPersona: tipoPersona || null,
      idScheme: scheme,
      idType: scheme === "ID_OTRO" ? idType?.trim() || null : null,
      codigoPais:
        scheme === "ID_OTRO" ? (codigoPais?.trim().toUpperCase() || null) : null,
      foreignId: scheme === "ID_OTRO" ? foreignId?.trim() || null : null,
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
