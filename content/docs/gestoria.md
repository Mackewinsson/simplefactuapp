---
title: Panel de gestoría
description: Cómo las asesorías gestionan varios autónomos en Simple*Factu sin la clave de administración global.
---

## ¿Para quién es?

Si eres una **gestoría o asesoría** que da de alta y monitoriza facturas de varios clientes (autónomos), usa el panel **Gestoría** en la app (`/partner`) o la API partner directamente.

Cada autónomo tiene su propio tenant en el API, su certificado y su NIF autorizado (`allowed_nif`).

## Acceso a la app

1. Tu usuario Clerk debe tener rol partner: `publicMetadata.role = "partner"` en el dashboard de Clerk, **o** tu `userId` en `PARTNER_CLERK_USER_IDS` (variable del servidor en Vercel).
2. Tras iniciar sesión verás el enlace **Gestoría** en la navegación.
3. La primera visita provisiona automáticamente tu tenant de gestoría (`rp_<tu userId>`) y una API key partner (solo servidor; no se muestra en el navegador).

## Qué puedes hacer en `/partner`

| Acción | Descripción |
|--------|-------------|
| Listar autónomos | Sub-tenants vinculados a tu gestoría |
| Alta autónomo | Identificador + NIF autorizado (debe coincidir con el certificado) |
| Detalle | Suspender/reactivar, generar API key de integración, subir certificado `.pfx` |
| Jobs | Ver últimos envíos AEAT del autónomo |

## API para integradores de gestoría

Si prefieres tu propio software en lugar del panel web:

- Documentación del API: [Partner / gestoría (repo API)](https://github.com/Mackewinsson/simplefactu/blob/main/docs/PARTNER_GESTORIA.md)
- Scopes de tu clave: `partner:tenants:read`, `partner:tenants:write`
- Rutas bajo `/v1/partner/tenants` y sub-rutas (`jobs`, `chains`, `api-keys`, `certificate`)

La clave partner **no** envía facturas: para eso emites una API key por autónomo y el autónomo (o su ERP) llama a `POST /send-invoice`.

## Certificado y NIF

- Al crear un autónomo defines el **NIF autorizado**.
- El certificado que subas debe ser del **mismo titular** (mismo NIF).
- En QA y producción el API exige certificado por tenant (`REQUIRE_TENANT_CERTIFICATE`); no hay certificado compartido de plataforma.

## Diferencia con el panel Admin

| | Gestoría (`/partner`) | Admin (`/admin`) |
|--|----------------------|------------------|
| Quién | Asesorías | Personal de la plataforma |
| Clave API | Partner scopes en tenant `rp_*` | `SIMPLEFACTU_ADMIN_KEY` |
| Alcance | Solo tus autónomos hijos | Todos los tenants del sistema |
