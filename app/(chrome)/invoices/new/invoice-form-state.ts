/** Per-line validation messages keyed by item index (Zod paths use numeric indices). */
export type InvoiceItemFieldErrorRow = { description?: string; unitPrice?: string };
export type InvoiceItemFieldErrorsMap = Record<number, InvoiceItemFieldErrorRow>;

/** Top-level invoice form fields (paths from Zod issues, single segment). */
export type InvoiceFormFieldErrors = Partial<{
  number: string;
  issueDate: string;
  customerName: string;
  customerNif: string;
  customerEmail: string;
  fechaOperacion: string;
  customerIdType: string;
  customerForeignId: string;
  customerCodigoPais: string;
}>;

export type CreateInvoiceState = {
  errors: string[];
  itemFieldErrors?: InvoiceItemFieldErrorsMap;
  formFieldErrors?: InvoiceFormFieldErrors;
} | null;
