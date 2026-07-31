---
title: Envío de facturas
description: Diccionario de campos de POST /send-invoice — cabeceras, body, qué es obligatorio y qué genera el servidor.
---

Guía de referencia para `POST /v1/send-invoice`. Para el tutorial paso a paso con curl, usa el [Inicio rápido](/docs/quickstart). Esquema completo e interactivo: [Referencia API — POST /send-invoice](/docs/api-reference#tag/Facturas/POST/send-invoice).

## Cabeceras

| Cabecera | Obligatoria | Qué es |
|----------|-------------|--------|
| `Content-Type` | Sí | `application/json` |
| `x-api-key` o `Authorization: Bearer …` | Sí | Tu API key (`vf_…`). Ver [Autenticación](/docs/authentication). |
| `x-idempotency-key` | Sí | UUID (u otro string ≤ 128 chars) que **generas tú** una vez por factura. Reutilízalo solo al reintentar el mismo body tras un fallo de red. |

> **¿Qué valor en `x-idempotency-key`?** Un UUID nuevo por cada factura lógica. Ejemplo: `550e8400-e29b-41d4-a716-446655440000`. Más detalle en [Autenticación → Idempotencia](/docs/authentication#idempotencia).

## Flujo async

1. `POST /send-invoice` → `202` con `{ jobId, status: "PENDING" }`.
2. `GET /jobs/:jobId` hasta **`SUCCEEDED` o `DEAD`** (`FAILED` = reintento en curso; no dejes de hacer poll).

## Emisor e identificación de la factura

| Campo | Obligatorio | Descripción |
|-------|-------------|-------------|
| `nif` | Sí | NIF/NIE del obligado a emitir (emisor). |
| `nombre` | Sí | Nombre o razón social del emisor. |
| `numSerie` | Sí | Número de serie de la factura (único en la serie). La “serie” de encadenamiento es el prefijo antes de `/`, `-` o `_`. |
| `fecha` | Sí | Fecha de expedición `DD-MM-YYYY`. |
| `tipoFactura` | Sí | `F1`–`F5` o `R1`–`R5`. |
| `descripcion` | Sí | Descripción de la operación (1–500 caracteres). |
| `fechaOperacion` | No | `DD-MM-YYYY`. No puede ser posterior a `fecha` salvo claves de régimen 14/15 (AEAT 1146). |
| `refExterna` | No | Referencia libre del ERP (máx. 60). Omitir si no usas referencia propia. |

## Destinatario

| Campo | Obligatorio | Descripción |
|-------|-------------|-------------|
| `destNombre` | Casi siempre | Nombre o razón social del cliente. |
| `destNif` | XOR con `destIdOtro` | NIF español del destinatario. |
| `destIdOtro` | XOR con `destNif` | Identificador no NIF (`codigoPais`, `idType`, `id`) — mismas reglas que en sistema informático. |

**Excepción F2:** factura simplificada sin identificación de destinatario — **no** envíes `destNif` / `destNombre` / `destIdOtro` (AEAT 1190). Hay límite de importe (€3000).

## Importes

| Campo | Obligatorio | Descripción |
|-------|-------------|-------------|
| `cuotaTotal` | Sí | Suma de cuotas repercutidas del desglose. |
| `total` | Sí | Importe total de la factura (base + IVA, según tu caso). |

## Desglose (`detalles`)

Array de 1–12 líneas. En OpenAPI solo `base` aparece como `required` incondicional; en tiempo de ejecución el servidor exige además coherencia AEAT (igual que en la [Referencia API](/docs/api-reference#tag/Facturas/POST/send-invoice)):

| Campo | Notas |
|-------|-------|
| `base` | Siempre obligatorio. |
| `clave` | Clave de régimen (2 dígitos). **Obligatoria** si `impuesto` se omite, es `01` (IVA) o `03` (IGIC). Opcional para IPSI (`02`) / Otros (`05`). |
| `calif` **o** `causaExencion` | **Uno de los dos** (XOR; AEAT 1195/1196). No ambos; no ninguno. |
| `calif` | `S1` / `S2` / `N1` / `N2`. |
| `causaExencion` | `E1`–`E6` — operación exenta; **no** enviar `tipo` / `cuota` / recargo (1238). |
| `tipo` / `cuota` | Con `calif=S1` (sin `baseImponibleACoste`): obligatorios (1208). Con `S2`: deben ser `0` (1198). Con `N1`/`N2`: omitir (1237). |
| `impuesto` | Opcional; default IVA (`01`). |
| Recargo | Solo con `calif=S1`; `tipoRecargoEquivalencia` y `cuotaRecargoEquivalencia` juntos (1281/1284). |
| `baseImponibleACoste` | Solo con `clave=06` o `impuesto` `02`/`05` (1257). |

Ejemplos:

```json
{ "clave": "01", "calif": "S1", "tipo": 21, "base": 100, "cuota": 21 }
{ "clave": "01", "causaExencion": "E1", "base": 200 }
{ "clave": "01", "calif": "N1", "base": 1000 }
```

## Sistema informático (`sistemaInformatico`)

Por defecto **no lo envías**: Simple\*Factu es el SIF y la API rellena el bloque ante AEAT.

Solo es obligatorio si soporte/admin activa **modo SIF del cliente** (`clientSifEnabled`) en tu tenant: entonces debes enviar el bloque completo (tu software es el fabricante). Detalle de campos en ese caso:

| Campo | Notas |
|-------|-------|
| `nombreRazon` | Fabricante / titular del SIF. |
| `nif` **u** `idOtro` | Excluyentes; uno de los dos. |
| `nombreSistemaInformatico` | Nombre comercial (máx. 30). |
| `idSistemaInformatico` | Exactamente **2** caracteres `[A-Z0-9]` (p. ej. `"01"`). Forma la clave de instalación `{NIF}\|{idSistema}\|{NIF fabricante}`. **Si cambia**, nuevo `numeroInstalacion` y cadena distinta. |
| `version` | Versión del software. |
| `numeroInstalacion` | Opcional; si lo omites, el servidor lo genera. |
| `tipoUsoPosibleSoloVerifactu` | Capacidad del **producto**: `S` = solo Veri\*Factu; `N` = admite otros modos. |
| `tipoUsoPosibleMultiOT` | Capacidad multi–**obligado tributario (OT)**: `S` = admite varios OT; `N` = un solo OT. |
| `indicadorMultiplesOT` | Uso de **esta instalación**: `S` = factura para varios OT; `N` = solo uno. |

Con el modo por defecto (SIF Simple\*Factu) puedes omitir todo el objeto.

## Huella y encadenamiento

| Campo | Obligatorio | Comportamiento |
|-------|-------------|----------------|
| `huella` + `tipoHuella` + `fechaHoraHusoGenRegistro` | No* | Si omites **los tres**, el servidor los genera. Si envías uno, envía los tres (si no → **400**). |
| `primerRegistro` | No | Si se omite, se infiere desde `chain_registry`. |
| `encadenamiento.registroAnterior` | No | Si hace falta y se omite, el servidor usa la última huella de la cadena. |

\*Recomendado omitirlos en integraciones nuevas (camino feliz del [Inicio rápido](/docs/quickstart)).

Conceptos: [Huella](/docs/concepts#huella-sha-256), [Encadenamiento](/docs/concepts#encadenamiento), [Primer registro](/docs/concepts#primer-registro-primerregistro-true).

## Campos avanzados (opt-in)

Omitir en el caso normal. Solo cuando aplica:

| Campo | Cuándo |
|-------|--------|
| `cupon` | Solo facturas con cupones promocionales (`S`/`N`). |
| `emitidaPorTerceroODestinatario` | `T` = tercero (requiere bloque `tercero`); `D` = autofactura (sin `tercero`). |
| `tercero` | Solo si el flag es `T`. |
| `macrodato` | Solo importes ≥ ±100M €. |
| `fechaFinVeriFactu` | Solo al salir del régimen Veri\*Factu (`31-12-YYYY`). |
| `subsanacion` / `rechazoPrevio` | Solo reenvíos / rechazos previos AEAT. |

### Rectificativas (`R1`–`R5`)

Cuando `tipoFactura` es `R1`–`R5`:

| Campo | Regla |
|-------|--------|
| `tipoRectificativa` | Obligatorio: `S` (sustitución) o `I` (por diferencias). Prohibido fuera de R1–R5. |
| `facturasRectificadas` | Factura(s) que se rectifican (`idEmisorFactura`, `numSerieFactura`, `fechaExpedicionFactura`). |
| `importeRectificacion` | Obligatorio si `tipoRectificativa=S` (importes **originales**). Prohibido si `I`. |

- **`S`:** el `Desglose` lleva la **diferencia**; `importeRectificacion` con base/cuota originales.
- **`I`:** el `Desglose` lleva los importes **corregidos totales**; no envíes `importeRectificacion`.

Detalle de reglas AEAT: [Referencia API — POST /send-invoice](/docs/api-reference#tag/Facturas/POST/send-invoice).

## Respuesta 202

```json
{
  "success": true,
  "jobId": "3e033807-17a0-4e1e-b1ba-7711d690fb3f",
  "status": "PENDING"
}
```

Luego consulta `GET /jobs/:jobId`. Errores frecuentes: [Códigos de error](/docs/error-codes).
