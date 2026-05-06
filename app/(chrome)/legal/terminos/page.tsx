/**
 * TÉRMINOS Y CONDICIONES — esqueleto editable
 *
 * Borrador opinionado para una API/SaaS de facturación que actúa como
 * intermediario con AEAT. El abogado debe revisar, ajustar a tu producto y
 * eliminar/añadir cláusulas según la legislación aplicable.
 */

export const metadata = { title: "Términos y condiciones — SimpleFactu" };

export default function TermsPage() {
  return (
    <>
      <h1>Términos y condiciones</h1>
      <p className="text-sm text-gray-500">Última actualización: ((FECHA_REVISION))</p>

      <h2>1. Definiciones</h2>
      <ul>
        <li>
          <strong>Servicio:</strong> SimpleFactu, plataforma web de emisión de facturas
          conforme al sistema Veri*Factu de AEAT.
        </li>
        <li>
          <strong>Titular:</strong> ((RAZÓN_SOCIAL)), NIF ((NIF_TITULAR)).
        </li>
        <li>
          <strong>Usuario:</strong> persona física o jurídica que se registra y utiliza
          el Servicio.
        </li>
        <li>
          <strong>Cliente final:</strong> destinatario de las facturas emitidas por el
          Usuario a través del Servicio.
        </li>
      </ul>

      <h2>2. Aceptación</h2>
      <p>
        El registro en el Servicio implica la aceptación íntegra de estos Términos y de
        la <a href="/legal/privacidad">Política de privacidad</a>. Si no aceptas, no
        debes utilizar el Servicio.
      </p>

      <h2>3. Descripción del servicio</h2>
      <p>
        El Titular pone a disposición del Usuario una plataforma web y una API para
        registrar facturas en el sistema Veri*Factu de AEAT. El Usuario es el emisor
        legal de la factura; el Titular actúa como mero intermediario técnico.
      </p>

      <h2>4. Obligaciones del Usuario</h2>
      <ul>
        <li>Suministrar datos veraces y mantenerlos actualizados.</li>
        <li>Subir un certificado digital válido y vigente, emitido a su nombre o a nombre
          de la entidad jurídica que representa con poderes suficientes.</li>
        <li>Verificar la exactitud de los datos fiscales antes de enviarlos.</li>
        <li>No utilizar el Servicio con fines fraudulentos, contrarios al orden público
          o que infrinjan derechos de terceros.</li>
        <li>Custodiar las credenciales de acceso. Cualquier uso desde su cuenta se
          presume realizado por el Usuario.</li>
      </ul>

      <h2>5. Suscripción y pago</h2>
      <p>
        El Servicio se ofrece con un plan gratuito limitado y planes de pago mensual
        gestionados a través de Stripe Payments Europe Ltd. La cuota se cobra por
        adelantado el día del alta y se renueva automáticamente cada mes salvo
        cancelación.
      </p>
      <p>
        El Usuario puede cancelar la suscripción en cualquier momento desde el portal de
        cliente de Stripe; la cancelación tendrá efecto al final del periodo facturado.
      </p>

      <h2>6. Disponibilidad y mantenimiento</h2>
      <p>
        El Titular hará esfuerzos razonables para mantener el Servicio disponible
        24x7, pero no garantiza una disponibilidad ininterrumpida. Podrán realizarse
        ventanas de mantenimiento programadas con aviso previo razonable.
      </p>

      <h2>7. Limitación de responsabilidad</h2>
      <p>
        La responsabilidad del Titular se limita en todo caso al precio efectivamente
        abonado por el Usuario en los 12 meses anteriores al evento que motiva la
        reclamación. <strong>El Titular no responde de:</strong>
      </p>
      <ul>
        <li>Sanciones, recargos o intereses impuestos por AEAT al Usuario derivados de
          datos fiscales incorrectos suministrados por éste.</li>
        <li>Indisponibilidades del propio servicio Veri*Factu de AEAT.</li>
        <li>Daños indirectos, lucro cesante o pérdida de oportunidad.</li>
        <li>Mal uso del certificado digital por parte del Usuario.</li>
      </ul>
      <p>
        Esta limitación no aplica a los supuestos de dolo, negligencia grave o aquellos
        que la legislación imperativa no permita limitar.
      </p>

      <h2>8. Propiedad intelectual</h2>
      <p>
        El Titular conserva todos los derechos sobre el software, marca y elementos del
        Servicio. El Usuario obtiene únicamente una licencia limitada, no exclusiva e
        intransferible para utilizar el Servicio durante la vigencia de la suscripción.
      </p>

      <h2>9. Tratamiento de datos</h2>
      <p>
        Cuando el Titular trate datos personales por cuenta del Usuario (datos de los
        clientes finales del Usuario), se aplica el{" "}
        <a href="/legal/dpa">Contrato de encargado de tratamiento (DPA)</a>, que forma
        parte indisociable de estos Términos.
      </p>

      <h2>10. Suspensión y baja</h2>
      <ul>
        <li>El Titular podrá suspender el Servicio si el Usuario incumple gravemente
          estos Términos, mediante aviso razonado.</li>
        <li>Stripe puede suspender automáticamente la cuenta por impago tras los
          intentos de cobro estándar; reactivable actualizando el método de pago.</li>
        <li>Tras la baja, el Titular conservará los datos durante los plazos indicados
          en la <a href="/legal/privacidad">Política de privacidad</a> y los pondrá a
          disposición del Usuario para su exportación durante 30 días naturales.</li>
      </ul>

      <h2>11. Modificaciones</h2>
      <p>
        El Titular podrá modificar estos Términos. Los cambios sustanciales serán
        notificados con al menos 30 días de antelación al email registrado del Usuario.
        Si el Usuario no acepta, podrá cancelar la suscripción sin penalización.
      </p>

      <h2>12. Legislación y jurisdicción</h2>
      <p>
        Estos Términos se rigen por la legislación española. Las partes se someten,
        salvo fuero irrenunciable, a los Juzgados y Tribunales de
        ((CIUDAD_JURISDICCIÓN)).
      </p>

      <hr />
      <p className="text-xs text-gray-500">
        Borrador para revisión legal. Confirmar especialmente la cláusula 7
        (Limitación de responsabilidad) según la jurisdicción aplicable y revisar
        plazos de la cláusula 11.
      </p>
    </>
  );
}
