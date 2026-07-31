---
title: Verificar NIF y consultar AEAT
description: POST /verify-nif antes de emitir y GET /invoices/lookup para reconciliar.
---

## Verificar un NIF (`POST /verify-nif`)

Comprueba si un NIF está identificado en AEAT **antes** de enviar la factura. Requiere scope `nif:read` y certificado de la cuenta en QA/prod.

```bash
curl -s -X POST "$API_BASE/verify-nif" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d '{"nif":"Q2826004J","nombre":"FNMT-RCM"}'
```

| Resultado | Significado |
|-----------|-------------|
| `200` + `resultado: "IDENTIFICADO"` | Puedes usar ese NIF como destinatario/emisor |
| `404` + `NO_IDENTIFICADO` | El NIF no figura en AEAT — corrígelo antes de `send-invoice` |

Si la cuenta tiene `allowed_nif` (cuenta hija de gestoría), el NIF consultado debe coincidir o recibirás **422** `allowed_nif_mismatch`.

OpenAPI: [POST /verify-nif](/docs/api-reference#tag/Verificación%20de%20NIF/POST/verify-nif) · [GET /invoices/lookup](/docs/api-reference#tag/Facturas/GET/invoices/lookup).

## Consultar factura en AEAT (`GET /invoices/lookup`)

Útil cuando un job quedó ambiguo (timeout, 5xx) y quieres saber si AEAT ya tiene la factura **sin** reenviarla. Requiere `invoices:read`.

Query obligatoria: `idEmisor`, `fecha` (`DD-MM-YYYY`). Opcional: `numSerie`.

```bash
curl -s "$API_BASE/invoices/lookup?idEmisor=$NIF&fecha=$(date +%d-%m-%Y)&numSerie=2026/F-001" \
  -H "x-api-key: $API_KEY"
```

La respuesta sigue el SOAP ConsultaFactu (estado en AEAT de esa factura). Misma restricción `allowed_nif` que en envío.

## Relación con el ledger

Tras un `SUCCEEDED`, la factura también queda en [Registros AEAT](/docs/registros) (`GET /me/invoice-records`). Usa lookup para preguntar a Hacienda; usa el historial para tu histórico local en Simple\*Factu.
