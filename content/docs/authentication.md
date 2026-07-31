---
title: Autenticación
description: Cómo obtener tu API key, qué scopes necesitas y cómo subir tu certificado digital AEAT.
---

## Cómo obtienes una API key

No hay endpoint público de self-serve para crear tu propia clave (`/me/api-keys` **no** está implementado).

| Quién eres | Cómo se provisiona |
|------------|-------------------|
| **ERP / integrador** | Escribe a [soporte@simplefactu.com](mailto:soporte@simplefactu.com) (empresa, NIF emisor, QA o prod). Un operador crea la cuenta (`POST /admin/tenants`) y la API key (`POST /admin/api-keys`) y te envía `vf_...` por canal seguro. |
| **App web Simple\*Factu** | La app provisiona automáticamente una cuenta `sf_<userId>` y guarda la clave cifrada en servidor (tú no la ves). |
| **Gestoría** | Panel [`/partner`](/docs/gestoria) o API partner — claves de autónomos hijos. |

La clave se muestra **una sola vez** al crearla. Guárdala en un gestor de secretos. Si la pierdes, pide una nueva a soporte (o, si eres operador de plataforma con `ADMIN_KEY`, crea otra y revoca la anterior). Los integradores ERP **no** necesitan ni deben recibir `ADMIN_KEY`.

## API key en cada petición

```http
x-api-key: vf_xxxxxxxxxxxxxxxxxxxxxxxx
```

También aceptamos `Authorization: Bearer vf_...` — ambos son equivalentes.

**Nunca** incrustes la API key en el navegador. En apps web usa un BFF que conserve la clave en servidor.

## Permisos (scopes)

Los scopes son los permisos de la clave. Cuando te emitamos la API key te asignamos los necesarios para tu caso de uso.

| Permiso (scope) | ¿Para qué sirve? |
|-------|-----------------|
| `invoices:write` | Enviar y anular facturas |
| `invoices:read` | Consultar jobs, plan, uso, ledger y `GET /invoices/lookup` |
| `nif:read` | `POST /verify-nif` |
| `tenant:certificates:read` | Consultar si tienes certificado subido |
| `tenant:certificates:write` | Subir o borrar tu certificado |
| `partner:tenants:read` | Listar y consultar cuenta hijas (gestoría) |
| `partner:tenants:write` | Crear autónomos, certificados y API keys de hijos |

Si haces una llamada sin el permiso (scope) correcto recibes `403 Prohibido`. Para un ERP típico: `invoices:write`, `invoices:read`, `nif:read`, `tenant:certificates:read`, `tenant:certificates:write`. Para gestorías, ver [Gestoría](/docs/gestoria).

## Certificado digital AEAT

### ¿Por qué hace falta?

AEAT exige que cada envío SOAP esté firmado con tu **certificado digital** — el mismo que usas para entrar a la sede electrónica o presentar impuestos. Sin él, AEAT rechaza la conexión antes de leer siquiera los datos de la factura.

Técnicamente, el certificado se usa para establecer una conexión **mTLS** (TLS mutuo): AEAT verifica que eres tú, no solo que el canal está cifrado.

Tu certificado se guarda cifrado en nuestra base de datos con AES-256-GCM. Nosotros **nunca** lo devolvemos por ningún endpoint — solo lo usamos internamente para firmar los envíos.

En entornos QA y producción, **cada tenant debe tener su propio certificado** (`REQUIRE_TENANT_CERTIFICATE=true`). No se usa un certificado global de la plataforma. Si intentas verificar un NIF o enviar una factura sin haber subido el PFX, recibirás `422` con código `tenant_certificate_required`.

### Subir el certificado

El endpoint `POST /v1/me/certificate` acepta el archivo en dos formatos según lo que te resulte más cómodo:

**Opción A — JSON** (útil en integraciones servidor a servidor):

```bash
PFX_B64=$(base64 -i mi-cert.p12 | tr -d '\n')

curl -X POST "$API_BASE/me/certificate" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d "{\"pfxBase64\":\"$PFX_B64\",\"pfxPassphrase\":\"MI_CONTRASEÑA\"}"
```

