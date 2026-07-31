---
title: Consola de integrador (gestoría / B2B)
description: Cómo las gestorías e integradores B2B gestionan varios autónomos en Simple*Factu sin la clave de administración global.
---

## ¿Para quién es?

Si eres una **gestoría, asesoría o empresa integradora B2B** que da de alta y monitoriza facturas de varios clientes (autónomos), usa la consola de integrador en la app (ruta `/partner`) o la API de gestoría directamente.

Cada autónomo tiene su propia cuenta en el API, su certificado y su NIF autorizado (`allowed_nif`).

## Acceso a la consola (producto)

1. Solicita acceso de gestoría a [soporte@simplefactu.com](mailto:soporte@simplefactu.com) (o usa el alta que te indiquemos).
2. Tras iniciar sesión verás el enlace **Consola integrador** en la navegación.
3. La primera visita provisiona automáticamente tu cuenta de integrador (`rp_<tu userId>`) y una clave API de gestoría (solo servidor; no se muestra en el navegador).

> **Nota para operadores de la plataforma:** el rol de gestoría en Clerk se asigna con `publicMetadata.role = "partner"` o la lista `PARTNER_CLERK_USER_IDS`. Eso lo configura el equipo Simple\*Factu, no el cliente final.

## Qué puedes hacer en `/partner`

| Acción | Descripción |
|--------|-------------|
| Resumen | Indicadores: total autónomos, activos, suspendidos, sin certificado |
| Listar autónomos | Cuentas hijas vinculadas a tu cuenta de integrador |
| Alta autónomo | Identificador + NIF autorizado (debe coincidir con el certificado) |
| Detalle | Suspender/reactivar, generar clave API de integración, subir certificado `.pfx` |
| Envíos | Ver últimos envíos AEAT del autónomo |

## API para integradores

Si prefieres tu propio software en lugar del panel web:

- Documentación del API: [Gestoría / partner (repo API)](https://github.com/Mackewinsson/simplefactu/blob/main/docs/PARTNER_GESTORIA.md)
- Permisos (scopes) de tu clave: `partner:tenants:read`, `partner:tenants:write`
- Rutas bajo `/v1/partner/tenants` y sub-rutas (`jobs`, `chains`, `api-keys`, `certificate`)

La clave de gestoría **no** envía facturas: para eso emites una API key por autónomo y el autónomo (o su ERP) llama a `POST /send-invoice`.

Flujo típico HTTP:

1. `POST /partner/tenants` con `allowedNif` del autónomo.
2. Subir certificado de la cuenta hija (`…/certificate`).
3. Crear API key de la cuenta hija (`…/api-keys`) con permisos de facturación.
4. El ERP del autónomo llama `POST /v1/send-invoice` con esa clave.

## Certificado y NIF

- Al crear un autónomo defines el **NIF autorizado**.
- El certificado que subas debe ser del **mismo titular** (mismo NIF) — si no, **422** `cert_nif_mismatch`.
- El `nif` en `send-invoice` debe coincidir con `allowed_nif` — si no, **422** `allowed_nif_mismatch`.
- En QA y producción el API exige certificado por cuenta (`REQUIRE_TENANT_CERTIFICATE`).

## Diferencia con el panel de operación (admin)

| | Consola integrador (`/partner`) | Operación plataforma (`/admin`) |
|--|--------------------------------|--------------------------------|
| Quién | Gestorías e integradores B2B | Personal de la plataforma |
| Clave API | Permisos de gestoría en cuenta `rp_*` | `SIMPLEFACTU_ADMIN_KEY` / `ADMIN_KEY` |
| Alcance | Solo tus autónomos (cuentas hijas) | Todas las cuentas del sistema |
| Cuándo se necesita | Gestionar clientes y sus envíos | Monitorizar trabajos, métricas, auditoría global |
