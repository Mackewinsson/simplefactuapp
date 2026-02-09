/**
 * Safe money helpers: parse decimal input to integer cents (no float errors)
 * and format cents for display with Intl.NumberFormat.
 */

/**
 * Parses a decimal string to integer cents. Avoids float precision issues
 * by working with string parts (e.g. "12.34" → 1234).
 * Trims input; invalid or empty input returns 0.
 */
export function parseDecimalToCents(input: string): number {
  const trimmed = input.trim();
  if (trimmed === "" || trimmed === "-" || trimmed === ".") return 0;

  const negative = trimmed.startsWith("-");
  const normalized = negative ? trimmed.slice(1) : trimmed;

  const dotIndex = normalized.indexOf(".");
  let wholePart: string;
  let fracPart: string;

  if (dotIndex === -1) {
    wholePart = normalized.replace(/\D/g, "") || "0";
    fracPart = "00";
  } else {
    wholePart = normalized.slice(0, dotIndex).replace(/\D/g, "") || "0";
    fracPart = normalized
      .slice(dotIndex + 1)
      .replace(/\D/g, "")
      .padEnd(2, "0")
      .slice(0, 2);
  }

  const cents = parseInt(wholePart, 10) * 100 + parseInt(fracPart, 10);
  return negative ? -cents : cents;
}

/**
 * Formats an amount in cents as currency using Intl.NumberFormat.
 */
export function formatCents(currency: string, cents: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  }).format(cents / 100);
}
