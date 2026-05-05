/**
 * DPA — Contrato de encargado de tratamiento (art. 28 RGPD)
 *
 * Esqueleto editable. La versión publicada debe estar revisada por un
 * abogado especializado en protección de datos. El DPA es de aceptación
 * obligatoria al registrarse: el Usuario, como responsable de los datos
 * personales de sus clientes finales (NIFs, importes, etc.), encarga el
 * tratamiento técnico al Titular.
 */

export const metadata = { title: "DPA — Encargado de tratamiento" };

export default function DpaPage() {
  return (
    <>
      <h1>Contrato de encargado de tratamiento (DPA)</h1>
      <p className="text-sm text-gray-500">Última actualización: ((FECHA_REVISION))</p>

      <p>
        Este documento se firma electrónicamente al aceptar los{" "}
        <a href="/legal/terminos">Términos y condiciones</a> del Servicio. Su objeto es
        regular el tratamiento de datos personales que el Titular realiza por cuenta
        del Usuario (responsable del tratamiento) en el marco del Servicio.
      </p>

      <h2>1. Partes</h2>
      <ul>
        <li>
          <strong>Responsable del tratamiento:</strong> el Usuario que se registra en
          el Servicio.
        </li>
        <li>
          <strong>Encargado del tratamiento:</strong> ((RAZÓN_SOCIAL)), NIF
          ((NIF_TITULAR)), domicilio en ((DIRECCIÓN_POSTAL)).
        </li>
      </ul>

      <h2>2. Objeto del tratamiento</h2>
      <p>
        Procesar los datos fiscales y personales que el Responsable introduce en el
        Servicio para la emisión de facturas conforme al sistema Veri*Factu de AEAT.
      </p>

      <h2>3. Categorías de datos e interesados</h2>
      <ul>
        <li>
          <strong>Datos identificativos:</strong> nombre o razón social, NIF, dirección,
          email.
        </li>
        <li>
          <strong>Datos económicos:</strong> importes, conceptos, base imponible, cuotas
          de IVA, números de factura.
        </li>
        <li>
          <strong>Interesados:</strong> clientes finales del Responsable (personas
          físicas o jurídicas a quienes éste emite facturas).
        </li>
      </ul>

      <h2>4. Duración</h2>
      <p>
        Mientras el Responsable mantenga una suscripción activa al Servicio. Tras la
        baja, los datos se conservan durante los plazos legales aplicables y, una vez
        agotados, se eliminan o anonimizan.
      </p>

      <h2>5. Obligaciones del Encargado</h2>
      <ul>
        <li>Tratar los datos siguiendo únicamente las instrucciones documentadas del
          Responsable, incluidas las contenidas en estos Términos y en la
          configuración del Servicio.</li>
        <li>Garantizar el deber de confidencialidad del personal autorizado.</li>
        <li>Aplicar medidas técnicas y organizativas apropiadas (cifrado en tránsito y
          en reposo, control de acceso por scopes, backups, audit log).</li>
        <li>Notificar al Responsable, sin dilación indebida y en todo caso antes de
          72 horas, cualquier brecha de seguridad que afecte a sus datos, indicando
          naturaleza, datos afectados, consecuencias y medidas adoptadas.</li>
        <li>Asistir al Responsable en la atención de derechos de los interesados.</li>
        <li>Devolver o suprimir los datos al término del Servicio, conforme a la
          elección del Responsable, salvo obligación legal de conservación.</li>
        <li>Mantener un registro de actividades del tratamiento.</li>
        <li>Demostrar el cumplimiento de las obligaciones del art. 28 RGPD a
          requerimiento razonable del Responsable.</li>
      </ul>

      <h2>6. Subencargados (subprocessors)</h2>
      <p>
        El Responsable autoriza expresamente al Encargado a recurrir a los siguientes
        subencargados:
      </p>
      <ul>
        <li>
          <strong>Hetzner Online GmbH</strong> — alojamiento de la infraestructura,
          Alemania.
        </li>
        <li>
          <strong>Stripe Payments Europe Ltd.</strong> — tratamiento de pagos.
        </li>
        <li>
          <strong>Clerk Inc.</strong> — autenticación de usuarios, EE.UU. (cláusulas
          contractuales tipo + EU-US DPF).
        </li>
        <li>
          <strong>GitHub Inc. (GHCR)</strong> — registro de imágenes Docker, EE.UU.
        </li>
      </ul>
      <p>
        El Encargado notificará al Responsable cualquier alta o sustitución de
        subencargados con al menos 30 días de antelación, dándole derecho a
        oponerse y, en su caso, terminar el contrato.
      </p>

      <h2>7. Transferencias internacionales</h2>
      <p>
        Cuando un subencargado esté establecido fuera del Espacio Económico Europeo,
        el Encargado garantiza que la transferencia se ampara en cláusulas
        contractuales tipo aprobadas por la Comisión Europea o en mecanismos
        equivalentes.
      </p>

      <h2>8. Auditoría</h2>
      <p>
        El Responsable podrá auditar el cumplimiento del DPA con un preaviso razonable
        (mínimo 30 días naturales), a través de un tercero independiente y firmando
        acuerdo de confidencialidad. La auditoría se limitará a lo estrictamente
        necesario.
      </p>

      <h2>9. Responsabilidades</h2>
      <p>
        Cada parte responde de los daños que cause por incumplimiento del RGPD
        conforme al art. 82 RGPD. La responsabilidad del Encargado se rige
        adicionalmente por las limitaciones de los{" "}
        <a href="/legal/terminos">Términos y condiciones</a>.
      </p>

      <hr />
      <p className="text-xs text-gray-500">
        Esqueleto para revisión legal. Confirmar lista actualizada de subencargados,
        plazos de notificación y ventanas de auditoría según el modelo comercial.
      </p>
    </>
  );
}
