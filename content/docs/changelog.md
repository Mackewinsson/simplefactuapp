---
title: Registro de cambios
description: Cambios relevantes del contrato API para integradores ERP.
---

Entradas breves orientadas a quien ya tenía una integración antigua. Para el diccionario actual: [Envío de facturas](/docs/envio-facturas).

## 2026-07 — Documentación ERP: recorrido completo y consistencia

### Guías nuevas / reordenadas

- [Entornos](/docs/entornos) — QA vs prod, prefijo `/v1`, NIFs reales.
- [Verificar NIF](/docs/verificar-nif), [Registros AEAT](/docs/registros), [Webhooks](/docs/webhooks), [Plan y uso](/docs/plan-y-uso).
- Lista de comprobación para producción y soporte en [índice](/docs) (`soporte@simplefactu.com`).

### Clarificaciones de contrato (sin cambio de runtime API)

- Consulta de estado: estados terminales = `SUCCEEDED` | `DEAD` (`FAILED` reintenta).
- Permisos (scopes): `GET /invoices/lookup` → `invoices:read`; `POST /verify-nif` → `nif:read`.
- No existe `POST /me/upgrade` en el API; cobro en la app (Lemon Squeezy).
- HTTP **422** documentado (`tenant_certificate_required`, `allowed_nif_mismatch`, `cert_nif_mismatch`, códigos de subida de PFX).
- Scalar no lista `/admin` ni configuración de webhooks; ver guías + [INTEGRATION.md](https://github.com/Mackewinsson/simplefactu/blob/main/docs/INTEGRATION.md).

### Aplicación web alineada con el contrato

- Panel de gestoría: ejemplo curl con **API key del autónomo** (no la de gestoría) y body real de `send-invoice`.
- App: trabajos en `FAILED` siguen en consulta periódica / “reintento automático”; solo `DEAD` es fallo definitivo.
- Sitemap y enlaces profundos de Scalar para NIF, registros, plan y jobs.

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

- Cuerpo de alta: [Envío de facturas](/docs/envio-facturas)
- Cuerpo de anulación: [Anulación de facturas](/docs/cancelacion-facturas)
- OpenAPI: [Referencia API — POST /send-invoice](/docs/api-reference#tag/Facturas/POST/send-invoice)
