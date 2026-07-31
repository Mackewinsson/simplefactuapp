---
title: Errores y soluciones
description: Los errores más frecuentes de la API y de AEAT, y exactamente qué hacer con cada uno.
---

## Errores HTTP de nuestra API

Estos errores los devolvemos nosotros antes de llegar a AEAT:

| Código | Cuándo | Qué hacer |
|--------|--------|-----------|
| `400 Solicitud incorrecta` | Validación fallida (campo faltante, formato incorrecto) | Lee el campo `details` en la respuesta — indica qué campo falla y por qué |
| `401 No autorizado` | API key ausente o inválida | Comprueba el header `x-api-key` y que la clave no esté revocada |
| `402 Pago requerido` | Límite de plan alcanzado | Consulta `GET /me/plan` — ver [Plan y uso](/docs/plan-y-uso); escribe a [soporte@simplefactu.com](mailto:soporte@simplefactu.com) para ampliar |
| `403 Prohibido` | Permiso (scope) insuficiente o cuenta suspendida | Comprueba que tu API key tiene el permiso (scope) necesario para ese endpoint |
| `409 Conflicto` | Conflicto de encadenamiento o idempotencia | Lee la sección de errores 409 más abajo |
| `422 Entidad no procesable` | Certificado obligatorio, NIF no autorizado o cert ≠ `allowed_nif` | Ver sección **422** más abajo |
| `429 Demasiadas solicitudes` | Límite de tasa superado | Espera `Retry-After` segundos e inténtalo de nuevo |
| `502 Puerta de enlace incorrecta` | AEAT devolvió un error o no respondió | El job se reintentará automáticamente con espera creciente; espera o consulta el estado |
| `504 Tiempo de espera agotado` | Timeout antes de recibir respuesta | La petición puede que haya llegado; usa la misma `x-idempotency-key` para reintentar sin duplicar |

## Errores 422

