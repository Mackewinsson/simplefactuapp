import { z } from "zod";
import { parseDecimalToCents } from "@/lib/money";
import type {
  InvoiceFormFieldErrors,
  InvoiceItemFieldErrorsMap,
} from "@/app/(chrome)/invoices/new/invoice-form-state";

export const createInvoiceItemSchema = z.object({
  description: z.string().min(1, "La descripción es obligatoria"),
  quantity: z.coerce.number().int().min(1, "La cantidad debe ser al menos 1"),
  unitPrice: z.string(),
  discountCents: z.coerce.number().int().min(0).default(0),
  discountConcept: z.string().max(250).optional().nullable(),
  claveRegimen: z.string().default("01"),
  calificacion: z.string().default("S1"),
  tipoImpositivo: z.string().default("21.0"),
});

const AEAT_ID_TYPES = ["02", "03", "04", "05", "06"] as const;

export const createInvoiceFormSchema = z
  .object({
    number: z.string().min(1, "El número es obligatorio"),
    issueDate: z.string().min(1, "La fecha de expedición es obligatoria"),
    dueDate: z.string().optional(),
    fechaOperacion: z.string().optional(),
    customerName: z.string().min(1, "El nombre del cliente es obligatorio"),
    customerNif: z.string().optional(),
    customerEmail: z
      .string()
      .optional()
      .refine((v) => !v || v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "El correo no es válido"),
    customerTipoPersona: z.enum(["F", "J"]).optional(),
    customerIdScheme: z.enum(["NIF", "ID_OTRO"]).default("NIF"),
    customerIdType: z.string().optional(),
    customerCodigoPais: z.string().optional(),
    customerForeignId: z.string().optional(),
    notes: z.string().optional(),
    createdByFirstName: z.string().optional().nullable(),
    createdByLastName: z.string().optional().nullable(),
    sendToAeat: z.enum(["0", "1"]).default("0"),
    items: z.array(createInvoiceItemSchema).min(1, "Añade al menos una línea"),
  })
  .refine(
    (data) => data.items.every((i) => parseDecimalToCents(i.unitPrice) >= 0),
    { message: "El precio unitario debe ser ≥ 0", path: ["items"] }
  )
  .superRefine((data, ctx) => {
    if (data.customerIdScheme === "NIF") {
      const nif = (data.customerNif ?? "").trim();
      if (!nif) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El NIF/CIF del cliente es obligatorio.",
          path: ["customerNif"],
        });
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
  })
  .superRefine((data, ctx) => {
    const op = (data.fechaOperacion ?? "").trim();
    const ex = (data.issueDate ?? "").trim();
    if (!op || !ex || op <= ex) return;
    const allowsFutureOp = data.items.some(
      (i) => i.claveRegimen === "14" || i.claveRegimen === "15"
    );
    if (allowsFutureOp) return;
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        "La fecha de operación no puede ser posterior a la de expedición (salvo régimen 14 o 15).",
      path: ["fechaOperacion"],
    });
  });

export type CreateInvoiceFormParsed = z.infer<typeof createInvoiceFormSchema>;

const FORM_FIELD_KEYS = new Set<string>([
  "number",
  "issueDate",
  "customerName",
  "customerNif",
  "customerEmail",
  "fechaOperacion",
  "customerIdType",
  "customerForeignId",
  "customerCodigoPais",
]);

export function itemFieldErrorsFromZodIssues(
  issues: ReadonlyArray<{ path: ReadonlyArray<string | number>; message: string }>
): InvoiceItemFieldErrorsMap | undefined {
  const out: InvoiceItemFieldErrorsMap = {};
  for (const issue of issues) {
    const path = issue.path;
    if (path.length < 3 || path[0] !== "items" || typeof path[1] !== "number") continue;
    const idx = path[1];
    const field = path[2];
    if (field !== "description" && field !== "unitPrice") continue;
    if (!out[idx]) out[idx] = {};
    if (field === "description") out[idx].description = issue.message;
    else out[idx].unitPrice = issue.message;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

export function formFieldErrorsFromZodIssues(
  issues: ReadonlyArray<{ path: ReadonlyArray<string | number>; message: string }>
): InvoiceFormFieldErrors | undefined {
  const out: InvoiceFormFieldErrors = {};
  for (const issue of issues) {
    const path = issue.path;
    if (path.length !== 1) continue;
    const key = path[0];
    if (typeof key !== "string" || !FORM_FIELD_KEYS.has(key)) continue;
    const k = key as keyof InvoiceFormFieldErrors;
    if (out[k] === undefined) out[k] = issue.message;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

/** Flatten Zod error into message list + per-field maps (same shape as createInvoiceAction failure). */
type ZodIssueLike = { path: ReadonlyArray<string | number>; message: string };

export function zodErrorToValidationParts(error: z.ZodError): {
  errors: string[];
  itemFieldErrors?: InvoiceItemFieldErrorsMap;
  formFieldErrors?: InvoiceFormFieldErrors;
} {
  const flat = error.flatten();
  const messages: string[] = [];
  if (flat.formErrors.length) messages.push(...flat.formErrors);
  for (const val of Object.values(flat.fieldErrors)) {
    if (Array.isArray(val)) {
      for (const x of val) {
        if (typeof x === "string") messages.push(x);
      }
    } else if (typeof val === "string") {
      messages.push(val);
    }
  }
  const issues = error.issues as unknown as ZodIssueLike[];
  return {
    errors: messages,
    itemFieldErrors: itemFieldErrorsFromZodIssues(issues),
    formFieldErrors: formFieldErrorsFromZodIssues(issues),
  };
}

export function validateCreateInvoiceClientPayload(
  raw: z.input<typeof createInvoiceFormSchema>
):
  | { ok: true; data: CreateInvoiceFormParsed }
  | {
      ok: false;
      errors: string[];
      itemFieldErrors?: InvoiceItemFieldErrorsMap;
      formFieldErrors?: InvoiceFormFieldErrors;
    } {
  const parsed = createInvoiceFormSchema.safeParse(raw);
  if (parsed.success) return { ok: true, data: parsed.data };
  const parts = zodErrorToValidationParts(parsed.error);
  return { ok: false, ...parts };
}

export function stripFormFieldErrors(
  prev: InvoiceFormFieldErrors | undefined,
  ...keys: (keyof InvoiceFormFieldErrors)[]
): InvoiceFormFieldErrors | undefined {
  if (!prev) return prev;
  const next: InvoiceFormFieldErrors = { ...prev };
  for (const k of keys) delete next[k];
  return Object.keys(next).length > 0 ? next : undefined;
}

/** Collect messages already shown next to fields / lines (for deduping the global banner). */
export function collectInlineErrorMessages(
  formFieldErrors: InvoiceFormFieldErrors | undefined,
  itemFieldErrors: InvoiceItemFieldErrorsMap | undefined
): Set<string> {
  const set = new Set<string>();
  if (formFieldErrors) {
    for (const v of Object.values(formFieldErrors)) {
      if (v) set.add(v);
    }
  }
  if (itemFieldErrors) {
    for (const row of Object.values(itemFieldErrors)) {
      if (!row) continue;
      if (row.description) set.add(row.description);
      if (row.unitPrice) set.add(row.unitPrice);
    }
  }
  return set;
}
