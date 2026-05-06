---
title: Quickstart
description: Emite tu primera factura en 5 minutos con un curl.
---

Esta guía asume que ya tienes:

- Una **API key** emitida por nosotros (formato `vf_...`). Si no la tienes,
  contáctanos y te la enviamos.
- Tu **certificado digital AEAT** subido al sistema (también te ayudamos
  desde soporte si lo necesitas).

## 1. Variables base

```bash
export API_BASE="https://api.tudominio.com/v1"
export API_KEY="vf_..."
export NIF="B12345678"        # tu NIF emisor
export NOMBRE="ACME SL"
```

## 2. Componer la huella

Veri\*Factu obliga a enviar una huella SHA-256 de la cadena canónica. El
servidor la valida; si te equivocas, devuelve `409 ChainContinuityError`.

```bash
read HUELLA TIMESTAMP < <(node -e "
  const c = require('crypto');
  const fmt = v => Number(v).toFixed(2).replace(/\.00$/, '.0');
  const ts = new Date().toISOString().replace('Z', '+00:00').replace(/\.\d{3}/, '');
  const cadena = [
    'IDEmisorFactura=$NIF',
    'NumSerieFactura=2026/F-001',
    'FechaExpedicionFactura=$(date +%d-%m-%Y)',
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

## 3. Enviar la factura

```bash
curl -X POST "$API_BASE/send-invoice" \
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
    \"detalles\": [{\"clave\":\"01\",\"calif\":\"S1\",\"tipo\":21,\"base\":100.00,\"cuota\":21.00}],
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

Respuesta (modo asíncrono, default):

```json
{
  "success": true,
  "jobId": "3e033807-17a0-4e1e-b1ba-7711d690fb3f",
  "status": "PENDING"
}
```

## 4. Consultar el resultado

```bash
curl "$API_BASE/jobs/3e033807-17a0-4e1e-b1ba-7711d690fb3f" \
  -H "x-api-key: $API_KEY"
```

Cuando `status` sea `SUCCEEDED`:

```json
{
  "success": true,
  "status": "SUCCEEDED",
  "result": {
    "qrInfo": {
      "csv": "A-XXXXXXXXXXX",
      "verificationUrl": "https://www2.agenciatributaria.gob.es/wlpl/TIKE-CONT/ValidarQR?...",
      "qrText": "https://www2.agenciatributaria.gob.es/..."
    }
  }
}
```

Pinta `qrInfo.qrText` como QR en tu factura impresa y ya cumples con el
art. 25 del RD 1007/2023.

## Siguiente paso

- [Manejo de errores AEAT](/docs/error-codes)
- [API Reference completa](/docs/api-reference)
