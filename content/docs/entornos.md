---
title: Entornos
description: QA vs producción, base URL /v1 y qué certificado/NIF usar.
---

## Bases URL

Usa siempre el prefijo **`/v1`** en integraciones nuevas:

| Entorno | Base URL | AEAT |
|---------|----------|------|
| **QA** (pruebas) | `https://api.qa.simplefactu.com/v1` | Preproducción |
| **Producción** | `https://api.simplefactu.com/v1` | Producción |

Ejemplo: `POST https://api.qa.simplefactu.com/v1/send-invoice`.

Las mismas rutas existen **sin** `/v1` por compatibilidad (`POST /send-invoice`). Esas llamadas reciben cabeceras de deprecación (`Deprecation: true` + `Link` al sucesor `/v1/...`). Las rutas raíz se eliminarán en v2. Exentas: `/health`, `/ready`, `/openapi.json`, `/api-docs`.

OpenAPI en vivo: `GET {base-sin-v1}/openapi.json`. En el portal: [Referencia API](/docs/api-reference) (Scalar; no incluye rutas `/admin` ni configuración de webhooks).

> **Probar en Scalar:** el servidor por defecto del portal suele apuntar a la API de **documentación/QA** (`SIMPLEFACTU_DOCS_API_BASE_URL` / `api.qa…`), no necesariamente a producción. Usa la clave del entorno correcto.

## Certificados y NIFs

AEAT valida NIFs **reales** incluso en preproducción. No existen NIFs ficticios de prueba.

- Usa el **NIF del titular del certificado** FNMT como emisor (`nif` y, normalmente, `sistemaInformatico.nif`).
- Destinatario de prueba habitual: `Q2826004J` (FNMT-RCM), si aplica a tu caso.
- En QA y producción cada cuenta **debe** tener su propio PFX (`REQUIRE_TENANT_CERTIFICATE=true`).

## Cómo elegir entorno

1. Integra y valida el happy path en **QA**.
2. Cuando tengas un job `SUCCEEDED` estable, pide (o usa) la API key de **producción** y cambia solo `API_BASE`.
3. No mezcles claves de QA contra el host de producción.

Ver [Inicio rápido](/docs/quickstart) y [Autenticación](/docs/authentication).
