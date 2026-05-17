---
title: Quickstart
description: Envía tu primera factura a AEAT con curl en menos de 5 minutos.
---

Esta guía te lleva paso a paso desde cero hasta recibir un CSV de AEAT.
Si algunos términos (huella, encadenamiento, primer registro) te suenan a chino, lee antes los [Conceptos clave](/docs/concepts) — son 3 minutos y lo harán todo mucho más claro.

## Antes de empezar

Necesitas dos cosas:

- **API key** — contáctanos y te la enviamos. Tiene el formato `vf_...`.
- **Certificado digital AEAT** subido al sistema. Puedes hacerlo desde la app en *Ajustes → Veri·Factu*, o vía API (ver [Autenticación](/docs/authentication)). Si aún no lo tienes configurado, escríbenos y te ayudamos.

## Paso 1 — Variables de entorno

Abre la terminal y define estas variables. Las usaremos en todos los pasos siguientes.

```bash
export API_BASE="https://api.simplefactu.com/v1"   # o tu dominio propio
export API_KEY="vf_..."                             # tu API key
export NIF="B12345678"                              # tu NIF como emisor
export NOMBRE="ACME SL"                             # tu nombre o razón social
```

## Paso 2 — Calcular la huella

**¿Qué es esto?** La huella es un hash SHA-256 de los datos principales de la factura.
AEAT la comprueba para verificar que nadie ha modificado los datos en tránsito.
Para la **primera factura** de una serie no hay huella anterior — eso se indica con `primerRegistro: true`.

> Si quieres entender por qué existe y cómo funciona la cadena, lee [Conceptos clave → Huella](/docs/concepts#huella-fingerprint-sha-256).

El script calcula la huella a partir del importe y otros datos, y también genera el timestamp con zona horaria que AEAT requiere:

```bash
read HUELLA TIMESTAMP < <(node -e "
  const c = require('crypto');

  // Formato AEAT: eliminar el segundo decimal si es cero
  // 210.00 → 210.0  |  21.15 → 21.15
  const fmt = v => Number(v).toFixed(2).replace(/\.00$/, '.0');

  // Timestamp ISO 8601 con zona horaria, sin milisegundos
  const ts = new Date().toISOString()
    .replace('Z', '+00:00')
    .replace(/\.\d{3}/, '');

  // Cadena canónica: campos separados por & en orden fijo
  const cadena = [
    'IDEmisorFactura=$NIF',
    'NumSerieFactura=2026/F-001',
    'FechaExpedicionFactura=\$(date +%d-%m-%Y)',
    'TipoFactura=F1',
    'CuotaTotal=' + fmt(21),       // IVA total
    'ImporteTotal=' + fmt(121),    // total con IVA
    'Huella=',                     // vacío porque es primerRegistro
    'FechaHoraHusoGenRegistro=' + ts,
  ].join('&');

  const h = c.createHash('sha256').update(cadena, 'utf8').digest('hex').toUpperCase();
  process.stdout.write(h + ' ' + ts);
")
```

Comprueba que tienes los valores:

```bash
echo "Huella:    $HUELLA"
echo "Timestamp: $TIMESTAMP"
```

## Paso 3 — Enviar la factura

Ahora enviamos la factura. Fíjate en los campos comentados — son los más importantes para entender el cuerpo:

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

    \"primerRegistro\": true,
    \"huella\": \"$HUELLA\",
    \"tipoHuella\": \"01\",
    \"fechaHoraHusoGenRegistro\": \"$TIMESTAMP\",

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

**Campos clave del body:**

| Campo | Qué es |
|-------|--------|
| `nif` / `nombre` | Tu NIF y nombre como emisor de la factura |
| `numSerie` | Número de factura — debe ser único por serie |
| `tipoFactura` | `F1` = factura normal; `R1`–`R5` = rectificativas |
| `descripcion` | Texto libre que describe la operación (obligatorio por ley) |
| `destNif` / `destNombre` | NIF y nombre de tu cliente |
| `cuotaTotal` | Suma del IVA de todos los detalles |
| `total` | Base + IVA total |
| `primerRegistro` | `true` solo en la primera factura de la serie; `false` en todas las demás |
| `huella` | La que calculaste en el paso anterior |
| `detalles` | Desglose del IVA — `clave 01` = régimen general; `calif S1` = operación sujeta y no exenta |
| `sistemaInformatico` | Identifica el software que emite la factura (requerido por AEAT) |
| `x-idempotency-key` | UUID único por intento — protege contra envíos duplicados si la red falla |

La respuesta inmediata es `202 Accepted` con un job en cola:

```json
{
  "success": true,
  "jobId": "3e033807-17a0-4e1e-b1ba-7711d690fb3f",
  "status": "PENDING"
}
```

Esto es normal — el envío a AEAT es asíncrono para no bloquearte si AEAT tarda o tiene problemas.

## Paso 4 — Consultar el resultado

Guarda el `jobId` y consúltalo hasta que cambie a `SUCCEEDED` o `FAILED`:

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

`csv` es el código de verificación oficial de AEAT para esa factura.
`qrText` es la URL que debes codificar como QR e imprimir en el PDF (obligatorio por el art. 25 del RD 1007/2023).

En producción, haz polling cada 2–5 segundos con backoff. Típicamente el job se resuelve en menos de 3 segundos.

## Paso 5 — Segunda factura y siguientes

A partir de la segunda factura, `primerRegistro` es `false` y debes pasar la huella de la factura anterior:

```bash
# La huella de la factura anterior la guardas cuando recibes SUCCEEDED
HUELLA_ANTERIOR="910204E9..."   # huella de la factura 2026/F-001

# En el body:
# "primerRegistro": false,
# "encadenamiento": {
#   "registroAnterior": {
#     "idEmisorFactura": "$NIF",
#     "numSerieFactura": "2026/F-001",
#     "fechaExpedicionFactura": "DD-MM-YYYY",
#     "huella": "$HUELLA_ANTERIOR"
#   }
# }
```

La cadena canónica para calcular la nueva huella también cambia: el campo `Huella=` ya no va vacío, sino que lleva `$HUELLA_ANTERIOR`.

## ¿Qué sigue?

- [Manejo de errores](/docs/error-codes) — los errores más frecuentes de AEAT y cómo resolverlos
- [Autenticación](/docs/authentication) — cómo rotar la API key y subir el certificado vía API
- [API Reference](/docs/api-reference) — todos los campos y endpoints con esquemas completos
