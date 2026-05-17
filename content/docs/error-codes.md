---
title: Errores y soluciones
description: Los errores más frecuentes de la API y de AEAT, y exactamente qué hacer con cada uno.
---

## Errores HTTP de nuestra API

Estos errores los devolvemos nosotros antes de llegar a AEAT:

| Código | Cuándo | Qué hacer |
|--------|--------|-----------|
| `400 Bad Request` | Validación fallida (campo faltante, formato incorrecto) | Lee el campo `details` en la respuesta — indica qué campo falla y por qué |
| `401 Unauthorized` | API key ausente o inválida | Comprueba el header `x-api-key` y que la clave no esté revocada |
| `402 Payment Required` | Límite de plan alcanzado | Revisa tu plan en `/me/plan`; escríbenos para ampliar |
| `403 Forbidden` | Scope insuficiente o tenant suspendido | Comprueba que tu API key tiene el scope necesario para ese endpoint |
| `409 Conflict` | Conflicto de encadenamiento o idempotencia | Lee la sección de errores 409 más abajo |
| `429 Too Many Requests` | Rate limit superado | Espera `Retry-After` segundos e inténtalo de nuevo |
| `502 Bad Gateway` | AEAT devolvió un error o no respondió | El job se reintentará automáticamente con backoff; espera o consulta el estado |
| `504 Gateway Timeout` | Timeout antes de recibir respuesta | La petición puede que haya llegado; usa la misma `x-idempotency-key` para reintentar sin duplicar |

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

**Solución:** la respuesta incluye `expectedHuella` — es exactamente la huella que debes usar en el siguiente envío. Cópiala y úsala en `encadenamiento.registroAnterior.huella`.

### `ChainStateError — Chain already exists`

**Causa:** enviaste `primerRegistro: true` pero la cadena ya tiene facturas registradas.

**Solución:** cambia a `primerRegistro: false` y usa la huella de la última factura aceptada por AEAT en `encadenamiento.registroAnterior.huella`. Si no la tienes guardada, escríbenos con el `requestId` y te la facilitamos.

### `Idempotency conflict`

**Causa:** reutilizaste una `x-idempotency-key` con un cuerpo diferente (factura distinta).

**Solución:** genera un UUID nuevo para cada factura nueva. La misma clave solo debe reutilizarse si estás reintentando exactamente la misma petición.

## Errores AEAT (dentro del job)

Cuando AEAT rechaza una factura, el job pasa a `FAILED` o `DEAD` y el resultado incluye el código de error original. Estos son los más frecuentes:

| Código | Nivel | Qué significa | Qué hacer |
|--------|-------|---------------|-----------|
| `1239` | Registro | NIF del destinatario no existe en AEAT | Pide al cliente que corrija su NIF; re-emite con nueva `x-idempotency-key` |
| `2000` | Registro | Huella incorrecta | El mensaje de error incluye la cadena canónica que AEAT calculó — úsala para depurar el formato de tus importes (ver abajo) |
| `4102` | Envío | XML no cumple el esquema XSD | Falta un campo obligatorio; el más común es `PrimerRegistro` cuando `primerRegistro: true` |
| `4104` | Envío | NIF del emisor no identificado | Tu NIF no está dado de alta o está mal escrito |
| `4109` | Envío | NIF del `sistemaInformatico` incorrecto | El NIF en el bloque `sistemaInformatico` no existe en AEAT; usa el tuyo real |
| `4116` | Envío | NIF del obligado de emisión incorrecto | El campo `nif` del body no existe en AEAT |

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
4. Si el job llegó a `DEAD` por un error transitorio (timeout de AEAT, red), puedes pedir un reintento manual desde el panel admin o escribiéndonos.

## Cada respuesta incluye un `requestId`

Guárdalo siempre que algo falle. Con ese UUID podemos ver la traza completa del envío, el XML que se envió a AEAT y la respuesta exacta. Es la información más útil que puedes darnos para soporte.
