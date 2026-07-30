---
---

{{APP_DISPLAY_NAME}} es el intermediario entre **tu sistema de facturación y Hacienda (AEAT)**.
Tú envías un JSON con los datos de la factura; nosotros construimos el XML, lo firmamos con tu certificado y lo enviamos a AEAT por SOAP.

## Cómo funciona en 30 segundos

```
Tu sistema   →   POST /send-invoice (JSON)
                      │
              {{APP_DISPLAY_NAME}} valida, firma y envía
                      │
                    AEAT ← XML SOAP con mTLS
                      │
              ← CSV + URL de verificación + QR
                      │
              ← 202 PENDING (jobId)
                      │
Tu sistema   →   GET /jobs/:jobId  ←  SUCCEEDED + resultado
```

Cuando el job llega a `SUCCEEDED` tienes el **CSV** (código de verificación de AEAT) y el **QR** que debes imprimir en la factura. Todo lo demás — huellas, encadenamiento, firma SOAP, reintentos — lo gestionamos nosotros.

## Por dónde empezar

1. **[Conceptos clave](/docs/concepts)** — qué es una huella, el encadenamiento, el CSV y el primer registro. Lee esto si es tu primera vez con Veri·Factu.
2. **[Inicio rápido](/docs/quickstart)** — emite tu primera factura con `curl` en menos de 5 minutos.
3. **[Envío de facturas](/docs/envio-facturas)** — diccionario de campos de `POST /send-invoice` (incl. `x-idempotency-key`).
4. **[Autenticación](/docs/authentication)** — API key, certificado e idempotencia.
5. **[Gestoría](/docs/gestoria)** — panel y API para asesorías con varios autónomos.
6. **[Referencia API](/docs/api-reference)** — especificación OpenAPI interactiva de todos los endpoints.

## ¿Cómo accedo?

| Perfil | Cómo usar {{APP_DISPLAY_NAME}} |
|--------|-------------------------------|
| **Autónomo o pyme** que usa la app web | Registro en simplefactu.com — certificado y envío desde Ajustes Verifactu; archivo en Facturas → Registros AEAT |
| **Gestoría / asesoría** | Panel [Gestoría](/docs/gestoria) (`/partner`) o API partner — un sub-tenant por autónomo |
| **ERP o integrador** (server-to-server) | API key con scopes de facturación; `POST /v1/send-invoice` desde tu backend |

Los conceptos (huella, encadenamiento, CSV) son los mismos en ambos casos — solo cambia quién llama a la API.

## Soporte

Cada respuesta de la API incluye un `requestId`. Si algo falla, mándanoslo por email y podremos ver la traza completa del envío.
