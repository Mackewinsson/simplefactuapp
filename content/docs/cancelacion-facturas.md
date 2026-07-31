---
title: Anulación de facturas
description: Diccionario de campos de POST /cancel-invoice — cabeceras, body e idempotencia.
---

Guía de referencia para `POST /v1/cancel-invoice`. Esquema interactivo: [Referencia API — anular factura](/docs/api-reference#tag/Facturas/POST/cancel-invoice).

## Cabeceras

| Cabecera | Obligatoria | Qué es |
|----------|-------------|--------|
| `Content-Type` | Sí | `application/json` |
| `x-api-key` o `Authorization: Bearer …` | Sí | Tu API key. Ver [Autenticación](/docs/authentication). |
| `x-idempotency-key` | Sí | UUID que **generas tú** una vez por anulación lógica. Reutilízalo solo al reintentar el mismo body. |

> Misma regla que en el alta: [Idempotencia](/docs/authentication#idempotencia).

## Flujo async

1. `POST /cancel-invoice` → `202` con `{ jobId, status: "PENDING" }`.
2. `GET /jobs/:jobId` hasta **`SUCCEEDED` o `DEAD`** (`FAILED` = reintento en curso).

## Cuerpo

| Campo | Obligatorio | Descripción |
|-------|-------------|-------------|
| `nif` / `nombre` | Sí | Emisor (obligado a emitir). |
| `facturaAnulada` | Sí | Factura a anular: `idEmisorFacturaAnulada`, `numSerieFacturaAnulada`, `fechaExpedicionFacturaAnulada` (`DD-MM-YYYY`). |
| `sistemaInformatico` | Sí | Mismo bloque que en el alta (identifica el SIF). |
| `huella` + `tipoHuella` + `fechaHoraHusoGenRegistro` | No* | Si omites los tres, el servidor los genera. |
| `sinRegistroAnterior` | No | `"S"` si no hay registro previo en la cadena. Si se omite, el servidor lo infiere. |
| `encadenamiento.registroAnterior` | No | Si hace falta y se omite, el servidor usa la última huella de la cadena. |
| `rechazoPrevio` | No | `S` / `N` (default `N`). |

\*Recomendado omitir huella en integraciones nuevas.

## Ejemplo mínimo (auto-huella)

```bash
curl -s -X POST "$API_BASE/cancel-invoice" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -H "x-idempotency-key: $(uuidgen)" \
  -d "{
    \"nif\": \"$NIF\",
    \"nombre\": \"$NOMBRE\",
    \"facturaAnulada\": {
      \"idEmisorFacturaAnulada\": \"$NIF\",
      \"numSerieFacturaAnulada\": \"2026/F-001\",
      \"fechaExpedicionFacturaAnulada\": \"15-01-2026\"
    },
    \"sistemaInformatico\": {
      \"nombreRazon\": \"$NOMBRE\",
      \"nif\": \"$NIF\",
      \"nombreSistemaInformatico\": \"MyERP\",
      \"idSistemaInformatico\": \"01\",
      \"version\": \"1.0.0\",
      \"tipoUsoPosibleSoloVerifactu\": \"S\",
      \"tipoUsoPosibleMultiOT\": \"N\",
      \"indicadorMultiplesOT\": \"N\"
    }
  }"
```

## Errores

Ver [Códigos de error](/docs/error-codes). Conflictos de cadena: `409` (`ChainContinuityError` / `ChainStateError`).
