---
title: Códigos de error AEAT
description: Los errores más frecuentes que devuelve AEAT y qué hacer con cada uno.
---

Cuando AEAT rechaza un envío, devolvemos su código original sin transformarlo.
Estos son los más habituales:

| Código | Nivel | Significado | Causa común |
|--------|-------|-------------|-------------|
| `1146` | Registro | FechaOperación posterior a la fecha de expedición | El cliente envió fechas incoherentes para un régimen distinto al 14/15 |
| `1239` | Registro | NIF Destinatario incorrecto | El NIF del cliente no existe en la base AEAT |
| `2000` | Registro | Huella suministrada incorrecta | Formato de importes mal: usa `1210.0` no `1210.00` |
| `4102` | Envío | XML no cumple el esquema | Campo obligatorio faltante (típico: olvidar `PrimerRegistro`) |
| `4104` | Envío | NIF titular no identificado | Tu NIF emisor no existe o no está dado de alta |
| `4109` | Envío | NIF SistemaInformatico incorrecto | El NIF del bloque `sistemaInformatico` no es real |
| `4116` | Envío | NIF ObligadoEmision incorrecto | El NIF emisor de la factura no es real |

## Cómo reaccionar

- **`1146`, `2000`** → bug en tu integración. Corrige los importes/fechas y
  reenvía con una nueva `x-idempotency-key`.
- **`1239`** → muestra al usuario "el NIF del cliente no es válido en AEAT"
  para que lo corrija.
- **`4102`, `4104`, `4109`, `4116`** → problema de configuración (NIFs
  ficticios o certificado incorrecto). Revisa tu setup.

## Si una factura acaba en `DEAD`

`DEAD` = el sistema agotó los reintentos. Para emitir un **rectificativo**
(R1-R5) que reemplace la factura rota:

```bash
curl -X POST "$API_BASE/admin/jobs/$JOB_ID/issue-correction" \
  -H "x-admin-key: $ADMIN_KEY" \
  -d '{"tipoFactura":"R1","numSerie":"2026/F-001-RECT"}'
```

Esto crea un nuevo job apuntando a la factura original. Disponible también
desde el panel admin.

## Audit trail

Cada respuesta incluye un `requestId` (UUID). Si necesitas soporte, mándanoslo
y podremos ver toda la traza del envío en logs.
