# Billing QA — Lemon Squeezy (Preview)

Activa facturación en **QA primero** (`qa.simplefactu.com` + `api.qa.simplefactu.com`). Producción usa los mismos pasos con claves **live** y otro webhook.

Referencia de variables: [`.env.qa.example`](../.env.qa.example) · API: [`../simplefactu/deploy/.env.qa.example`](../../simplefactu/deploy/.env.qa.example)

## Checklist

### 1. Lemon Squeezy (test mode)

1. [Lemon Squeezy Dashboard](https://app.lemonsqueezy.com) → activar **Test mode** (toggle arriba).
2. **Store** → copiar **Store ID**.
3. **Products** → crear **Pro** (suscripción mensual, EUR). Copiar **Variant ID** del plan mensual.
4. **Settings → API** → crear API key (test) → `LEMONSQUEEZY_API_KEY`.
5. **Settings → Webhooks** → **Add webhook**:
   - **URL:** `https://qa.simplefactu.com/api/webhooks/lemonsqueezy`
   - **Events:** `subscription_created`, `subscription_updated`, `subscription_cancelled`, `subscription_expired`, `subscription_paused`, `subscription_unpaused`, `subscription_resumed`, `subscription_payment_success`, `subscription_payment_failed`, `subscription_payment_recovered`
   - Copiar **Signing secret** → `LEMONSQUEEZY_WEBHOOK_SECRET`

### 2. Neon (QA / Preview)

Con `DATABASE_URL` de la rama Preview:

```bash
cd simplefactuapp
pnpm prisma migrate deploy
```

Crea la tabla `subscriptions` si aún no existe.

### 3. Vercel Preview

Project → **Settings → Environment Variables** → scope **Preview** only:

| Variable | Valor QA |
|----------|----------|
| `NEXT_PUBLIC_BILLING_ENABLED` | `true` |
| `NEXT_PUBLIC_APP_URL` | `https://qa.simplefactu.com` |
| `LEMONSQUEEZY_API_KEY` | API key **test** |
| `LEMONSQUEEZY_STORE_ID` | Store ID |
| `LEMONSQUEEZY_VARIANT_ID_PRO` | Variant ID Pro |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | Secret del webhook QA |
| `LEMONSQUEEZY_TEST_MODE` | `true` |

Comprueba también (ya deberían estar):

- `SIMPLEFACTU_API_BASE_URL` = `https://api.qa.simplefactu.com/v1`
- `SIMPLEFACTU_ADMIN_KEY` = `ADMIN_KEY` del VPS QA

**Redeploy** la rama `develop` (o el último Preview de `qa.simplefactu.com`).

### 4. API VPS QA

En `/opt/simplefactu/deploy/.env`:

```env
BILLING_ENABLED=true
```

```bash
cd /opt/simplefactu/deploy
docker compose --env-file .env pull
docker compose --env-file .env up -d
```

### 5. Verificación

1. Abre `https://qa.simplefactu.com/settings/billing` (con sesión Clerk).
2. **Mejorar a Pro** → checkout Lemon Squeezy (test).
3. Tarjeta de prueba LS (ver docs LS) → pago OK → redirect a `/settings/billing/success`.
4. En unos segundos:
   - Webhook 200 en LS Dashboard → **Recent deliveries**
   - Fila en Neon `subscriptions` (Preview DB)
   - API: tenant con `plan_id=pro` (`GET /me/plan` desde la app)
5. Opcional: simular `subscription_payment_failed` en LS → tenant `SUSPENDED` → envío factura `403`.

### 6. Backup Bitwarden

Actualizar Secure Note **simplefactu · App QA · Vercel Preview** con las vars `LEMONSQUEEZY_*` y flags de billing.

## Local contra QA

Para probar checkout en local apuntando al mismo entorno:

1. Copia vars de billing desde `.env.qa.example` a `.env.local` (o `.env.bitwarden-preview`).
2. `NEXT_PUBLIC_APP_URL=http://localhost:3001` — **el webhook no llegará a local**; usa QA desplegado para probar el flujo completo, o un túnel (ngrok) hacia `:3001/api/webhooks/lemonsqueezy` con otro webhook en LS.

## Rollback QA

- Vercel Preview: `NEXT_PUBLIC_BILLING_ENABLED=false` + redeploy
- VPS QA: `BILLING_ENABLED=false` + `docker compose up -d`

Las suscripciones test en Lemon Squeezy pueden quedar activas; solo se oculta la UI y se desactiva el enforcement de límites.
