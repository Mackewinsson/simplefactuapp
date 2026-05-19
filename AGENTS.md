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

Referencia canónica de plantillas:

| Fichero | Uso |
|---------|-----|
| [`.env.example`](.env.example) | Local → copiar a `.env.local` |
| [`.env.qa.example`](.env.qa.example) | Vercel **Preview** / Bitwarden |
| [`.env.prod.example`](.env.prod.example) | Vercel **Production** / Bitwarden |

En runtime las vars viven en **Vercel**, no en GitHub. Backup: Secure Notes en Bitwarden (una por entorno).

### Dónde vive cada cosa

| Almacén | Contenido |
|---------|-----------|
| **`.env.local`** (gitignored) | Desarrollo local |
| **Vercel Preview** | QA — rama `develop`, dominio `qa.simplefactu.com` |
| **Vercel Production** | Prod — rama `main`, `simplefactu.com` |
| **API VPS** (`/opt/simplefactu/deploy/.env`) | Secretos del backend — **no** duplicar en Vercel salvo `SIMPLEFACTU_ADMIN_KEY` |

El API **no** lee variables de Vercel. El front llama al API por HTTP con secretos solo en el servidor Next (Server Actions, Route Handlers).

### Por entorno (valores típicos)

| Variable | Local | Vercel Preview (QA) | Vercel Production |
|----------|-------|---------------------|-------------------|
| `SIMPLEFACTU_API_BASE_URL` | `http://localhost:3000/v1` | `https://api.qa.simplefactu.com/v1` | `https://api.simplefactu.com/v1` |
| `SIMPLEFACTU_ADMIN_KEY` | = `ADMIN_KEY` del API local | = `ADMIN_KEY` del VPS QA | = `ADMIN_KEY` del VPS prod |
| `VERIFACTU_ENCRYPTION_KEY` | clave dev propia | clave QA (distinta de prod) | clave prod nueva |
| Clerk | `pk_test_` / `sk_test_` | test | `pk_live_` / `sk_live_` |
| `DATABASE_URL` | Neon dev / local | Neon QA | Neon prod |

QR de verificación AEAT: lo devuelve el API en `qrInfo.qrText` → Prisma `invoice.aeatQrText` (PDF y panel). Base URL en el VPS: `AEAT_QR_BASE_URL` / `AEAT_URL` ([API AGENTS.md](../simplefactu/AGENTS.md)).

Si `SIMPLEFACTU_ADMIN_KEY` ≠ `ADMIN_KEY` del VPS → `401 Invalid x-admin-key` en `POST /admin/tenants` y provisión.

### Catálogo (uso en código)

| Variable | Expuesta al navegador | Dónde se usa |
|----------|----------------------|--------------|
| **Clerk** | | |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Sí | `@clerk/nextjs` |
| `CLERK_SECRET_KEY` | No | Servidor Clerk |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` / `_SIGN_UP_URL` | Sí | Rutas auth |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` / `_AFTER_SIGN_UP_URL` | Sí | Redirects post-login |
| `CLERK_WEBHOOK_SIGNING_SECRET` | No | `app/api/webhooks/clerk` (opcional) |
| **simplefactu API** | | |
| `SIMPLEFACTU_API_BASE_URL` | No* | `lib/simplefactu/client.ts` — peticiones con `x-api-key` |
| `NEXT_PUBLIC_SIMPLEFACTU_API_BASE_URL` | Sí | Fallback en `getSimplefactuBaseUrlForDocs()` — OpenAPI en `/docs/api-reference` |
| `SIMPLEFACTU_ADMIN_KEY` | **Nunca** | `lib/simplefactu/admin-server.ts` → `x-admin-key` |
| `SIMPLEFACTU_ADMIN_FETCH_TIMEOUT_MS` | No | Timeout de `adminFetch` (default 30000) |
| **Cifrado y Veri\*Factu** | | |
| `VERIFACTU_ENCRYPTION_KEY` | No | `lib/verifactu/crypto.ts` — API keys de usuario en Prisma |
| `VERIFACTU_SI_NOMBRE_RAZON`, `VERIFACTU_SI_NIF` | No | `build-send-invoice-payload.ts` — override emisor SIF |
| `VERIFACTU_SI_NOMBRE`, `VERIFACTU_SI_ID`, `VERIFACTU_SI_VERSION` | No | Bloque `sistemaInformatico` en envío |
| `VERIFACTU_SI_SOLO_VERI`, `VERIFACTU_SI_MULTI_OT`, `VERIFACTU_SI_IND_MULTI_OT` | No | Flags SIF (`S`/`N`) |
| **Admin panel (Clerk)** | | |
| `ADMIN_CLERK_USER_IDS` | No | `middleware.ts` + `lib/auth/admin.ts` — allowlist opcional `/admin` |
| **App / UI** | | |
| `DATABASE_URL` | No | Prisma (`lib/prisma.ts`) |
| `NODE_ENV` | Implícito en Vercel | Prisma logging, build |
| `NEXT_PUBLIC_BILLING_ENABLED` | Sí | `lib/billing/feature.ts` — UI billing (alinear con API `BILLING_ENABLED`) |
| `NEXT_PUBLIC_APP_URL` | Sí | `settings/billing/actions.ts` — URLs Stripe checkout |
| `NEXT_PUBLIC_TITULAR_RAZON_SOCIAL`, `NEXT_PUBLIC_TITULAR_NIF` | Sí | `app/Footer.tsx` — aviso legal |
| `INVOICE_COMPANY_NAME` | No | `invoices/[id]/pdf/route.ts` — fallback nombre en PDF |

