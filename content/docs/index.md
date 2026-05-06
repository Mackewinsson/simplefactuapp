---
title: SimpleFactu Docs
description: Documentación de la API SimpleFactu para integraciones con Veri*Factu (AEAT).
---

Bienvenido a la documentación de **SimpleFactu**. Esta API te permite emitir
facturas conforme al sistema **Veri\*Factu** de la Agencia Tributaria
(RD 1007/2023, OM HAC/1177/2024) sin construir tú la integración SOAP con AEAT.

## ¿Qué hace SimpleFactu?

- Recibe la factura en JSON.
- Valida los datos según las reglas normativas (NIF, encadenamiento de huellas,
  formato de importes, fechas).
- Construye el XML SOAP, lo firma con tu certificado digital y lo envía a AEAT.
- Devuelve el CSV (Código Seguro de Verificación) y la URL del QR.
- Mantiene la cadena de huellas para que sigas cumpliendo en envíos sucesivos.

## Empezar en 3 pasos

1. **[Quickstart](/docs/quickstart)**: emite tu primera factura con `curl`
   en menos de 5 minutos.
2. **[Autenticación](/docs/authentication)**: cómo obtener tu API key y
   subir el certificado digital.
3. **[API Reference](/docs/api-reference)**: especificación completa de
   todos los endpoints, generada automáticamente desde el OpenAPI.

## Modelos de integración

| Modelo | Quién | Cómo |
|--------|-------|------|
| **App web (Clerk)** | Autónomos / pymes que usan la app | Registro normal en simplefactu.com; el BFF gestiona la API key automáticamente |
| **API directa (server-to-server)** | ERPs e integradores | Te emitimos una API key desde el panel admin; tú llamas a `/v1/send-invoice` directamente |

Esta documentación cubre principalmente el segundo modelo.

## Soporte

- ¿Bug? Email a soporte con el `requestId` que devolvemos en cada respuesta.
- ¿Falta una funcionalidad? Escríbenos y dinos qué priorizarías.
