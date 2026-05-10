/**
 * Mensajes para la comprobación NIF+nombre contra Hacienda (servicio tipo VNIF).
 * Lenguaje orientado al usuario final, sin siglas técnicas obligatorias.
 */

/** Cuando la consulta solo informa (p. ej. Ajustes), sin rellenar el formulario. */
export const NIF_VERIFY_MATCH_USER =
  "Hacienda confirma que el nombre o la razón social coinciden con ese NIF/CIF.";

/** Tras comprobar en la factura nueva, los campos se sustituyen por los del registro. */
export const NIF_VERIFY_SUCCESS_UPDATED_USER =
  "Hacienda confirma que el nombre o la razón social coinciden con ese NIF/CIF. Hemos actualizado el NIF y el nombre con la forma en que figuran en su registro.";

export const NIF_VERIFY_NOT_MATCH_USER =
  "Hacienda no confirma que ese nombre corresponda a ese NIF/CIF. Comprueba el número, que la razón social o el nombre coincidan exactamente con la documentación (incluido tipo societario si aplica) y las mayúsculas.";

export const NIF_VERIFY_NEED_BOTH_USER =
  "Escribe el NIF/CIF y el nombre o razón social para poder comprobarlos con Hacienda.";

export const NIF_VERIFY_PERMISSION_USER =
  "Tu cuenta no puede consultar datos en Hacienda. Revisa Ajustes → Verifactu o vuelve a conectar la integración.";

export const NIF_VERIFY_SERVICE_USER =
  "No se ha podido completar la comprobación con Hacienda. Inténtalo de nuevo en unos minutos.";
