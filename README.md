# SimpleFactu

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

## Deploy checklist

1. **Environment variables** (in your host’s env/config):
   - `DATABASE_URL` — production Postgres URL. For Neon: run `npx neonctl@latest init` (or use [Neon Console](https://console.neon.tech)) and set this to the Neon connection string. If missing, the app fails on first DB access.
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — from [Clerk API keys](https://dashboard.clerk.com/last-active?path=api-keys).
   - `CLERK_SECRET_KEY` — from same page (server-only; never expose).
   - `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
   - `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`
   - `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/invoices`
   - `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/invoices`

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
