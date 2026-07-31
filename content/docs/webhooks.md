---
title: Webhooks
description: Notificaciones firmadas cuando un job de factura llega a SUCCEEDED o DEAD.
---

El servidor puede avisar a tu URL cuando un job de `send-invoice` / `cancel-invoice` alcanza un estado **terminal** (`SUCCEEDED` o `DEAD`). Así reduces el polling continuo (sigue siendo recomendable reconciliar con `GET /jobs/:id` o [registros](/docs/registros)).

> La [Referencia API](/docs/api-reference) (Scalar) **no** incluye la configuración de webhooks (es admin). El contrato completo está también en [INTEGRATION.md](https://github.com/Mackewinsson/simplefactu/blob/main/docs/INTEGRATION.md#webhooks-salientes).

## 1. Registrar URL y secreto

Lo configura un operador con `x-admin-key` (o soporte si eres ERP):

```http
PATCH /v1/admin/tenants/{tenantId}/webhook
x-admin-key: <ADMIN_KEY>
Content-Type: application/json

{
  "url": "https://tu-sistema.com/hooks/simplefactu",
  "secret": "un-secreto-aleatorio-256bits"
}
```

Para integradores sin `ADMIN_KEY`: pide a [soporte@simplefactu.com](mailto:soporte@simplefactu.com) que registre tu URL y te entregue el secreto por canal seguro.

## 2. Eventos

| Evento | Cuándo | Payload extra |
|--------|--------|---------------|
| `invoice.succeeded` | Job aceptado por AEAT | `jobId`, `type`, `numSerie`, `csv?`, `huella?`, `qrText?` |
| `invoice.failed` | Job marcado `DEAD` | `jobId`, `type`, `numSerie?`, `lastError` |

Ejemplo:

```json
{
  "event": "invoice.succeeded",
  "tenantId": "acme",
  "jobId": "f47ac10b-...",
  "type": "SEND_INVOICE",
  "numSerie": "2026/F-001",
  "csv": "A-QT7D7AKJVFDMZB",
  "huella": "910204E9...",
  "qrText": "https://www2.agenciatributaria.gob.es/...",
  "timestamp": "2026-05-08T13:00:00.000Z"
}
```

## 3. Verificar la firma

Cabecera: `X-Simplefactu-Signature: sha256=<hex>` donde el hex es `HMAC-SHA256(secret, body_raw)`.

```js
const crypto = require("crypto");

function verifySignature(secret, rawBody, signatureHeader) {
  const expected =
    "sha256=" +
    crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(signatureHeader),
    Buffer.from(expected)
  );
}
```

Usa siempre comparación en tiempo constante.

## 4. Garantías

- **Best-effort, sin reintentos** de entrega. Si tu endpoint no responde a tiempo, se descarta la entrega.
- Responde `2xx` rápido y procesa en cola propia.
- Red de seguridad: `GET /jobs/:jobId` y `GET /me/invoice-records`.
