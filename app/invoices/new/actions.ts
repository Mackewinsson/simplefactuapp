"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { parseDecimalToCents } from "@/lib/money";

const CURRENCY_DEFAULT = "EUR";

const itemSchema = z.object({
  description: z.string().min(1, "Description required"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  unitPrice: z.string(),
});

const schema = z
  .object({
    number: z.string().min(1, "Number is required"),
    issueDate: z.string().min(1, "Issue date is required"),
    dueDate: z.string().optional(),
    customerName: z.string().min(1, "Customer name is required"),
    customerEmail: z
      .string()
      .optional()
      .refine((v) => !v || v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Invalid email"),
    notes: z.string().optional(),
    taxRatePercent: z.coerce.number().min(0).max(100).default(21),
    items: z.array(itemSchema).min(1, "At least one item required"),
  })
  .refine(
    (data) =>
      data.items.every((i) => parseDecimalToCents(i.unitPrice) >= 0),
    { message: "Unit price must be >= 0", path: ["items"] }
  );

export type CreateInvoiceState = { errors: string[] } | null;

export async function createInvoiceAction(
  _prev: CreateInvoiceState,
  formData: FormData
): Promise<CreateInvoiceState> {
  const { userId } = await auth();
  if (!userId) return { errors: ["You must be signed in to create an invoice."] };

  const raw = {
    number: formData.get("number") ?? "",
    issueDate: formData.get("issueDate") ?? "",
    dueDate: formData.get("dueDate") || undefined,
    customerName: formData.get("customerName") ?? "",
    customerEmail: formData.get("customerEmail") || undefined,
    notes: formData.get("notes") || undefined,
    taxRatePercent: formData.get("taxRatePercent") ?? "21",
    items: (() => {
      try {
        return JSON.parse((formData.get("items") as string) || "[]");
      } catch {
        return [];
      }
    })(),
  };

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const errors = parsed.error.flatten();
    const messages: string[] = [];
    if (errors.formErrors.length) messages.push(...errors.formErrors);
    Object.values(errors.fieldErrors).forEach((arr) => {
      if (Array.isArray(arr)) messages.push(...arr);
      else if (arr) messages.push(arr);
    });
    return { errors: messages };
  }

  const { number, issueDate, dueDate, customerName, customerEmail, notes, taxRatePercent, items } =
    parsed.data;

  const itemRows = items.map((i) => {
    const unitPriceCents = parseDecimalToCents(i.unitPrice);
    const lineTotalCents = i.quantity * unitPriceCents;
    return {
      description: i.description,
      quantity: i.quantity,
      unitPriceCents,
      lineTotalCents,
    };
  });

  const subtotalCents = itemRows.reduce((sum, r) => sum + r.lineTotalCents, 0);
  const taxCents = Math.round((subtotalCents * taxRatePercent) / 100);
  const totalCents = subtotalCents + taxCents;

  try {
    await prisma.invoice.create({
      data: {
        userId,
        number,
        issueDate: new Date(issueDate),
        dueDate: dueDate ? new Date(dueDate) : null,
        customerName,
        customerEmail: customerEmail || null,
        notes: notes || null,
        currency: CURRENCY_DEFAULT,
        subtotalCents,
        taxCents,
        totalCents,
        items: { create: itemRows },
      },
    });
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err.code === "P2002")
      return { errors: ["This invoice number is already in use."] };
    return { errors: ["Failed to save invoice."] };
  }

  revalidatePath("/invoices");
  redirect("/invoices");
}
