/**
 * POLÍTICA DE PRIVACIDAD — esqueleto editable RGPD
 *
 * Cumple los art. 13/14 RGPD y la LOPDGDD 3/2018. Los marcadores con doble
 * paréntesis son datos reales del titular o decisiones de negocio que tu
 * abogado debe confirmar antes de publicar.
 *
 * Especialmente sensibles porque procesamos:
 *   - Datos identificativos de los usuarios (Clerk).
 *   - Datos fiscales de los emisores y de sus clientes (NIFs, importes,
 *     descripción de operaciones).
 *   - Datos de pago (a través de Stripe; no almacenamos tarjetas).
 */

export const metadata = { title: "Política de privacidad — SimpleFactu" };

export default function PrivacyPolicyPage() {
  return (
    <>
      <h1>Política de privacidad</h1>
      <p className="text-sm text-gray-500">Última actualización: ((FECHA_REVISION))</p>

      <h2>1. Responsable del tratamiento</h2>
      <ul>
        <li>
          <strong>Responsable:</strong> ((RAZÓN_SOCIAL)) — NIF ((NIF_TITULAR))
        </li>
        <li>
          <strong>Domicilio:</strong> ((DIRECCIÓN_POSTAL))
        </li>
        <li>
          <strong>Email del DPO / contacto privacidad:</strong> ((EMAIL_PRIVACIDAD))
        </li>
      </ul>

      <h2>2. Datos que tratamos</h2>
      <h3>2.1. Cuenta de usuario (autenticación vía Clerk)</h3>
      <ul>
        <li>Nombre y apellidos.</li>
        <li>Dirección de email.</li>
        <li>Identificador interno asignado por Clerk.</li>
        <li>Metadatos de sesión (IP, user-agent, fechas de inicio/cierre).</li>
      </ul>

      <h3>2.2. Datos del emisor y de sus clientes</h3>
      <ul>
        <li>NIF del emisor y de cada destinatario.</li>
        <li>Razón social y nombre comercial.</li>
        <li>Importes, base imponible, cuotas, conceptos.</li>
        <li>Series y números de factura.</li>
        <li>Certificado digital del emisor (cifrado AES-256-GCM antes de
          almacenarse).</li>
      </ul>

      <h3>2.3. Datos de facturación (Stripe)</h3>
      <ul>
        <li>Identificador del cliente Stripe y de las suscripciones activas.</li>
        <li>Historial de pagos. <strong>No almacenamos números de tarjeta.</strong></li>
      </ul>

      <h2>3. Finalidades y bases jurídicas</h2>
      <table>
        <thead>
          <tr>
            <th>Finalidad</th>
            <th>Base jurídica (art. 6 RGPD)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Prestar el servicio de facturación electrónica con AEAT</td>
            <td>Ejecución de contrato (art. 6.1.b)</td>
          </tr>
          <tr>
            <td>Cumplir obligaciones fiscales y de conservación documental</td>
            <td>Obligación legal (art. 6.1.c)</td>
          </tr>
          <tr>
            <td>Cobro y gestión de la suscripción</td>
            <td>Ejecución de contrato (art. 6.1.b)</td>
          </tr>
          <tr>
            <td>Atención de soporte</td>
            <td>Ejecución de contrato y consentimiento (art. 6.1.b/a)</td>
          </tr>
          <tr>
            <td>Mejora del servicio (telemetría agregada)</td>
            <td>Interés legítimo (art. 6.1.f) — siempre con datos no identificables</td>
          </tr>
        </tbody>
      </table>

      <h2>4. Plazos de conservación</h2>
      <ul>
        <li>
          <strong>Datos fiscales:</strong> ((PLAZO_DATOS_FISCALES, recomendado 6 años,
          art. 30 Código de Comercio + 4 años Ley 58/2003 LGT)).
        </li>
        <li>
          <strong>Datos de cuenta:</strong> mientras la cuenta esté activa y, tras la
          baja, durante el plazo legal de prescripción de acciones (((PLAZO_BAJA))).
        </li>
        <li>
          <strong>Logs de acceso técnicos:</strong> ((PLAZO_LOGS, p. ej. 12 meses)).
        </li>
      </ul>

      <h2>5. Encargados de tratamiento (subprocessors)</h2>
      <ul>
        <li>
          <strong>Clerk Inc.</strong> (autenticación) — datos en EE.UU., cláusulas
          contractuales tipo y certificación DPF.
        </li>
        <li>
          <strong>Stripe Payments Europe Ltd.</strong> (cobros) — datos en UE / EE.UU.
        </li>
        <li>
          <strong>Hetzner Online GmbH</strong> (alojamiento del servicio) — Alemania, UE.
        </li>
        <li>
          <strong>GitHub Inc. (GHCR)</strong> (registro de imágenes Docker) — EE.UU.
        </li>
        <li>
          <strong>Agencia Tributaria</strong> — destinatario obligatorio de los datos
          fiscales (Veri*Factu). No es encargado, sino tercero por imposición legal.
        </li>
      </ul>

      <h2>6. Transferencias internacionales</h2>
      <p>
        Algunos encargados (Clerk, Stripe, GitHub) están establecidos en EE.UU. Las
        transferencias se cubren con cláusulas contractuales tipo y, cuando aplica,
        certificación EU-US Data Privacy Framework. ((REVISAR_ANUALMENTE))
      </p>

      <h2>7. Derechos del interesado</h2>
      <p>
        Puedes ejercer tus derechos de acceso, rectificación, supresión, limitación,
        oposición y portabilidad escribiendo a <strong>((EMAIL_PRIVACIDAD))</strong>,
        adjuntando copia del DNI o documento equivalente. Si consideras que el
        tratamiento no se ajusta a la normativa, puedes presentar una reclamación ante
        la Agencia Española de Protección de Datos (
        <a href="https://www.aepd.es" target="_blank" rel="noreferrer">
          aepd.es
        </a>
        ).
      </p>

      <h2>8. Medidas de seguridad</h2>
      <ul>
        <li>Cifrado en tránsito (TLS 1.2+) y en reposo (AES-256-GCM para certificados
          digitales y claves API).</li>
        <li>Control de acceso por API key con SHA-256 hash y scopes mínimos.</li>
        <li>Backups diarios con retención escalonada y restore probado.</li>
        <li>Auditoría de accesos (audit_log) sobre operaciones sensibles.</li>
      </ul>

      <h2>9. Cookies</h2>
      <p>
        SimpleFactu utiliza únicamente cookies técnicas necesarias para mantener la
        sesión (Clerk) y procesar el pago (Stripe). No utiliza cookies de analítica ni
        publicitarias. Por ello no requiere banner de consentimiento conforme al art.
        22.2 LSSI.
      </p>

      <hr />
      <p className="text-xs text-gray-500">
        Este documento es un esqueleto. El abogado debe confirmar en particular: (a)
        plazos de conservación efectivos para los datos fiscales según la actividad
        concreta, (b) lista actualizada de subencargados, (c) si la legislación de
        algún país no UE de tus clientes exige información adicional.
      </p>
    </>
  );
}
