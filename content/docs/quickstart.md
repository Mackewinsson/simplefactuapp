---
title: Inicio rápido
description: Emite tu primera factura Veri*Factu contra la API alojada de Simple*Factu (curl).
---

Esta guía es para **integradores ERP**: llamas a nuestra API en la nube. **No** hace falta clonar ningún repositorio, instalar Node ni configurar un `.env` de servidor.

Si algunos términos (huella, encadenamiento, primer registro) te suenan raros, lee antes los [Conceptos clave](/docs/concepts). Diccionario completo de campos: [Envío de facturas](/docs/envio-facturas). URLs QA/prod: [Entornos](/docs/entornos).

## Qué necesitas

Solo dos cosas:

1. **Una API key** (`vf_...`) — la emite soporte. Escríbenos a [soporte@simplefactu.com](mailto:soporte@simplefactu.com) con empresa, NIF emisor y si quieres **QA** o **producción**. Detalle: [Autenticación](/docs/authentication).
2. **Tu certificado FNMT** (`.pfx` / `.p12`) subido a la cuenta:
   - Desde la app web: *Ajustes → Veri\*Factu*, o
   - Por API: [Autenticación → Certificado](/docs/authentication#certificado-digital-aeat).

Base URL de esta guía (QA):

```text
https://api.qa.simplefactu.com/v1
```

Producción: `https://api.simplefactu.com/v1` (misma ruta, otra clave).

## Paso 1 — Enviar la factura

Sustituye `vf_...`, el NIF y el nombre por los tuyos (NIF **real** del titular del certificado FNMT; AEAT no acepta NIFs inventados).

El servidor genera la **huella**, el timestamp, el encadenamiento y el **sistema informático (SIF)**. Solo envías los datos de negocio de la factura (emisor, importes, desglose, destinatario).

> **`x-idempotency-key`:** genera un UUID **tú** (p. ej. `uuidgen`). Factura nueva → UUID nuevo. Si la red falla y reintentas el **mismo** JSON → reutiliza el mismo UUID. [Idempotencia](/docs/authentication#idempotencia).

```bash
curl -s -X POST "https://api.qa.simplefactu.com/v1/send-invoice" \
  -H "Content-Type: application/json" \
  -H "x-api-key: vf_..." \
  -H "x-idempotency-key: $(uuidgen)" \
  -d '{
    "nif": "Z0706098A",
    "nombre": "NOMBRE TITULAR CERTIFICADO",
    "numSerie": "2026/F-001",
    "fecha": "31-07-2026",
    "tipoFactura": "F1",
    "descripcion": "Servicios de consultoría",
    "destNombre": "FNMT-RCM",
    "destNif": "Q2826004J",
    "cuotaTotal": 21.00,
    "total": 121.00,
    "detalles": [{
      "clave": "01",
      "calif": "S1",
      "tipo": 21,
      "base": 100.00,
      "cuota": 21.00
    }]
  }'
```

| Campo | Qué es |
|-------|--------|
| `nif` / `nombre` | Emisor (obligado tributario) |
| `numSerie` | Número de factura (único en la serie) |
| `fecha` | Expedición `DD-MM-YYYY` |
| `tipoFactura` | `F1` = factura normal |
| `descripcion` | Texto de la operación (obligatorio) |
| `destNif` / `destNombre` | Cliente |
| `cuotaTotal` / `total` | IVA y total |
| `detalles` | Desglose IVA |

No hace falta enviar `sistemaInformatico`, `huella`, `tipoHuella`, `fechaHoraHusoGenRegistro`, `primerRegistro` ni `encadenamiento` en el camino feliz.

Respuesta inmediata **`202`** (encolado):

```json
{
  "success": true,
  "jobId": "3e033807-17a0-4e1e-b1ba-7711d690fb3f",
  "status": "PENDING"
}
```

El envío a AEAT es asíncrono: nosotros lo procesamos en segundo plano.

## Paso 2 — Consultar el resultado

Guarda el `jobId` y consulta hasta un estado **terminal**: `SUCCEEDED` o `DEAD`.

> **`FAILED` no es el final.** Seguimos reintentando. No dejes de consultar solo porque veas `FAILED`.

```bash
curl -s "https://api.qa.simplefactu.com/v1/jobs/3e033807-17a0-4e1e-b1ba-7711d690fb3f" \
  -H "x-api-key: vf_..."
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

- `csv` — código de verificación AEAT  
- `qrText` — URL a codificar como QR en el PDF (art. 25 RD 1007/2023)

Consulta cada 2–5 segundos. Suele resolverse en pocos segundos. Alternativa: [Webhooks](/docs/webhooks).

## Paso 3 — Facturas siguientes

Cambia `numSerie` (p. ej. `2026/F-002`), genera un **nuevo** `x-idempotency-key` y vuelve a llamar igual (sin huella manual). El servidor enlaza con la última huella de la cadena.

Encadenamiento manual: [Envío de facturas](/docs/envio-facturas#huella-y-encadenamiento).

## ¿Qué sigue?

- [Envío de facturas](/docs/envio-facturas) — diccionario del body  
- [Anulación](/docs/cancelacion-facturas) — `POST /cancel-invoice`  
- [Verificar NIF](/docs/verificar-nif)  
- [Errores](/docs/error-codes)  
- [Autenticación](/docs/authentication)  
- [Referencia API](/docs/api-reference#tag/Facturas/POST/send-invoice)  

¿Usas la **app web** (autónomo) y no un ERP? No necesitas esta guía: emite desde [Facturas](/invoices) tras configurar el certificado en Ajustes.
