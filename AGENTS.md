# AGENTS.md — simplefactuapp

> App **Next.js 15** (App Router) + **Clerk** + **Prisma/Postgres**: facturación y envío a **simplefactu** (Veri\*Factu). Toda la lógica AEAT, huellas y encadenamiento vive en el API; aquí solo BFF, UI y persistencia local de facturas.

## Tabla de contenidos

1. [Repositorios relacionados](#repositorios-relacionados)
2. [Visión y stack](#visión-y-stack)
3. [Mapa del código](#mapa-del-código)
4. [Variables de entorno](#variables-de-entorno)
5. [Integración con simplefactu (BFF)](#integración-con-simplefactu-bff)
6. [Seguridad](#seguridad)
7. [Rutas y producto](#rutas-y-producto)
8. [Desarrollo local](#desarrollo-local)
9. [Base de datos y Prisma](#base-de-datos-y-prisma)
10. [Tests y scripts](#tests-y-scripts)
11. [Despliegue](#despliegue)

---

## Repositorios relacionados

| Repo | `AGENTS.md` |
|------|-------------|
| **Front (este repo)** | Este archivo. |
| **API (simplefactu)** | [GitHub](https://github.com/Mackewinsson/simplefactu/blob/main/AGENTS.md) · [local `../simplefactu/AGENTS.md`](../simplefactu/AGENTS.md) |

Documentación de contrato HTTP del API: [INTEGRATION.md](https://github.com/Mackewinsson/simplefactu/blob/main/docs/INTEGRATION.md) · operación del API: [OPERATIONS.md](https://github.com/Mackewinsson/simplefactu/blob/main/docs/OPERATIONS.md).

---

## Visión y stack

| Capa | Tecnología |
|------|------------|
| Framework | Next.js 15 (Turbopack en `pnpm dev`), React 19, TypeScript |
| Auth | `@clerk/nextjs` — sesión; rutas protegidas en `middleware.ts` |
| Datos app | PostgreSQL + Prisma 6 (`Invoice`, `Customer`, `Product`, `UserVerifactuAccount`, …) |
| API Veri\*Factu | HTTP desde **servidor** hacia `SIMPLEFACTU_API_BASE_URL` (p. ej. `http://localhost:3000/v1`) |

**Node:** `>=22` (ver `package.json` → `engines`).

---

## Mapa del código

```
app/
  layout.tsx, AppNav.tsx, page.tsx          Shell y home
  sign-in/ sign-up/                         Clerk
  invoices/                                 Listado, detalle, PDF, panel Veri*Factu
  invoices/new/                             Alta + Server Actions (verify NIF, envío)
  customers/ products/                      CRUD ligero
  settings/verifactu/                       Certificado PFX y datos emisor (simplefactu /me/certificate)
  admin/                                    Panel operador (tenants, jobs, sistema, auditoría, …)
  api/webhooks/clerk/                       Webhook Clerk (opcional)
lib/
  simplefactu/client.ts                     Cliente HTTP firmado con x-api-key (solo servidor)
  simplefactu/admin-server.ts               Llamadas con x-admin-key (provisión, admin UI)
  verifactu/provision.ts                    ensureVerifactuApiKey — tenant `sf_<clerkUserId>` + API key cifrada
  verifactu/crypto.ts                       Cifrado de secretos en DB (VERIFACTU_ENCRYPTION_KEY)
  simplefactu/build-*-payload.ts            Construcción cuerpos send-invoice / cancel
  simplefactu/job-sync.ts                   Sincronización estado job con filas `Invoice`
  auth/admin.ts, admin-audit.ts             Helpers admin + auditoría
  pdf/, money.ts                            PDF factura, importes
prisma/                                     schema, migraciones, seed
middleware.ts                               protect + allowlist opcional /admin
```

---

## Variables de entorno

Referencia canónica: **`.env.example`**. Resumen:

| Variable | Uso |
|----------|-----|
| `DATABASE_URL` | Postgres (Neon u otro) |
| `NEXT_PUBLIC_CLERK_*`, `CLERK_SECRET_KEY` | Clerk |
| `CLERK_WEBHOOK_SIGNING_SECRET` | Opcional — `app/api/webhooks/clerk` |
| `SIMPLEFACTU_API_BASE_URL` | Base del API **con `/v1`** (ej. `http://localhost:3000/v1`) |
| `SIMPLEFACTU_ADMIN_KEY` | `x-admin-key` solo servidor — provisión y rutas admin contra simplefactu |
| `VERIFACTU_ENCRYPTION_KEY` | AES — cifra la API key por usuario en `UserVerifactuAccount` |
| `ADMIN_CLERK_USER_IDS` | Opcional — lista de `userId` Clerk que pueden entrar en `/admin` (si vacío, no aplica esta capa; ver `middleware.ts`) |
| `VERIFACTU_SI_*`, `VERIFACTU_VERIFY_QR_BASE` | Overrides bloque sistema informático / URL QR en PDF |

Nunca uses `NEXT_PUBLIC_*` para claves del API o `ADMIN_KEY`.

---

## Integración con simplefactu (BFF)

1. **`ensureVerifactuApiKey(userId)`** (`lib/verifactu/provision.ts`): si no hay fila o la clave devuelve 401 en el API, crea tenant `sf_<userId>` y API key vía `adminFetch` (`POST /admin/tenants`, `POST /admin/api-keys` con `BFF_KEY_SCOPES`), guarda la clave cifrada.
2. **`createSimplefactuClient`** (`lib/simplefactu/client.ts`): peticiones de usuario con `x-api-key` desde la clave desencriptada — send-invoice, jobs, verify-nif, certificado, etc.
3. **`adminFetch`** (`lib/simplefactu/admin-server.ts`): usa `SIMPLEFACTU_ADMIN_KEY` para el panel `/admin/*` del front (listados, métricas, reintentos, cadenas, …).
4. **Jobs async:** `POST /send-invoice` → 202 + `jobId`; polling `GET /jobs/:id` hasta estado terminal (ver `job-sync` y paneles de factura/admin).

Contrato e idempotencia: misma `x-idempotency-key` + mismo cuerpo → mismo resultado; encadenamiento y huellas según documentación del API.

---

## Seguridad

- **Clerk:** rutas bajo `/invoices`, `/settings`, `/admin` exigen sesión (`middleware.ts`).
- **`/admin`:** `app/admin/layout.tsx` llama a `requireAdmin()` (`lib/auth/admin.ts`). Acceso si el `userId` está en `ADMIN_CLERK_USER_IDS` **o** si `publicMetadata.role === "admin"` en Clerk. Además, si `ADMIN_CLERK_USER_IDS` no está vacío, `middleware.ts` redirige a `/invoices` a quien no esté en la lista antes de llegar al layout (doble capa opcional).
- **Secretos:** solo en Server Actions, Route Handlers y código servidor; el cliente nunca ve `SIMPLEFACTU_ADMIN_KEY` ni la API key en claro.

---

## Rutas y producto

- **`/invoices`:** gestión de facturas; envío Veri\*Factu y seguimiento de job en detalle.
- **`/invoices/new`:** alta; verificación NIF destinatario contra el API cuando procede.
- **`/settings/verifactu`:** certificado y metadatos emisor enlazados a `/me/certificate` del API.
- **`/admin`:** operación — tenants, jobs, sistema (métricas / rate limit), auditoría, soporte/reintentos, etc. (consume endpoints admin del API documentados en el `AGENTS.md` del backend).

---

## Desarrollo local

1. **simplefactu:** `npm run dev` (puerto por defecto **3000**), migraciones y `.env` con `ADMIN_KEY`, DB, certificado de prueba.
2. **simplefactuapp:** copiar `.env.example` → `.env.local`; rellenar Clerk, `DATABASE_URL`, `SIMPLEFACTU_API_BASE_URL`, `SIMPLEFACTU_ADMIN_KEY`, `VERIFACTU_ENCRYPTION_KEY`.
3. **Puertos:** el API y Next compiten por 3000. Usar p. ej. `pnpm dev:3001` para Next y dejar el API en 3000, **o** cambiar el puerto del API y ajustar `SIMPLEFACTU_API_BASE_URL`.
4. **CORS:** en simplefactu, `CORS_ORIGINS` debe incluir el origen del front (p. ej. `http://localhost:3001`).

---

## Base de datos y Prisma

- **Proveedor:** PostgreSQL (`schema.prisma`).
- **`UserVerifactuAccount`:** mapeo `userId` Clerk → `simplefactuTenantId` + `apiKeyEncrypted`.
- **`Invoice`:** campos `aeat*` para job id, estado, CSV, QR, errores, anulación.
- Comandos típicos: `pnpm prisma migrate dev` (desarrollo), `pnpm prisma:migrate:deploy` (CI/producción), `pnpm prisma db seed` si usas seed.

---

## Tests y scripts

- `pnpm test` — `test:money` + `test:payloads` (scripts bajo `scripts/`).
- `pnpm typecheck` / `pnpm lint` — calidad antes de PR.

---

## Despliegue

- Variables de producción: ver comentarios finales en `.env.example` (URL API con TLS, Clerk producción, `prisma migrate deploy`).
- Imagen Docker: comentario en `.env.example` apunta a `Dockerfile` standalone del front.
- El **API** debe exponer HTTPS, `CORS_ORIGINS` con el dominio de esta app, y `TRUST_PROXY` tras proxy inverso (ver `AGENTS.md` del repo simplefactu, sección producción).
