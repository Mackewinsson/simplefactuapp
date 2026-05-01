/**
 * Mirrors the extractSerie logic from simplefactu's encadenamiento.service.js.
 * The chain_key in Verifactu is "{NIF}|{serie}|{numeroInstalacion}".
 * The serie is the prefix of the invoice number before the first '/', '-' or '_'.
 *
 * Examples:
 *   "2026/F-001" → "2026"
 *   "F-001"      → "F"
 *   "INV_001"    → "INV"
 *   "001"        → "001"  (no separator → full number is the series)
 */
export function extractSerie(numSerie: string): string {
  const m = numSerie.match(/^([^/\-_]+)/);
  return m ? m[1].trim() : numSerie.trim();
}
