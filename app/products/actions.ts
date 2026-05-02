"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { parseDecimalToCents } from "@/lib/money";

const productSchema = z.object({
  description: z.string().min(1, "La descripción es obligatoria"),
  unitPrice: z.string().min(1, "El precio es obligatorio"),
  tipoImpositivo: z.string().default("21.0"),
  claveRegimen: z.string().default("01"),
  calificacion: z.string().default("S1"),
});

export type ProductRow = {
  id: string;
  description: string;
  unitPriceCents: number;
  tipoImpositivo: string;
  claveRegimen: string;
  calificacion: string;
};

export async function getProductsAction(): Promise<{ ok: boolean; products: ProductRow[] }> {
  const { userId } = await auth();
  if (!userId) return { ok: false, products: [] };

  const products = await prisma.product.findMany({
    where: { userId },
    orderBy: { description: "asc" },
    select: {
      id: true,
      description: true,
      unitPriceCents: true,
      tipoImpositivo: true,
      claveRegimen: true,
      calificacion: true,
    },
  });
  return { ok: true, products };
}

export async function createProductAction(
  data: { description: string; unitPrice: string; tipoImpositivo?: string; claveRegimen?: string; calificacion?: string }
): Promise<{ ok: boolean; product?: ProductRow; error?: string }> {
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "Sesión requerida." };

  const parsed = productSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const { description, unitPrice, tipoImpositivo, claveRegimen, calificacion } = parsed.data;
  const unitPriceCents = parseDecimalToCents(unitPrice);

  const product = await prisma.product.create({
    data: {
      userId,
      description,
      unitPriceCents,
      tipoImpositivo,
      claveRegimen,
      calificacion,
    },
    select: {
      id: true,
      description: true,
      unitPriceCents: true,
      tipoImpositivo: true,
      claveRegimen: true,
      calificacion: true,
    },
  });

  revalidatePath("/invoices/new");
  return { ok: true, product };
}

export async function updateProductAction(
  id: string,
  data: { description: string; unitPrice: string; tipoImpositivo?: string; claveRegimen?: string; calificacion?: string }
): Promise<{ ok: boolean; error?: string }> {
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "Sesión requerida." };

  const parsed = productSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const { description, unitPrice, tipoImpositivo, claveRegimen, calificacion } = parsed.data;
  const unitPriceCents = parseDecimalToCents(unitPrice);

  const updated = await prisma.product.updateMany({
    where: { id, userId },
    data: {
      description,
      unitPriceCents,
      tipoImpositivo,
      claveRegimen,
      calificacion,
    },
  });
  if (updated.count === 0) return { ok: false, error: "Producto no encontrado." };

  revalidatePath("/products");
  revalidatePath("/invoices/new");
  return { ok: true };
}

export async function deleteProductAction(id: string): Promise<{ ok: boolean; error?: string }> {
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "Sesión requerida." };

  await prisma.product.deleteMany({ where: { id, userId } });
  revalidatePath("/products");
  revalidatePath("/invoices/new");
  return { ok: true };
}
