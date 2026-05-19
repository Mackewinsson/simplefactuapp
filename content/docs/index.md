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
3. **[Autenticación](/docs/authentication)** — cómo obtener tu API key y subir tu certificado digital.
4. **[Referencia API](/docs/api-reference)** — especificación OpenAPI interactiva de todos los endpoints.

## ¿Cómo accedo?

| Perfil | Cómo usar {{APP_DISPLAY_NAME}} |
|--------|-------------------------------|
| **Autónomo o pyme** que usa la app web | Registro en simplefactu.com — el certificado y la API key se gestionan desde Ajustes |
| **ERP o integrador** (server-to-server) | Te emitimos una API key; llamas a `/v1/send-invoice` directamente desde tu backend |

Los conceptos (huella, encadenamiento, CSV) son los mismos en ambos casos — solo cambia quién llama a la API.

## Soporte

Cada respuesta de la API incluye un `requestId`. Si algo falla, mándanoslo por email y podremos ver la traza completa del envío.
