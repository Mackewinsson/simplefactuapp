---
title: Registros AEAT
description: Historial inmutable de altas y anulaciones aceptadas por AEAT (GET /me/invoice-records).
---

Cada alta o anulación aceptada por AEAT (`Correcto` / `ParcialmenteCorrecto`) se guarda en un registro **solo altas (inmutable)**: huella, CSV, payload enviado y respuesta SOAP.

## Listado

`GET /v1/me/invoice-records` — scope `invoices:read`. Esquema: [Referencia API — GET /me/invoice-records](/docs/api-reference#tag/Facturas/GET/me/invoice-records).

| Query | Descripción |
|-------|-------------|
| `from` / `to` | Rango de fechas |
| `serie` | Prefijo de serie |
| `tipo` | `ALTA` o `ANULACION` |
| `limit` / `offset` | Paginación |

```bash
curl -s "$API_BASE/me/invoice-records?limit=20" \
  -H "x-api-key: $API_KEY"
```

## Detalle

`GET /v1/me/invoice-records/:id` — incluye `payload` y `aeatResponse` completos.

## Para qué sirve

- Reconciliar con [webhooks](/docs/webhooks) (`invoice.succeeded`) si una entrega se perdió.
- Exportar histórico (la app web también ofrece `/invoices/records` + CSV).
- Auditar huellas y CSV sin depender solo de tu base de datos ERP.

No hay `UPDATE`/`DELETE` de registros: las correcciones se modelan emitiendo nuevas facturas (p. ej. rectificativas R1–R5).