\*El cliente HTTP con API key nunca se ejecuta en el browser; solo en servidor.

### Reglas de seguridad

- No uses `NEXT_PUBLIC_*` para `SIMPLEFACTU_ADMIN_KEY`, API keys de tenant ni `ADMIN_KEY` del API.
- `VERIFACTU_ENCRYPTION_KEY` del front **no** es `ENCRYPTION_KEY` del API (cifran datos distintos en BDs distintas).
- Tras cambiar una var en Vercel: **Redeploy** del deployment afectado (Preview o Production).

Catálogo del API (VPS): [`../simplefactu/AGENTS.md` §4](../simplefactu/AGENTS.md#4-configuración-del-entorno).

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
- **`/settings/verifactu`:** certificado y metadatos emisor enlazados a `/me/certificate` del API (la app sube en servidor con JSON). Quien llame al **API directamente** puede usar también `multipart/form-data` en ese endpoint; ver [Autenticación](/docs/authentication) y la [referencia API](/docs/api-reference) (OpenAPI).
- **`/admin`:** operación — tenants, jobs, sistema (métricas / rate limit), auditoría, soporte/reintentos, etc. (consume endpoints admin del API documentados en el `AGENTS.md` del backend).

---

## Desarrollo local

1. **simplefactu:** `npm run dev` (puerto por defecto **3000**), migraciones y `.env` con `ADMIN_KEY`, DB, certificado de prueba.
2. **simplefactuapp:** `cp .env.example .env.local` (plantillas QA/prod: `.env.qa.example`, `.env.prod.example` para Vercel/Bitwarden). Rellenar Clerk, `DATABASE_URL`, `SIMPLEFACTU_API_BASE_URL`, `SIMPLEFACTU_ADMIN_KEY` (= `ADMIN_KEY` del API local).
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

| Paso | Acción |
|------|--------|
| 1 | Vercel: dominio Preview `qa.simplefactu.com` → rama `develop`; Production → `main` |
| 2 | Variables por entorno en Vercel (tabla [arriba](#por-entorno-valores-típicos)); backup en Bitwarden |
| 3 | `pnpm prisma migrate deploy` contra el `DATABASE_URL` de cada entorno Neon |
| 4 | API en VPS: `CORS_ORIGINS` incluye orígenes del front; `ADMIN_KEY` = `SIMPLEFACTU_ADMIN_KEY` del mismo entorno |
| 5 | Tras cambiar env en Vercel: redeploy; tras cambiar API en VPS: `docker compose up -d` o pipeline CI |

- Imagen Docker del front: ver `.env.example` → `Dockerfile` standalone.
- CI/CD del API: [`../simplefactu/AGENTS.md` §21](../simplefactu/AGENTS.md#21-producción-y-despliegue-api).