**Opción B — Multipart** (más cómodo con curl o Postman):

```bash
curl -X POST "$API_BASE/me/certificate" \
  -H "x-api-key: $API_KEY" \
  -F "pfx=@/ruta/a/mi-cert.p12" \
  -F "pfxPassphrase=MI_CONTRASEÑA"
```

La respuesta correcta es `200 { "success": true }`. La operación es un **alta o sustitución** — si ya tenías un certificado, lo reemplaza.

### Certificados FNMT antiguos (formato RC2-40)

Los certificados emitidos por la FNMT antes de ~2023 usan un formato de cifrado antiguo (RC2-40) incompatible con OpenSSL 3 (Node.js 18+).

**Síntoma:** `Error: Unsupported PKCS12 PFX data`.

El servidor intenta convertirlos automáticamente. Si lo consigue, la respuesta incluye `certificate.normalizedFromLegacy: true` y no tienes que hacer nada más. Si aun así falla, conviértelo en local:

```bash
# Extrae con el modo legacy de OpenSSL
openssl pkcs12 -legacy -in cert-viejo.p12 -nodes -out cert.pem

# Re-exporta en formato moderno (AES-256)
openssl pkcs12 -export -in cert.pem -out cert-modern.p12

# Elimina el .pem — contiene la clave privada sin cifrar
rm cert.pem
```

Luego sube `cert-modern.p12` con cualquiera de las opciones anteriores.

## Idempotencia

`POST /send-invoice` y `POST /cancel-invoice` requieren la cabecera `x-idempotency-key`.

### ¿Qué valor hay que pasar?

**Tú generas la clave** antes de llamar a la API. Recomendamos un **UUID** (cualquier string único de hasta **128 caracteres** vale):

```bash
# macOS / Linux
uuidgen
# → 550E8400-E29B-41D4-A716-446655440000

# Node.js
node -e "console.log(crypto.randomUUID())"
```

```http
x-idempotency-key: 550e8400-e29b-41d4-a716-446655440000
```

Nosotros **no** podemos inventarla en el servidor: si la red falla y reintentas, solo tú sabes que la segunda llamada es el mismo envío. Si el servidor creara un UUID nuevo en cada HTTP, el reintento crearía un job duplicado.

### ¿Para qué sirve?

Imagina que envías una factura, la red falla antes de recibir la respuesta y no sabes si llegó. Con la misma `x-idempotency-key` y el **mismo cuerpo**, puedes reenviar con seguridad: si el job ya existe, devolvemos el mismo resultado sin crear un duplicado ni reenviar nada a AEAT.

```
Primera llamada   →  job creado, 202 PENDING  (jobId: abc)
Red falla
Segunda llamada   →  mismo jobId abc, mismo estado  (sin duplicado)
```

### Reglas

| Situación | Qué hacer |
|-----------|-----------|
| Factura **nueva** | UUID **nuevo** |
| Reintento por timeout / red (mismo JSON) | **Misma** clave |
| Factura distinta | UUID nuevo — nunca reutilices la clave de otra factura |

Si envías la misma clave con un cuerpo distinto recibes `409 Idempotency conflict` — ver [Errores](/docs/error-codes#errores-409--los-más-comunes-en-integración).

Estados que puedes ver al reutilizar la clave: `PENDING` / `PROCESSING` → `202` con el job actual; `SUCCEEDED` → se reenvía el resultado guardado; `DEAD` → error (no se reintenta solo).

## Rate limits

Cada cuenta tiene límites por endpoint. Si los superas, recibes `429 Demasiadas solicitudes` con la cabecera `Retry-After` indicando cuántos segundos esperar antes del próximo intento. Los umbrales concretos por ruta están en la [Referencia API](/docs/api-reference) (OpenAPI).

## ¿Qué sigue?

- [Entornos](/docs/entornos) — QA vs producción
- [Verificar NIF](/docs/verificar-nif) — validar destinatario antes de enviar
- [Inicio rápido](/docs/quickstart) — primera factura con curl
- [Errores](/docs/error-codes) — 422, 409, trabajos DEAD
- [Webhooks](/docs/webhooks) — alternativa a la consulta periódica
