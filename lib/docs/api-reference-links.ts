/**
 * Stable deep-links into Scalar (/docs/api-reference).
 * Hashes must match ApiReferenceClient `generateTagSlug` / `generateOperationSlug`.
 * Format: `#tag/{TagName}/{METHOD}{path}` e.g. `#tag/Facturas/POST/send-invoice`
 */
export const DOCS_API_REFERENCE = "/docs/api-reference";

/** Hash fragment (including `#`) for POST /send-invoice — default landing op. */
export const DOCS_API_SEND_INVOICE_HASH = "#tag/Facturas/POST/send-invoice";

export const DOCS_API_CANCEL_INVOICE_HASH = "#tag/Facturas/POST/cancel-invoice";

export const DOCS_API_VERIFY_NIF_HASH = "#tag/Verificación de NIF/POST/verify-nif";

export const DOCS_API_INVOICES_LOOKUP_HASH = "#tag/Facturas/GET/invoices/lookup";

export const DOCS_API_INVOICE_RECORDS_HASH = "#tag/Facturas/GET/me/invoice-records";

export const DOCS_API_ME_PLAN_HASH = "#tag/Facturación/GET/me/plan";

export const DOCS_API_JOB_HASH = "#tag/Trabajos/GET/jobs/{jobId}";

export const DOCS_API_SEND_INVOICE = `${DOCS_API_REFERENCE}${DOCS_API_SEND_INVOICE_HASH}`;

export const DOCS_API_CANCEL_INVOICE = `${DOCS_API_REFERENCE}${DOCS_API_CANCEL_INVOICE_HASH}`;

export const DOCS_API_VERIFY_NIF = `${DOCS_API_REFERENCE}${DOCS_API_VERIFY_NIF_HASH}`;

export const DOCS_API_INVOICES_LOOKUP = `${DOCS_API_REFERENCE}${DOCS_API_INVOICES_LOOKUP_HASH}`;

export const DOCS_API_INVOICE_RECORDS = `${DOCS_API_REFERENCE}${DOCS_API_INVOICE_RECORDS_HASH}`;

export const DOCS_API_ME_PLAN = `${DOCS_API_REFERENCE}${DOCS_API_ME_PLAN_HASH}`;

export const DOCS_API_JOB = `${DOCS_API_REFERENCE}${DOCS_API_JOB_HASH}`;
