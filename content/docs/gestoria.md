---
title: Consola de integrador (gestoría / B2B)
description: Cómo las gestorías e integradores B2B gestionan varios autónomos en Simple*Factu sin la clave de administración global.
---

## Roles de la plataforma

| Rol | Quién | Panel UI | Tenant API | Cómo se asigna |
|-----|-------|----------|------------|----------------|
| **Autónomo** | Usuario final | `/invoices`, `/settings/verifactu` | `sf_<userId>` | Sin role en Clerk (por defecto) |
| **Integrador B2B / gestoría** | Asesoría, ERP, integradores | `/partner` — Consola integrador | `rp_<userId>` | `publicMetadata.role = "partner"` o `PARTNER_CLERK_USER_IDS` |
| **Operador plataforma** | Personal simplefactu | `/admin` — Operación plataforma | `SIMPLEFACTU_ADMIN_KEY` | `publicMetadata.role = "admin"` o `ADMIN_CLERK_USER_IDS` |

Un autónomo **nunca** ve panel de administración. Un integrador ve su consola de autónomos pero no accede al admin global. Un operador puede tener ambos roles si necesita también gestionar clientes como integrador.

## ¿Para quién es la consola de integrador?

Si eres una **gestoría, asesoría o empresa integradora B2B** que da de alta y monitoriza facturas de varios clientes (autónomos), usa la consola de integrador en la app (`/partner`) o la API partner directamente.

Cada autónomo tiene su propio tenant en el API, su certificado y su NIF autorizado (`allowed_nif`).

## Acceso a la consola

1. Tu usuario Clerk debe tener rol partner: `publicMetadata.role = "partner"` en el dashboard de Clerk, **o** tu `userId` en `PARTNER_CLERK_USER_IDS` (variable del servidor en Vercel).
2. Tras iniciar sesión verás el enlace **Consola integrador** en la navegación (con badge azul).
3. La primera visita provisiona automáticamente tu tenant de integrador (`rp_<tu userId>`) y una API key partner (solo servidor; no se muestra en el navegador).

## Qué puedes hacer en `/partner`

| Acción | Descripción |
|--------|-------------|
| Dashboard | KPIs: total autónomos, activos, suspendidos, sin certificado |
| Listar autónomos | Sub-tenants vinculados a tu cuenta de integrador |
| Alta autónomo | Identificador + NIF autorizado (debe coincidir con el certificado) |
| Detalle | Suspender/reactivar, generar API key de integración, subir certificado `.pfx` |
| Jobs | Ver últimos envíos AEAT del autónomo |

## API para integradores

Si prefieres tu propio software en lugar del panel web:

- Documentación del API: [Partner / gestoría (repo API)](https://github.com/Mackewinsson/simplefactu/blob/main/docs/PARTNER_GESTORIA.md)
- Scopes de tu clave: `partner:tenants:read`, `partner:tenants:write`
- Rutas bajo `/v1/partner/tenants` y sub-rutas (`jobs`, `chains`, `api-keys`, `certificate`)

La clave partner **no** envía facturas: para eso emites una API key por autónomo y el autónomo (o su ERP) llama a `POST /send-invoice`.

## Certificado y NIF

- Al crear un autónomo defines el **NIF autorizado**.
- El certificado que subas debe ser del **mismo titular** (mismo NIF).
- En QA y producción el API exige certificado por tenant (`REQUIRE_TENANT_CERTIFICATE`); no hay certificado compartido de plataforma.

## Diferencia con el panel de operación (admin)

| | Consola integrador (`/partner`) | Operación plataforma (`/admin`) |
|--|--------------------------------|--------------------------------|
| Quién | Gestorías e integradores B2B | Personal de la plataforma |
| Clave API | Partner scopes en tenant `rp_*` | `SIMPLEFACTU_ADMIN_KEY` |
| Alcance | Solo tus autónomos hijos | Todos los tenants del sistema |
| Cuándo se necesita | Gestionar clientes y sus envíos | Monitorizar jobs, métricas, auditoría global |
