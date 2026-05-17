# simplefactuapp

Nombre del producto en la interfaz: edita `APP_DISPLAY_NAME` en [`lib/branding.ts`](lib/branding.ts).

Minimal invoice list + create + PDF download. Next.js App Router, TypeScript, Prisma, Postgres (Neon), Clerk auth.

## Quickstart

```bash
pnpm i
cp .env.example .env.local
# Add Clerk keys from https://dashboard.clerk.com to .env.local
# Set DATABASE_URL to your Neon Postgres URL (e.g. from npx neonctl@latest init)
pnpm prisma migrate deploy
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Optional: `pnpm prisma db seed`.

## Scope

- **In:** List invoices, create invoice, view detail, download PDF. Clerk auth (e.g. Google OAuth); invoices scoped per user. No sending, no edit/delete.

## Environment variables

Secrets live in **Vercel** (Preview vs Production), not in this git repo. The API backend uses a separate `.env` on each VPS — see [simplefactu AGENTS.md §4](../simplefactu/AGENTS.md#4-configuración-del-entorno).

| Store | Template | Runtime |
| ----- | -------- | ------- |
| Local | [`.env.example`](.env.example) → `.env.local` | `pnpm dev` |
| QA | [`.env.qa.example`](.env.qa.example) | Vercel Preview (`develop`, `qa.simplefactu.com`) |
| Prod | [`.env.prod.example`](.env.prod.example) | Vercel Production (`main`, `simplefactu.com`) |
| Bitwarden (recommended) | Copia de cada plantilla rellena | Backup offline |

**Critical pairing (per environment):** `SIMPLEFACTU_ADMIN_KEY` (Vercel) must equal `ADMIN_KEY` on the matching API VPS. `SIMPLEFACTU_API_BASE_URL` must point to that VPS (`https://api.qa.simplefactu.com/v1` or `https://api.simplefactu.com/v1`).

Full catalog with file references: **[AGENTS.md — Variables de entorno](AGENTS.md#variables-de-entorno)**.

## Deploy checklist

1. **Environment variables** in Vercel (see checklist above and AGENTS.md). Minimum:
   - `DATABASE_URL` — Neon Postgres for this app’s Prisma schema
   - Clerk keys (`NEXT_PUBLIC_*` + `CLERK_SECRET_KEY`) — test keys on Preview, live on Production
   - `SIMPLEFACTU_API_BASE_URL`, `SIMPLEFACTU_ADMIN_KEY`, `VERIFACTU_ENCRYPTION_KEY`

2. **Clerk production**: In Clerk Dashboard, set the production app URL and allow the production domain. Ensure redirect URLs match your host (e.g. `https://yourdomain.com/sign-in`, `https://yourdomain.com/invoices`).

3. **Database**: Run migrations once before first deploy (or in a release step):
   - Local dev: `pnpm prisma migrate dev`
   - Production: `pnpm prisma migrate deploy`

4. **Build**: `pnpm build` (requires Clerk keys in env). Then `pnpm start` or your host’s start command.

## Production database (Neon)

The app uses **Postgres** (Neon) for both dev and production. One-time setup:

1. **Create the database**:
   ```bash
   npx neonctl@latest init
   ```
   Follow the prompts; Neon will output a connection string (or copy from [Neon Console](https://console.neon.tech)).

2. **Set `DATABASE_URL`** in `.env.local` (local) and in your host’s env (Vercel, etc.):
   ```text
   postgresql://USER:PASSWORD@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```

3. **Apply migrations** (local or CI):
   ```bash
   pnpm prisma migrate deploy
   ```
