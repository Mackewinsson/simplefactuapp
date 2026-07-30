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
2. `GET /jobs/:jobId` hasta `SUCCEEDED`, `FAILED` o `DEAD`.

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
| `refExterna` | No | Referencia libre del ERP (máx. 60). |

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

Array de 1–12 líneas. Cada línea:

| Campo | Notas |
|-------|-------|
| `base` | Siempre obligatorio. |
| `clave` | Clave de régimen (`01` = general). Obligatorio para IVA/IGIC. |
| `calif` | `S1` / `S2` / `N1` / `N2` — excluyente con `causaExencion`. |
| `causaExencion` | `E1`–`E6` — operación exenta; no enviar `tipo`/`cuota`. |
| `tipo` / `cuota` | Tipo impositivo y cuota; obligatorios con `calif=S1` (salvo casos especiales). |
| `impuesto` | Opcional; default IVA (`01`). |

Ejemplo sujeta: `{ "clave": "01", "calif": "S1", "tipo": 21, "base": 100, "cuota": 21 }`.  
Ejemplo exenta: `{ "clave": "01", "causaExencion": "E1", "base": 200 }`.

## Sistema informático (`sistemaInformatico`)

Obligatorio. Identifica el software ante AEAT (`nombreRazon`, `nif` o `idOtro`, `nombreSistemaInformatico`, `idSistemaInformatico`, `version`, y los tres flags `tipoUsoPosibleSoloVerifactu` / `tipoUsoPosibleMultiOT` / `indicadorMultiplesOT`).

`numeroInstalacion` es opcional: si lo omites, el servidor lo genera y lo reutiliza para esa instalación.

## Huella y encadenamiento

| Campo | Obligatorio | Comportamiento |
|-------|-------------|----------------|
| `huella` + `tipoHuella` + `fechaHoraHusoGenRegistro` | No* | Si omites **los tres**, el servidor los genera (cadena canónica AEAT + SHA-256). Si envías uno, envía los tres. |
| `primerRegistro` | No | Si se omite, se infiere desde `chain_registry`. |
| `encadenamiento.registroAnterior` | No | Si hace falta y se omite, el servidor usa la última huella de la cadena. |

\*Recomendado omitirlos en integraciones nuevas (camino feliz del [Inicio rápido](/docs/quickstart)).

Conceptos: [Huella](/docs/concepts#huella-sha-256), [Encadenamiento](/docs/concepts#encadenamiento), [Primer registro](/docs/concepts#primer-registro-primerregistro-true).

## Campos avanzados (AEAT)

Rectificativas (`tipoRectificativa`, `importeRectificacion`, `facturasRectificadas`), subsanación, tercero, `macrodato`, `cupon`, `fechaFinVeriFactu`, etc. están documentados con reglas AEAT en la [Referencia API — POST /send-invoice](/docs/api-reference#tag/Facturas/POST/send-invoice).

## Respuesta 202

```json
{
  "success": true,
  "jobId": "3e033807-17a0-4e1e-b1ba-7711d690fb3f",
  "status": "PENDING"
}
```

Luego consulta `GET /jobs/:jobId`. Errores frecuentes: [Códigos de error](/docs/error-codes).
