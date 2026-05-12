---
title: Autenticación
description: Cómo obtener tu API key, qué scopes necesitas y cómo subir tu certificado AEAT.
---

## API key

Cada llamada a la API necesita un header de autenticación:

```http
x-api-key: vf_xxxxxxxxxxxxxxxxxxxxxxxx
```

(También aceptamos `Authorization: Bearer vf_...` si te resulta más cómodo).

Las API keys se emiten desde el panel admin de {{APP_DISPLAY_NAME}}. Si eres
integrador externo, contáctanos y te emitimos una; te llegará por canal
seguro y solo se muestra **una vez**.

## Scopes

Cuando emitamos tu key te asignamos los scopes mínimos necesarios:

| Scope | Endpoints |
|-------|-----------|
| `invoices:write` | `POST /send-invoice`, `POST /cancel-invoice` |
| `invoices:read` | `GET /jobs/:id`, `GET /me/plan`, `GET /me/usage`, `POST /me/upgrade`, `GET /invoices/lookup` |
| `nif:read` | `POST /verify-nif` |
| `tenant:certificates:read` | `GET /me/certificate` |
| `tenant:certificates:write` | `POST /me/certificate`, `DELETE /me/certificate` |

Si haces una llamada sin el scope correcto recibes `403 Forbidden`.

## Certificado digital

Tus envíos a AEAT viajan con tu propio certificado PKCS#12. Lo subes una vez
y queda cifrado con AES-256-GCM en nuestra base de datos.

El endpoint `POST /me/certificate` admite **dos formas** (misma URL y mismos permisos):

### Opción A — JSON (integraciones server-to-server)

Cuerpo `application/json` con `pfxBase64` (sin saltos de línea) y `pfxPassphrase`:

```bash
PFX_B64=$(base64 -i mi-cert.p12 | tr -d '\n')
curl -X POST "$API_BASE/me/certificate" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d "{\"pfxBase64\":\"$PFX_B64\",\"pfxPassphrase\":\"PASS\"}"
```

### Opción B — Multipart (más cómodo con curl o Postman)

`multipart/form-data`: archivo en el campo **`pfx`** o **`pfxFile`**, y texto **`pfxPassphrase`**. La ruta al fichero va con `@` en curl:

```bash
curl -X POST "$API_BASE/me/certificate" \
  -H "x-api-key: $API_KEY" \
  -F "pfx=@/ruta/a/mi-cert.p12" \
  -F "pfxPassphrase=PASS"
```

### Formato antiguo FNMT (RC2-40)

El servidor intenta **convertir automáticamente** muchos `.p12` heredados a un PKCS#12 compatible. Si lo consigue, la respuesta incluye `certificate.normalizedFromLegacy: true`. Si aun así falla la validación, puedes convertir en local:

```bash
openssl pkcs12 -legacy -in cert-viejo.p12 -nodes -out cert.pem
openssl pkcs12 -export -in cert.pem -out cert-modern.p12
rm cert.pem      # contiene la clave privada en claro
```

La especificación detallada (esquemas, códigos 413/422) está en **[API Reference](/docs/api-reference)** (OpenAPI).

## Idempotencia

`POST /send-invoice` y `POST /cancel-invoice` requieren la cabecera
`x-idempotency-key` (UUID recomendado). Repetir la misma key con el mismo
cuerpo te devuelve la misma respuesta sin reenviar nada a AEAT — útil
para reintentos seguros tras un timeout de red.

## Rate limits

Cada cuenta tiene límites por endpoint. La respuesta `429 Too Many Requests`
incluye `Retry-After` con los segundos a esperar.
