# simplefactuapp

Nombre del producto en la interfaz: edita `APP_DISPLAY_NAME` en [`lib/branding.ts`](lib/branding.ts).

Listado mínimo de facturas, alta, descarga de PDF. Next.js App Router, TypeScript, Prisma, Postgres (Neon), autenticación con Clerk.

## Inicio rápido

```bash
pnpm i
cp .env.example .env.local
# Añade las claves de Clerk desde https://dashboard.clerk.com a .env.local
# Configura DATABASE_URL con tu URL de Neon Postgres (p. ej. con npx neonctl@latest init)
pnpm prisma migrate deploy
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000). Opcional: `pnpm prisma db seed`.

## Alcance

- **Incluido:** listar facturas, crear factura, ver detalle, descargar PDF. Auth con Clerk (p. ej. Google OAuth); facturas aisladas por usuario. Sin envío a AEAT, sin editar ni borrar.

## Variables de entorno

Los secretos viven en **Vercel** (Preview vs Production), no en este repositorio git. El backend API usa un `.env` aparte en cada VPS — ver [simplefactu AGENTS.md §4](../simplefactu/AGENTS.md#4-configuración-del-entorno).

| Almacén | Plantilla | Runtime |
| ----- | -------- | ------- |
| Local | [`.env.example`](.env.example) → `.env.local` | `pnpm dev` |
| QA | [`.env.qa.example`](.env.qa.example) | Vercel Preview (`develop`, `qa.simplefactu.com`) |
| Prod | [`.env.prod.example`](.env.prod.example) | Vercel Production (`main`, `simplefactu.com`) |
| Bitwarden (recomendado) | Copia de cada plantilla rellena | Copia de seguridad offline |

**Emparejamiento crítico (por entorno):** `SIMPLEFACTU_ADMIN_KEY` (Vercel) debe ser igual a `ADMIN_KEY` en el VPS del API correspondiente. `SIMPLEFACTU_API_BASE_URL` debe apuntar a ese VPS (`https://api.qa.simplefactu.com/v1` o `https://api.simplefactu.com/v1`).

Catálogo completo con referencias de ficheros: **[AGENTS.md — Variables de entorno](AGENTS.md#variables-de-entorno)**.

## Checklist de despliegue

1. **Variables de entorno** en Vercel (ver tabla anterior y AGENTS.md). Mínimo:
   - `DATABASE_URL` — Neon Postgres para el esquema Prisma de esta app
   - Claves Clerk (`NEXT_PUBLIC_*` + `CLERK_SECRET_KEY`) — claves de test en Preview, live en Production
   - `SIMPLEFACTU_API_BASE_URL`, `SIMPLEFACTU_ADMIN_KEY`, `VERIFACTU_ENCRYPTION_KEY`

2. **Clerk en producción:** en el panel de Clerk, configura la URL de la app de producción y permite el dominio de producción. Las URLs de redirección deben coincidir con tu host (p. ej. `https://tudominio.com/sign-in`, `https://tudominio.com/invoices`).

3. **Base de datos:** ejecuta migraciones una vez antes del primer despliegue (o en un paso de release):
   - Desarrollo local: `pnpm prisma migrate dev`
   - Producción: `pnpm prisma migrate deploy`

4. **Build:** `pnpm build` (requiere claves Clerk en el entorno). Luego `pnpm start` o el comando de arranque de tu host.

## Base de datos de producción (Neon)

La app usa **Postgres** (Neon) tanto en desarrollo como en producción. Configuración inicial:

1. **Crear la base de datos:**
   ```bash
   npx neonctl@latest init
   ```
   Sigue las indicaciones; Neon mostrará una cadena de conexión (o cópiala desde [Neon Console](https://console.neon.tech)).

2. **Configura `DATABASE_URL`** en `.env.local` (local) y en el entorno de tu host (Vercel, etc.):
   ```text
   postgresql://USER:PASSWORD@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```

3. **Aplica migraciones** (local o CI):
   ```bash
   pnpm prisma migrate deploy
   ```
