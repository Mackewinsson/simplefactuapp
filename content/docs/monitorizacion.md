---
title: Jobs DEAD y disponibilidad
description: Qué hacer si un envío queda en DEAD, y sondas públicas /health y /ready.
---

## Si una factura queda en DEAD

`DEAD` significa que el sistema agotó los reintentos y AEAT **no** aceptó el registro (o no se pudo completar).

1. Lee `lastError` en `GET /jobs/:jobId` — ver [Errores](/docs/error-codes).
2. Corrige la causa (NIF, desglose, etc.).
3. Emite una factura nueva o rectificativa; no reutilices el mismo job.
4. Escribe a [soporte@simplefactu.com](mailto:soporte@simplefactu.com) con `jobId` y `requestId` si el fallo fue transitorio.

Usuarios de la app web: abre la factura y usa **Emitir corrección** o contacta soporte.

## Sondas públicas (integradores y ops)

Sin autenticación:

| URL | Uso |
|-----|-----|
| `GET /health` | Proceso vivo |
| `GET /ready` | DB + migraciones + worker + cola — recomendada para uptime checks |

Ejemplos: `https://api.qa.simplefactu.com/ready`, `https://api.simplefactu.com/ready`.

## Solo operadores de plataforma

Configuración de alertas email/Slack (`DEAD_JOB_NOTIFY_*`, Resend), panel `/admin` y Upptime: ver [docs/RUNBOOK.md](https://github.com/Mackewinsson/simplefactu/blob/main/docs/RUNBOOK.md) en el repositorio del API. Los integradores ERP **no** configuran el `.env` del VPS.
