---
title: Documentación
description: Cómo integrar tu sistema de facturación con Veri*Factu a través de la API Simple*Factu.
---

{{APP_DISPLAY_NAME}} es el intermediario entre **tu sistema de facturación y Hacienda (AEAT)**.
Tú envías un JSON con los datos de la factura; nosotros construimos el XML, lo firmamos con tu certificado y lo enviamos a AEAT por SOAP.

## Cómo funciona en 30 segundos

```
Tu sistema   →   POST /v1/send-invoice (JSON + x-idempotency-key)
                      │
              {{APP_DISPLAY_NAME}} valida y encola
                      │
              ← 202 PENDING (jobId)
                      │
Tu sistema   →   GET /v1/jobs/:jobId  (consulta periódica)
                      │
              Proceso en segundo plano → XML SOAP mTLS → AEAT
                      │
              ← SUCCEEDED + CSV + URL de verificación + QR
```

Cuando el trabajo llega a `SUCCEEDED` tienes el **CSV** (código de verificación de AEAT) y el **QR** que debes imprimir en la factura. Todo lo demás — huellas, encadenamiento, firma SOAP, reintentos — lo gestionamos nosotros.

> ¿Actualizaste la integración? Ver [Registro de cambios](/docs/changelog).

## Lista de comprobación para producción (ERP)

1. Credenciales de **QA** (API key + permisos / scopes) — [Autenticación](/docs/authentication) / [Entornos](/docs/entornos)
2. Certificado FNMT (`.pfx`) subido con `POST /me/certificate`
3. Primera factura en QA → trabajo `SUCCEEDED` — [Inicio rápido](/docs/quickstart)
4. Manejo de errores 4xx/AEAT y trabajos `DEAD` — [Errores](/docs/error-codes)
5. Consulta periódica estable **o** [webhooks](/docs/webhooks) + reconciliación con [registros](/docs/registros)
6. Paso a **producción** (nueva API key + mismo flujo) — [Entornos](/docs/entornos)

## Por dónde empezar

1. **[Conceptos clave](/docs/concepts)** — qué es una huella, el encadenamiento, el CSV y el primer registro.
2. **[Entornos](/docs/entornos)** — QA vs producción, base URL `/v1`.
3. **[Inicio rápido](/docs/quickstart)** — emite tu primera factura con `curl`.
4. **[Envío de facturas](/docs/envio-facturas)** — diccionario de campos de `POST /send-invoice`.
5. **[Anulación de facturas](/docs/cancelacion-facturas)** — diccionario de `POST /cancel-invoice`.
6. **[Autenticación](/docs/authentication)** — API key, certificado e idempotencia.
7. **[Verificar NIF y consultar AEAT](/docs/verificar-nif)** — antes y después del envío.
8. **[Registros AEAT](/docs/registros)** — historial inmutable (solo altas).
9. **[Webhooks](/docs/webhooks)** — notificaciones `invoice.succeeded` / `invoice.failed`.
10. **[Plan y uso](/docs/plan-y-uso)** — límites y HTTP 402.
11. **[Gestoría](/docs/gestoria)** — panel y API para asesorías con varios autónomos.
12. **[Referencia API](/docs/api-reference#tag/Facturas/POST/send-invoice)** — OpenAPI interactiva (Scalar).
13. **[Registro de cambios](/docs/changelog)** — qué cambió respecto a integraciones antiguas.

Contrato técnico ampliado (BFF, administración, gestoría): [INTEGRATION.md en GitHub](https://github.com/Mackewinsson/simplefactu/blob/main/docs/INTEGRATION.md).

## ¿Cómo accedo?

| Perfil | Cómo usar {{APP_DISPLAY_NAME}} |
|--------|-------------------------------|
| **Autónomo o pyme** que usa la app web | Registro en [simplefactu.com](https://simplefactu.com) — certificado y envío desde Ajustes Veri\*Factu; archivo en Facturas → Registros AEAT |
| **Gestoría / asesoría** | Panel [Gestoría](/docs/gestoria) (ruta `/partner`) o API de gestoría — una cuenta hija por autónomo |
| **ERP o integrador** (servidor a servidor) | API key emitida por soporte; `POST /v1/send-invoice` desde tu servidor — [Autenticación](/docs/authentication) |

Los conceptos (huella, encadenamiento, CSV) son los mismos en todos los casos — solo cambia quién llama a la API.

## Soporte

Cada respuesta de la API incluye un `requestId`. Si algo falla, escríbenos a [soporte@simplefactu.com](mailto:soporte@simplefactu.com) con ese UUID y podremos ver la traza completa del envío.
