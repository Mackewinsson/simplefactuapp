"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { parseDecimalToCents } from "@/lib/money";
import {
  createInvoiceFormSchema,
  zodErrorToValidationParts,
} from "@/lib/invoices/create-invoice-validation";
import type { CreateInvoiceState } from "./invoice-form-state";

const CURRENCY_DEFAULT = "EUR";

export async function createInvoiceAction(
  _prev: CreateInvoiceState,
  formData: FormData
): Promise<CreateInvoiceState> {
  const { userId } = await auth();
  if (!userId) return { errors: ["Debes iniciar sesión para crear una factura."] };

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

  const parsed = createInvoiceFormSchema.safeParse(raw);
  if (!parsed.success) {
    const { errors, itemFieldErrors, formFieldErrors } = zodErrorToValidationParts(parsed.error);
    return { errors, itemFieldErrors, formFieldErrors };
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

  const isTaxFreeLine = (calificacion: string) =>
    /^E[1-6]$/.test(calificacion) || calificacion === "N1" || calificacion === "N2";

  const itemRows = items.map((i) => {
    const unitPriceCents = parseDecimalToCents(i.unitPrice);
    const discountCents = i.discountCents ?? 0;
    const lineTotalCents = Math.max(0, i.quantity * unitPriceCents - discountCents);
    const taxRate = parseFloat(i.tipoImpositivo) || 0;
    const itemTaxCents = isTaxFreeLine(i.calificacion)
      ? 0
      : Math.round((lineTotalCents * taxRate) / 100);
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
    return { errors: ["No se pudo guardar la factura."] };
  }

  revalidatePath("/invoices");

  if (sendToAeat === "1") {
    redirect(`/invoices/${invoiceId}?send=1`);
  } else {
    redirect(`/invoices/${invoiceId}`);
  }
}
