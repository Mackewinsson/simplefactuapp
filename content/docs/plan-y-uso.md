---
title: Plan y uso
description: GET /me/plan, GET /me/usage y qué significa HTTP 402.
---

## Consultar plan y uso

Requiere scope `invoices:read`.

```bash
curl -s "$API_BASE/me/plan" -H "x-api-key: $API_KEY"
curl -s "$API_BASE/me/usage?months=12" -H "x-api-key: $API_KEY"
```

OpenAPI: [GET /me/plan](/docs/api-reference#tag/Facturación/GET/me/plan).

`GET /me/plan` incluye el plan actual, contadores del mes y `status` del tenant (`ACTIVE` / `SUSPENDED`).

## HTTP 402

Cuando la facturación de límites está activa en el API (`BILLING_ENABLED`), superar peticiones o facturas del mes devuelve **402**.

- Revisa `GET /me/plan` para ver límites y uso.
- El **checkout** no está en esta API (no existe `POST /me/upgrade`). Los autónomos de la app web usan [Ajustes → Facturación](/settings/billing) (Lemon Squeezy). Los integradores ERP escriben a [soporte@simplefactu.com](mailto:soporte@simplefactu.com) para ampliar plan.

## Tenant suspendido

Un tenant `SUSPENDED` recibe **403** en operaciones de escritura. Contacta soporte si crees que es un error.
