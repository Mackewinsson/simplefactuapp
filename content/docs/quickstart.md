---
title: Inicio rápido
description: Envía tu primera factura a AEAT con curl en menos de 5 minutos.
---

Esta guía te lleva paso a paso desde cero hasta recibir un CSV de AEAT.
Si algunos términos (huella, encadenamiento, primer registro) te suenan a chino, lee antes los [Conceptos clave](/docs/concepts) — son 3 minutos y lo harán todo mucho más claro.

Para el diccionario completo de campos (obligatorios, opcionales y “auto si se omiten”), ve a [Envío de facturas](/docs/envio-facturas). Entornos QA/prod: [Entornos](/docs/entornos).

## Antes de empezar

Necesitas dos cosas:

1. **API key** (`vf_...`) — para integradores ERP la emite el equipo de Simple\*Factu (no hay self-serve `/me/api-keys`). Escríbenos a [soporte@simplefactu.com](mailto:soporte@simplefactu.com) indicando empresa, NIF emisor y si quieres **QA** o **producción**. Te enviamos la clave por canal seguro con los scopes necesarios. Detalle: [Autenticación](/docs/authentication).
2. **Certificado digital AEAT** (`.pfx` / `.p12`) subido a la cuenta. Desde la app: *Ajustes → Veri*Factu*. Desde API: [Autenticación → Certificado](/docs/authentication#certificado-digital-aeat).

## Paso 1 — Variables de entorno

Empieza en **QA** salvo que ya tengas clave de producción:

```bash
export API_BASE="https://api.qa.simplefactu.com/v1"   # prod: https://api.simplefactu.com/v1
export API_KEY="vf_..."                               # tu API key
# Sustituye por el NIF REAL del titular de tu certificado FNMT (AEAT no acepta NIFs inventados)
export NIF="Z0706098A"
export NOMBRE="NOMBRE TITULAR CERTIFICADO"
```

> El valor `B12345678` que aparece en ejemplos genéricos de otras guías es un **ejemplo ficticio**. En llamadas reales a AEAT (también en QA/preproducción) usa NIFs existentes en Hacienda.

## Paso 2 — Enviar la factura

El servidor puede generar por ti la **huella**, el timestamp y el encadenamiento si los omites. Para la primera factura de una serie basta con el cuerpo de negocio + `sistemaInformatico`.

> **`x-idempotency-key`:** genera un UUID **tú** (p. ej. `uuidgen` o `crypto.randomUUID()`). Factura nueva → UUID nuevo. Si la red falla y reintentas el **mismo** body → reutiliza el mismo UUID. Detalle en [Autenticación → Idempotencia](/docs/authentication#idempotencia).

```bash
curl -s -X POST "$API_BASE/send-invoice" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -H "x-idempotency-key: $(uuidgen)" \
  -d "{
    \"nif\": \"$NIF\",
    \"nombre\": \"$NOMBRE\",

    \"numSerie\": \"2026/F-001\",
    \"fecha\": \"$(date +%d-%m-%Y)\",
    \"tipoFactura\": \"F1\",
    \"descripcion\": \"Servicios de consultoría\",

    \"destNombre\": \"FNMT-RCM\",
    \"destNif\": \"Q2826004J\",

    \"cuotaTotal\": 21.00,
    \"total\": 121.00,

    \"detalles\": [{
      \"clave\": \"01\",
      \"calif\": \"S1\",
      \"tipo\": 21,
      \"base\": 100.00,
      \"cuota\": 21.00
    }],

    \"sistemaInformatico\": {
      \"nombreRazon\": \"$NOMBRE\",
      \"nif\": \"$NIF\",
      \"nombreSistemaInformatico\": \"MyERP\",
      \"idSistemaInformatico\": \"01\",
      \"version\": \"1.0.0\",
      \"tipoUsoPosibleSoloVerifactu\": \"S\",
      \"tipoUsoPosibleMultiOT\": \"N\",
      \"indicadorMultiplesOT\": \"N\"
    }
  }"
```

**Campos del ejemplo:**

| Campo | Qué es |
|-------|--------|
| `nif` / `nombre` | Tu NIF y nombre como emisor |
| `numSerie` | Número de factura — único por serie |
| `fecha` | Fecha de expedición `DD-MM-YYYY` |
| `tipoFactura` | `F1` = factura normal; `F2`–`F5` y `R1`–`R5` según caso |
| `descripcion` | Texto de la operación (obligatorio) |
| `destNif` / `destNombre` | Cliente (excepto F2; ver [Envío de facturas](/docs/envio-facturas)) |
| `cuotaTotal` / `total` | IVA repercutido y total factura |
| `detalles` | Desglose IVA — `clave 01` régimen general; `calif S1` sujeta no exenta |
| `sistemaInformatico` | Identifica tu software ante AEAT |
| `x-idempotency-key` | UUID que generas tú (cabecera, no body) |

No hace falta enviar `huella`, `tipoHuella`, `fechaHoraHusoGenRegistro`, `primerRegistro` ni `encadenamiento` en el camino feliz: el servidor los completa.

La respuesta inmediata es `202` con un job en cola:

```json
{
  "success": true,
  "jobId": "3e033807-17a0-4e1e-b1ba-7711d690fb3f",
  "status": "PENDING"
}
```

Esto es normal — el envío a AEAT es asíncrono.

## Paso 3 — Consultar el resultado

Guarda el `jobId` y consúltalo hasta que el estado sea **terminal**: `SUCCEEDED` o `DEAD`.

> **`FAILED` no es el final.** El proceso en segundo plano reintenta con espera creciente. Sigue consultando el estado hasta `SUCCEEDED` o `DEAD`.

```bash
JOB_ID="3e033807-17a0-4e1e-b1ba-7711d690fb3f"  # sustituye por el tuyo

curl -s "$API_BASE/jobs/$JOB_ID" \
  -H "x-api-key: $API_KEY"
```

Cuando llega a `SUCCEEDED`:

```json
{
  "success": true,
  "status": "SUCCEEDED",
  "result": {
    "qrInfo": {
      "csv": "A-XXXXXXXXXXX",
      "verificationUrl": "https://www2.agenciatributaria.gob.es/...",
      "qrText": "https://www2.agenciatributaria.gob.es/..."
    }
  }
}
```

`csv` es el código de verificación oficial de AEAT.
`qrText` es la URL que debes codificar como QR e imprimir en el PDF (art. 25 del RD 1007/2023).

En producción, consulta el estado cada 2–5 segundos con espera creciente. Típicamente el job se resuelve en menos de 3 segundos. Alternativa: [Webhooks](/docs/webhooks).

## Paso 4 — Segunda factura y siguientes

Para la siguiente factura de la misma serie, cambia `numSerie` (p. ej. `2026/F-002`), genera un **nuevo** `x-idempotency-key` y vuelve a llamar con el mismo estilo de cuerpo (sin huella manual). El servidor enlaza con la última huella de la cadena.

Si prefieres controlar el encadenamiento a mano, puedes enviar `primerRegistro` / `encadenamiento` / `huella` — ver [Envío de facturas](/docs/envio-facturas#huella-y-encadenamiento) y [Conceptos](/docs/concepts).

## Apéndice — Calcular la huella a mano (opcional)

Solo si tu integración necesita generar la huella en cliente. En el camino feliz **no** hace falta.

> Detalle del formato: [Conceptos → Huella](/docs/concepts#huella-sha-256).

```bash
read HUELLA TIMESTAMP < <(node -e "
  const c = require('crypto');
  const fmt = v => Number(v).toFixed(2).replace(/\.00$/, '.0');
  const ts = new Date().toISOString()
    .replace('Z', '+00:00')
    .replace(/\.\d{3}/, '');
  const nif = process.env.NIF;
  const fecha = new Date().toLocaleDateString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  }).replace(/\\//g, '-');
  const cadena = [
    'IDEmisorFactura=' + nif,
    'NumSerieFactura=2026/F-001',
    'FechaExpedicionFactura=' + fecha,
    'TipoFactura=F1',
    'CuotaTotal=' + fmt(21),
    'ImporteTotal=' + fmt(121),
    'Huella=',
    'FechaHoraHusoGenRegistro=' + ts,
  ].join('&');
  const h = c.createHash('sha256').update(cadena, 'utf8').digest('hex').toUpperCase();
  process.stdout.write(h + ' ' + ts);
")
```

Si envías huella a mano, debes enviar **los tres** juntos: `huella`, `tipoHuella` (`01`) y `fechaHoraHusoGenRegistro`.

## ¿Qué sigue?

- [Envío de facturas](/docs/envio-facturas) — diccionario de campos del body
- [Anulación de facturas](/docs/cancelacion-facturas) — `POST /cancel-invoice`
- [Verificar NIF](/docs/verificar-nif) — validar destinatario antes de enviar
- [Manejo de errores](/docs/error-codes) — errores frecuentes de AEAT
- [Autenticación](/docs/authentication) — API key, certificado e idempotencia
- [Referencia API](/docs/api-reference#tag/Facturas/POST/send-invoice) — OpenAPI (`POST /send-invoice`)
- [Registro de cambios](/docs/changelog) — qué cambió si ya tenías una integración
