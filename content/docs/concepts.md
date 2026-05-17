---
title: Conceptos clave
description: Veri·Factu, huella, encadenamiento, CSV y primer registro explicados sin tecnicismos.
---

Antes de enviar tu primera factura conviene entender cinco conceptos que aparecen en todos lados.
No tienes que memorizar la normativa — solo entender por qué existe cada pieza.

## Veri·Factu en una frase

Veri·Factu es el sistema que obliga a los programas de facturación a **enviar cada factura a Hacienda (AEAT) en tiempo real**, de forma que no pueda modificarse después.
La ley detrás es el RD 1007/2023 y la orden ministerial OM HAC/1177/2024.

## Huella (fingerprint SHA-256)

Cuando emites una factura, tienes que calcular un **hash SHA-256 de los datos principales** de esa factura (importe, NIF, número, fecha, tipo…) y enviarlo junto con la factura.

¿Por qué? Porque Hacienda también calcula ese hash por su cuenta. Si los dos coinciden, la factura no ha sido manipulada. Si no coinciden → error `2000`.

```
Datos de tu factura  →  hash SHA-256  →  "huella"  →  se incluye en el envío
                                             ↑
                              AEAT la recalcula y compara
```

La huella tiene un formato estricto: 64 caracteres hexadecimales en **mayúsculas**.
El campo se llama `huella` en el JSON y `tipoHuella: "01"` significa SHA-256.

> **Truco de depuración:** si AEAT te devuelve el error `2000`, el mensaje incluye la cadena canónica que ELLOS calcularon. Cópiala, calcula su SHA-256 y compara con la tuya — así encuentras exactamente qué dato estás formateando distinto.

### Formato de importes en la huella

Este es el error más frecuente. Los importes dentro de la cadena canónica **no** usan dos decimales siempre:

| Valor | ❌ Incorrecto | ✅ Correcto |
|-------|--------------|------------|
| 210   | `210.00`     | `210.0`    |
| 1210  | `1210.00`    | `1210.0`   |
| 21.10 | `21.10`      | `21.1`     |
| 21.15 | `21.15`      | `21.15`    |

Fórmula: `Number(v).toFixed(2).replace(/\.00$/, ".0")`.

## Encadenamiento

Las facturas no son independientes: **cada factura incluye la huella de la factura anterior**.
Esto forma una cadena que hace imposible insertar o borrar facturas del histórico sin que se note.

```
Factura 1  →  huella₁
Factura 2  →  (huella₁ + datos₂)  →  huella₂
Factura 3  →  (huella₂ + datos₃)  →  huella₃
```

Nosotros llevamos el rastro por ti. Lo único que tienes que hacer es pasarnos la huella de la factura anterior en el campo `encadenamiento.registroAnterior` de cada envío (excepto en el primero, donde usas `primerRegistro: true`).

## Primer registro (`primerRegistro: true`)

La primera factura de una cadena nueva no tiene "factura anterior", así que en vez de pasar una huella anterior se envía `primerRegistro: true`.

```
primerRegistro: true   →  no hay huella anterior, es la primera de la cadena
primerRegistro: false  →  DEBES pasar la huella de la factura anterior
```

Si mandas `primerRegistro: true` y la cadena ya tiene facturas → error `409 ChainStateError "Chain already exists"`.
Si mandas `primerRegistro: false` sin la huella correcta → error `409 ChainContinuityError`.

## CSV (Código Seguro de Verificación)

Cuando AEAT acepta tu factura te devuelve un **CSV**: un código alfanumérico con el formato `A-XXXXXXXXXXXXXXX`.
Es el "número de expediente" de esa factura en los servidores de Hacienda.

Con el CSV y la URL de verificación, cualquiera puede comprobar en la web de la AEAT que la factura existe y no ha sido manipulada.
**Debes imprimir el CSV y el QR en el PDF de la factura** (art. 25 del RD 1007/2023).

## Sistema informático (`sistemaInformatico`)

AEAT exige identificar qué software emitió la factura. Cada envío incluye un bloque que describe tu programa (nombre, NIF, versión).

En la práctica: copia el bloque de ejemplo del [Quickstart](/docs/quickstart#paso-3--enviar-la-factura) y ajusta `nombreRazon`, `nif` y `version` con los tuyos. No necesitas cambiar nada más para empezar.

Con esto claro, el [Quickstart](/docs/quickstart) debería tener mucho más sentido.
