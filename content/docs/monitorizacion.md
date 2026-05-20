---
title: Monitorización y alertas
description: Comprobar que el API está vivo y recibir avisos cuando un envío AEAT queda en DEAD.
---

# Monitorización y alertas

## Para usuarios del panel

Si una factura queda en estado **DEAD** en Verifactu, abre la factura y usa **Emitir corrección** o contacta con soporte. El equipo recibe alertas automáticas cuando el entorno está bien configurado.

## Para operadores (VPS + panel /admin)

### Sonda de disponibilidad

El API expone sin autenticación:

| URL | Uso |
|-----|-----|
| `GET /health` | Proceso vivo (200 aunque la DB falle) |
| `GET /ready` | DB + migraciones + worker + cola — **usa esta en Upptime / UptimeRobot** |

Configura una sonda cada 5 minutos contra `https://api.simplefactu.com/ready` (o el host QA equivalente).

Plantilla gratuita: [Upptime](https://github.com/upptime/upptime) — pasos en el `docs/RUNBOOK.md` del repositorio **simplefactu**.

### Alertas cuando un job queda DEAD

En `/opt/simplefactu/deploy/.env` del VPS:

```env
EMAILS_ENABLED=true
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=no-reply@simplefactu.com
DEAD_JOB_NOTIFY_EMAIL=ops@tudominio.com
# opcional: DEAD_JOB_NOTIFY_SLACK_URL=...
```

Sin al menos un `DEAD_JOB_NOTIFY_*`, los jobs DEAD solo aparecen en logs.

### Comprobar desde el panel

En **Admin → Inicio** o **Admin → Sistema** verás:

- Estado de `GET /ready`
- Contador de jobs **DEAD**
- Si `EMAILS_ENABLED`, `RESEND_API_KEY` y canales `DEAD_JOB_NOTIFY_*` están activos en el API

Estos flags los devuelve `GET /admin/diagnostics` (requiere `SIMPLEFACTU_ADMIN_KEY` correcta).
