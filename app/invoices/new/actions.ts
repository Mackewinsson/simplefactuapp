"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { parseDecimalToCents } from "@/lib/money";

const CURRENCY_DEFAULT = "EUR";

const itemSchema = z.object({
  description: z.string().min(1, "Description required"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  unitPrice: z.string(),
  discountCents: z.coerce.number().int().min(0).default(0),
  discountConcept: z.string().max(250).optional().nullable(),
  claveRegimen: z.string().default("01"),
  calificacion: z.string().default("S1"),
  tipoImpositivo: z.string().default("21.0"),
});

const AEAT_ID_TYPES = ["02", "03", "04", "05", "06"] as const;

const schema = z
  .object({
    number: z.string().min(1, "Number is required"),
    issueDate: z.string().min(1, "Issue date is required"),
    dueDate: z.string().optional(),
    fechaOperacion: z.string().optional(),
    customerName: z.string().min(1, "Customer name is required"),
    customerNif: z.string().optional(),
    customerEmail: z
      .string()
      .optional()
      .refine((v) => !v || v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Invalid email"),
    customerTipoPersona: z.enum(["F", "J"]).optional(),
    customerIdScheme: z.enum(["NIF", "ID_OTRO"]).default("NIF"),
    customerIdType: z.string().optional(),
    customerCodigoPais: z.string().optional(),
    customerForeignId: z.string().optional(),
    notes: z.string().optional(),
    createdByFirstName: z.string().optional(),
    createdByLastName: z.string().optional(),
    sendToAeat: z.enum(["0", "1"]).default("0"),
    items: z.array(itemSchema).min(1, "At least one item required"),
  })
  .refine(
    (data) => data.items.every((i) => parseDecimalToCents(i.unitPrice) >= 0),
    { message: "Unit price must be >= 0", path: ["items"] }
  )
  .superRefine((data, ctx) => {
    if (data.customerIdScheme === "NIF") {
      const nif = (data.customerNif ?? "").trim();
      if (!nif) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Customer NIF/CIF is required.", path: ["customerNif"] });
      }
      return;
    }
    const idType = (data.customerIdType ?? "").trim();
    const id = (data.customerForeignId ?? "").trim();
    const pais = (data.customerCodigoPais ?? "").trim().toUpperCase();
    if (!idType || !AEAT_ID_TYPES.includes(idType as (typeof AEAT_ID_TYPES)[number])) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Tipo de identificación (IDType AEAT) obligatorio: 02–06.",
        path: ["customerIdType"],
      });
    }
    if (!id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Identificador del destinatario obligatorio.",
        path: ["customerForeignId"],
      });
    }
    if (idType !== "02" && !/^[A-Z]{2}$/.test(pais)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Código país ISO-2 obligatorio (salvo IDType 02 NIF-IVA).",
        path: ["customerCodigoPais"],
      });
    }
  });

export type CreateInvoiceState = { errors: string[] } | null;

