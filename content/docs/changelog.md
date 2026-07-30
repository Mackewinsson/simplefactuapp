---
title: Changelog
description: Cambios relevantes del contrato API para integradores ERP.
---

Entradas breves orientadas a quien ya tenía una integración antigua. Para el diccionario actual: [Envío de facturas](/docs/envio-facturas).

## 2026-07 — Huella automática e idempotencia

### Qué puedes omitir ahora

- **`huella`**, **`tipoHuella`** y **`fechaHoraHusoGenRegistro`**: si omites **los tres**, el servidor los genera (cadena canónica AEAT + SHA-256). Si envías uno, envía los tres.
- **`primerRegistro`** y **`encadenamiento`**: opcionales; el servidor infiere el estado desde `chain_registry`.

Camino feliz: [Inicio rápido](/docs/quickstart).

### Qué es obligatorio (y no lo inventa el servidor)

- Cabecera **`x-idempotency-key`**: UUID (u otro string ≤ 128) que **generas tú** una vez por factura o anulación lógica. Reutilízala solo al reintentar el **mismo** body tras un fallo de red.

Detalle: [Autenticación → Idempotencia](/docs/authentication#idempotencia).

### Referencia

- Body de alta: [Envío de facturas](/docs/envio-facturas)
- Body de anulación: [Anulación de facturas](/docs/cancelacion-facturas)
- OpenAPI: [Referencia API — POST /send-invoice](/docs/api-reference#tag/Facturas/POST/send-invoice)
