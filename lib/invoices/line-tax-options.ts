export const CLAVE_REGIMEN_OPTIONS = [
  { value: "01", label: "01 – Régimen general" },
  { value: "02", label: "02 – Exportación" },
  { value: "03", label: "03 – Régimen especial bienes usados" },
  { value: "04", label: "04 – Régimen especial oro de inversión" },
  { value: "05", label: "05 – Régimen especial agencias de viajes" },
  { value: "06", label: "06 – Régimen especial grupo de entidades en IVA" },
  { value: "07", label: "07 – Régimen especial criterio de caja" },
  { value: "08", label: "08 – Operaciones sujetas al IPSI/IGIC" },
  { value: "09", label: "09 – Facturación de los prestadores de servicios de telecomunicación" },
  { value: "10", label: "10 – Cobros por cuenta de terceros" },
  { value: "11", label: "11 – Operaciones de arrendamiento de local de negocio" },
  { value: "14", label: "14 – Factura con IVA pendiente de devengo" },
  { value: "15", label: "15 – Régimen especial del grupo de entidades en IVA – entidad dependiente" },
] as const;

export const CALIFICACION_OPTIONS = [
  { value: "S1", label: "S1 – Sujeta – No exenta" },
  { value: "S2", label: "S2 – Sujeta – No exenta con inversión del sujeto pasivo" },
  { value: "N1", label: "N1 – No sujeta: artículos 7, 14, otros" },
  { value: "N2", label: "N2 – No sujeta: reglas de localización" },
  { value: "E1", label: "E1 – Exenta: artículo 20" },
  { value: "E2", label: "E2 – Exenta: artículo 21" },
  { value: "E3", label: "E3 – Exenta: artículo 22" },
  { value: "E4", label: "E4 – Exenta: artículo 23 y 24" },
  { value: "E5", label: "E5 – Exenta: artículo 25" },
  { value: "E6", label: "E6 – Exenta: otro" },
] as const;

export const TIPO_IMPOSITIVO_OPTIONS = [
  { value: "0.0", label: "0%" },
  { value: "4.0", label: "4%" },
  { value: "10.0", label: "10%" },
  { value: "21.0", label: "21%" },
] as const;

export function isTaxFreeCalificacion(calificacion: string): boolean {
  return /^E[1-6]$/.test(calificacion) || calificacion === "N1" || calificacion === "N2";
}
