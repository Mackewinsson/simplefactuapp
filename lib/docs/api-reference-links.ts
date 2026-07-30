/**
 * Stable deep-links into Scalar (/docs/api-reference).
 * Hashes must match ApiReferenceClient `generateTagSlug` / `generateOperationSlug`.
 */
export const DOCS_API_REFERENCE = "/docs/api-reference";

/** Hash fragment (including `#`) for POST /send-invoice — default landing op. */
export const DOCS_API_SEND_INVOICE_HASH = "#tag/Facturas/POST/send-invoice";

export const DOCS_API_CANCEL_INVOICE_HASH = "#tag/Facturas/POST/cancel-invoice";

export const DOCS_API_SEND_INVOICE = `${DOCS_API_REFERENCE}${DOCS_API_SEND_INVOICE_HASH}`;

export const DOCS_API_CANCEL_INVOICE = `${DOCS_API_REFERENCE}${DOCS_API_CANCEL_INVOICE_HASH}`;