| `details.code` / `code` | Cuándo | Qué hacer |
|-------------------------|--------|-----------|
| `tenant_certificate_required` | QA/prod sin PFX en la cuenta | Sube el certificado con `POST /me/certificate` — [Autenticación](/docs/authentication#certificado-digital-aeat) |
| `allowed_nif_mismatch` | El `nif` del body no coincide con el NIF autorizado del cuenta hija | Usa el NIF fijado al crear el autónomo (gestoría) |
| `cert_nif_mismatch` | El PFX subido no corresponde al `allowed_nif` | Sube el certificado del mismo titular |
| `wrong_passphrase` | Contraseña del PFX incorrecta | Revisa la passphrase del `.p12`/`.pfx` |
| `malformed` | El archivo no es un PKCS#12 válido | Comprueba que es `.p12`/`.pfx`, no PEM suelto |
| `legacy_rc2` | Certificado FNMT antiguo (RC2-40) que no se pudo normalizar | Convierte con OpenSSL legacy — [Autenticación](/docs/authentication#certificados-fnmt-antiguos-formato-rc2-40) |
| `expired` | Certificado caducado | Renueva en la FNMT y vuelve a subir |

## Errores 409 — los más comunes en integración

### `ChainContinuityError`

```json
{
  "error": "ChainContinuityError",
  "expectedHuella": "910204E9...",
  "receivedHuella": "AABBCC..."
}
```

**Causa:** la huella que pasaste en `encadenamiento.registroAnterior.huella` no coincide con la última huella que tenemos registrada para esa cadena.

**Solución:** la respuesta incluye `expectedHuella` — es exactamente la huella que debes usar. Cópiala en `encadenamiento.registroAnterior.huella`, **o omite** `encadenamiento` para que el servidor use la última huella de la cadena.

### `ChainStateError` — la cadena ya existe

**Causa:** enviaste `primerRegistro: true` pero la cadena ya tiene facturas registradas.

**Solución:** omite `primerRegistro` (el servidor infiere el estado) o envía `primerRegistro: false`. Si controlas la cadena a mano, usa la huella de la última factura aceptada. Si no la tienes, omite `encadenamiento` para auto-relleno, o escríbenos con el `requestId`.

### `Idempotency conflict`

**Causa:** reutilizaste una `x-idempotency-key` con un cuerpo diferente (factura distinta).

**Solución:** genera un UUID nuevo para cada factura nueva (`uuidgen` / `crypto.randomUUID()`). La misma clave solo debe reutilizarse si estás reintentando exactamente la misma petición (mismo body) tras un fallo de red. Ver [Autenticación → Idempotencia](/docs/authentication#idempotencia).

## Errores AEAT (dentro del job)

Cuando AEAT rechaza una factura, el job puede pasar a `FAILED` (reintento programado) o `DEAD` (agotados los intentos) y el resultado incluye el código de error original. Estos son los más frecuentes:

| Código | Nivel | Qué significa | Qué hacer |
|--------|-------|---------------|-----------|
| `1239` | Registro | NIF del destinatario no existe en AEAT | Pide al cliente que corrija su NIF; re-emite con nueva `x-idempotency-key` |
| `2000` | Registro | Huella incorrecta | El mensaje de error incluye la cadena canónica que AEAT calculó — úsala para depurar el formato de tus importes (ver abajo) |
| `4102` | Envío | XML no cumple el esquema XSD | Falta un campo obligatorio; el más común es `PrimerRegistro` cuando `primerRegistro: true` |
| `4104` | Envío | NIF del emisor no identificado | Tu NIF no está dado de alta o está mal escrito |
| `4109` | Envío | NIF del `sistemaInformatico` incorrecto | Con el camino normal (SIF Simple\*Factu) no deberías verlo: contacta soporte. Si tienes `clientSifEnabled`, el NIF del bloque que envías debe existir en AEAT |
| `4116` | Envío | NIF del obligado de emisión incorrecto | El campo `nif` del body no existe en AEAT |

### Desglose (`detalles`) — validación 400 antes de AEAT

Si el body solo lleva `base` (u omite `clave` / `calif`), la API responde **400** con `details[]` (no llega a Hacienda). Códigos AEAT de referencia en el mensaje:

| Código | Qué falla | Qué hacer |
|--------|-----------|-----------|
| `1195` | Falta `calif` y `causaExencion` | Envía **uno** de los dos |
| `1196` | Ambos `calif` y `causaExencion` | Solo uno (XOR) |
| `1198` | `calif=S2` con tipo/cuota ≠ 0 | Pon `tipo` y `cuota` a `0` |
| `1208` | `calif=S1` sin tipo/cuota | Añade `tipo` y `cuota` (salvo `baseImponibleACoste`) |
| `1237` / `1238` | N1/N2 o exenta con tipo/cuota/recargo | Omite esos campos |
| `1281` / `1284` | Recargo mal usado | Solo con `S1` y ambos campos de recargo juntos |
| — | Falta `clave` en IVA/IGIC | Añade `clave` (p. ej. `"01"`) si `impuesto` omitido/`01`/`03` |

Guía: [Envío de facturas → Desglose](/docs/envio-facturas#desglose-detalles).

### Depurar el error `2000` (huella incorrecta)

Este error casi siempre viene de un problema de **formato de importes**. AEAT incluye en el mensaje de error la cadena canónica que ELLOS calcularon. Compara con la tuya:

```
AEAT calculó:  ...CuotaTotal=21.0&ImporteTotal=121.0...
Tú enviaste:   ...CuotaTotal=21.00&ImporteTotal=121.00...
                                        ↑
                            Sobra el segundo cero
```

Regla: un decimal si el segundo es cero (`21.0`), dos si no (`21.15`). Ver [Conceptos clave → Formato de importes](/docs/concepts#formato-de-importes-en-la-huella).

## Si un job llega a `DEAD`

`DEAD` significa que el sistema agotó los 8 reintentos. La factura **no fue aceptada por AEAT**.

Para resolverlo:

1. Lee `lastError` en el resultado del job (`GET /jobs/:jobId`) para entender el motivo.
2. Corrige el problema en tu sistema (NIF incorrecto, formato de importe, etc.).
3. **No puedes reenviar la misma factura** con el mismo `numSerie` una vez que AEAT la ha rechazado definitivamente. Debes emitir una **factura rectificativa** (tipo `R1`–`R5`) que corrija la original.
4. Si el job llegó a `DEAD` por un error transitorio (timeout de AEAT, red), escribe a [soporte@simplefactu.com](mailto:soporte@simplefactu.com) con el `jobId` / `requestId` para un reintento manual (operadores: `POST /admin/jobs/:jobId/retry` solo si el estado es `FAILED`).

## `FAILED` frente a `DEAD`

| Estado | ¿Terminal? | Qué hacer |
|--------|------------|-----------|
| `FAILED` | No | El proceso en segundo plano reintentará con espera creciente. Sigue consultando el estado. |
| `DEAD` | Sí | Agotó reintentos. Corrige la causa y emite nueva factura / rectificativa; no reutilices el mismo trabajo. |
| `SUCCEEDED` | Sí | Lee `result.qrInfo` (CSV + QR). |

## Cada respuesta incluye un `requestId`

Guárdalo siempre que algo falle. Con ese UUID podemos ver la traza completa del envío, el XML que se envió a AEAT y la respuesta exacta. Escríbenos a [soporte@simplefactu.com](mailto:soporte@simplefactu.com) con el `requestId`.