export async function createInvoiceAction(
  _prev: CreateInvoiceState,
  formData: FormData
): Promise<CreateInvoiceState> {
  const { userId } = await auth();
  if (!userId) return { errors: ["You must be signed in to create an invoice."] };

  const user = await currentUser();

  const raw = {
    number: formData.get("number") ?? "",
    issueDate: formData.get("issueDate") ?? "",
    dueDate: formData.get("dueDate") || undefined,
    fechaOperacion: formData.get("fechaOperacion") || undefined,
    customerName: formData.get("customerName") ?? "",
    customerNif: formData.get("customerNif") ?? "",
    customerEmail: formData.get("customerEmail") || undefined,
    customerTipoPersona: formData.get("customerTipoPersona") || undefined,
    customerIdScheme: (formData.get("customerIdScheme") as string) || "NIF",
    customerIdType: formData.get("customerIdType") || undefined,
    customerCodigoPais: formData.get("customerCodigoPais") || undefined,
    customerForeignId: formData.get("customerForeignId") || undefined,
    notes: formData.get("notes") || undefined,
    createdByFirstName: formData.get("createdByFirstName")?.toString().trim() || null,
    createdByLastName: formData.get("createdByLastName")?.toString().trim() || null,
    sendToAeat: formData.get("sendToAeat") || "0",
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

  const {
    number,
    issueDate,
    dueDate,
    fechaOperacion,
    customerName,
    customerNif,
    customerEmail,
    customerTipoPersona,
    customerIdScheme,
    customerIdType,
    customerCodigoPais,
    customerForeignId,
    notes,
    createdByFirstName: formFirstName,
    createdByLastName: formLastName,
    sendToAeat,
    items,
  } = parsed.data;

  const createdByFirstName = (formFirstName?.trim() || user?.firstName) ?? null;
  const createdByLastName = (formLastName?.trim() || user?.lastName) ?? null;

  const itemRows = items.map((i) => {
    const unitPriceCents = parseDecimalToCents(i.unitPrice);
    const discountCents = i.discountCents ?? 0;
    const lineTotalCents = Math.max(0, i.quantity * unitPriceCents - discountCents);
    const taxRate = parseFloat(i.tipoImpositivo) || 0;
    const itemTaxCents = Math.round((lineTotalCents * taxRate) / 100);
    return {
      description: i.description,
      quantity: i.quantity,
      unitPriceCents,
      discountCents,
      discountConcept: (i.discountConcept && String(i.discountConcept).trim()) || null,
      lineTotalCents,
      claveRegimen: i.claveRegimen,
      calificacion: i.calificacion,
      tipoImpositivo: i.tipoImpositivo,
      // stored for aggregation below
      _taxCents: itemTaxCents,
    };
  });

  const subtotalCents = itemRows.reduce((sum, r) => sum + r.lineTotalCents, 0);
  const taxCents = itemRows.reduce((sum, r) => sum + r._taxCents, 0);
  const totalCents = subtotalCents + taxCents;
  const taxRatePercent =
    subtotalCents > 0 ? Math.round((taxCents / subtotalCents) * 100) : 21;

  const existing = await prisma.invoice.findFirst({
    where: { userId, number },
    select: { id: true },
  });
  if (existing) {
    return { errors: ["El número de factura ya existe en tu cuenta. Usa un número diferente."] };
  }

  let invoiceId: string;
  try {
    const invoice = await prisma.invoice.create({
      data: {
        userId,
        number,
        issueDate: new Date(issueDate),
        dueDate: dueDate ? new Date(dueDate) : null,
        fechaOperacion: fechaOperacion ? new Date(fechaOperacion) : null,
        customerName,
        customerNif: customerIdScheme === "NIF" ? (customerNif?.trim() || null) : null,
        customerEmail: customerEmail || null,
        customerTipoPersona: customerTipoPersona || null,
        customerIdScheme,
        customerIdType: customerIdScheme === "ID_OTRO" ? (customerIdType?.trim() || null) : null,
        customerCodigoPais:
          customerIdScheme === "ID_OTRO" ? (customerCodigoPais?.trim().toUpperCase() || null) : null,
        customerForeignId:
          customerIdScheme === "ID_OTRO" ? (customerForeignId?.trim() || null) : null,
        taxRatePercent,
        notes: notes || null,
        currency: CURRENCY_DEFAULT,
        subtotalCents,
        taxCents,
        totalCents,
        createdByFirstName,
        createdByLastName,
        items: {
          create: itemRows.map(({ _taxCents: _, ...row }) => row),
        },
      },
    });
    invoiceId = invoice.id;
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err.code === "P2002")
      return { errors: ["El número de factura ya existe en tu cuenta."] };
    return { errors: ["Failed to save invoice."] };
  }

  revalidatePath("/invoices");

  if (sendToAeat === "1") {
    redirect(`/invoices/${invoiceId}?send=1`);
  } else {
    redirect(`/invoices/${invoiceId}`);
  }
}
