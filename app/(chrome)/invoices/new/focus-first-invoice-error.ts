import type { InvoiceFormFieldErrors, InvoiceItemFieldErrorsMap } from "./invoice-form-state";

const FORM_FOCUS_ORDER = [
  "number",
  "issueDate",
  "fechaOperacion",
  "customerName",
  "customerNif",
  "customerEmail",
] as const satisfies readonly (keyof InvoiceFormFieldErrors)[];

export function focusFirstInvoiceError(
  formFieldErrors: InvoiceFormFieldErrors | undefined,
  itemFieldErrors: InvoiceItemFieldErrorsMap | undefined
): void {
  for (const key of FORM_FOCUS_ORDER) {
    if (formFieldErrors?.[key]) {
      const el = document.getElementById(`invoice-field-${key}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        if ("focus" in el && typeof (el as HTMLElement).focus === "function") {
          (el as HTMLElement).focus({ preventScroll: true });
        }
      }
      return;
    }
  }
  if (itemFieldErrors) {
    const idxs = Object.keys(itemFieldErrors)
      .map(Number)
      .filter((i) => itemFieldErrors[i]?.description || itemFieldErrors[i]?.unitPrice)
      .sort((a, b) => a - b);
    if (idxs.length > 0) {
      const i = idxs[0];
      (
        document.getElementById(`invoice-line-${i}-m`) ?? document.getElementById(`invoice-line-${i}-d`)
      )?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }
}
