---
title: Changelog
description: Cambios relevantes del contrato API para integradores ERP.
---

Entradas breves orientadas a quien ya tenía una integración antigua. Para el diccionario actual: [Envío de facturas](/docs/envio-facturas).

## 2026-07 — Contrato OpenAPI alineado + flags SIF en XML

### Documentación (Scalar / guías)

- **`detalles`**: OpenAPI deja claro que solo `base` es `required` incondicional; el texto lista las reglas runtime (`clave` IVA/IGIC, XOR `calif`/`causaExencion`, S1/S2/N1/exenta).
- Campos opt-in (`cupon`, tercero, `macrodato`, …): documentados como “omitir en el caso normal”.
- Triada huella: omitir las tres o enviar las tres (parcial → 400), en cada property.
- `sistemaInformatico`: significado de OT, `idSistemaInformatico` (2 chars) y diferencia MultiOT vs indicador.

### Comportamiento

- Los flags `tipoUsoPosibleSoloVerifactu`, `tipoUsoPosibleMultiOT` e `indicadorMultiplesOT` del body **se emiten en el XML AEAT** (antes el XML fijaba `S`/`S`/`S` ignorando el body). Valores típicos autónomo: `S` / `N` / `N`.

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
