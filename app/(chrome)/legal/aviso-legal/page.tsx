/**
 * AVISO LEGAL — esqueleto editable
 *
 * Este documento debe estar revisado por un abogado o adaptado de una
 * plantilla certificada (iubenda, Termly, OCU, etc.) antes del lanzamiento.
 * Los marcadores ((( ... ))) son los datos que TÚ debes rellenar; no
 * inventamos ninguno.
 *
 * Base legal: Ley 34/2002, de 11 de julio, de servicios de la sociedad de la
 * información y de comercio electrónico (LSSI-CE), art. 10.
 */

export const metadata = { title: "Aviso legal — SimpleFactu" };

export default function AvisoLegalPage() {
  return (
    <>
      <h1>Aviso legal</h1>
      <p className="text-sm text-gray-500">Última actualización: ((FECHA_REVISION))</p>

      <h2>1. Identificación del titular</h2>
      <ul>
        <li>
          <strong>Denominación social:</strong> ((RAZÓN_SOCIAL))
        </li>
        <li>
          <strong>NIF / CIF:</strong> ((NIF_TITULAR))
        </li>
        <li>
          <strong>Domicilio social:</strong> ((DIRECCIÓN_POSTAL))
        </li>
        <li>
          <strong>Email de contacto:</strong> ((EMAIL_CONTACTO))
        </li>
        <li>
          <strong>Teléfono:</strong> ((TELÉFONO_OPCIONAL))
        </li>
        <li>
          <strong>Datos registrales:</strong> ((REGISTRO_MERCANTIL_TOMO_FOLIO_HOJA_INSCRIPCIÓN))
        </li>
      </ul>

      <h2>2. Objeto del sitio</h2>
      <p>
        SimpleFactu es una herramienta web para emitir facturas conforme al sistema
        Veri*Factu de la Agencia Estatal de Administración Tributaria (AEAT) regulado
        por el Real Decreto 1007/2023 y la Orden HAC/1177/2024. El servicio actúa como
        intermediario técnico entre el sistema de facturación del usuario y los servicios
        SOAP de Veri*Factu de la AEAT.
      </p>

      <h2>3. Condiciones de acceso</h2>
      <p>
        El acceso a SimpleFactu es libre y gratuito. La utilización de las funcionalidades
        de envío a AEAT requiere registro y la aceptación de los{" "}
        <a href="/legal/terminos">Términos y condiciones</a>. El usuario se compromete a
        utilizar la plataforma conforme a la legislación vigente, la moral, las buenas
        costumbres y el orden público.
      </p>

      <h2>4. Propiedad intelectual e industrial</h2>
      <p>
        Todos los elementos del sitio (textos, código, diseño, imágenes, marcas, logos)
        son titularidad de ((RAZÓN_SOCIAL)) o de terceros que han autorizado su uso. Su
        reproducción, distribución o modificación sin autorización escrita está prohibida.
      </p>

      <h2>5. Limitación de responsabilidad</h2>
      <p>
        ((RAZÓN_SOCIAL)) realiza esfuerzos razonables para que la información publicada
        sea exacta y esté actualizada, pero no garantiza la disponibilidad continua del
        servicio ni la ausencia total de errores. El usuario es el responsable último de
        la exactitud de los datos fiscales que envía a través de la plataforma a AEAT.
      </p>

      <h2>6. Enlaces a terceros</h2>
      <p>
        El sitio puede contener enlaces a recursos externos (sede AEAT, Stripe, Clerk).
        ((RAZÓN_SOCIAL)) no es responsable de los contenidos ni de las políticas de
        privacidad de dichos sitios.
      </p>

      <h2>7. Legislación aplicable y jurisdicción</h2>
      <p>
        Este aviso legal se rige por la legislación española. Para cualquier controversia
        las partes se someten a los Juzgados y Tribunales de ((CIUDAD_JURISDICCIÓN)),
        salvo que la legislación aplicable establezca un fuero distinto irrenunciable.
      </p>

      <hr />
      <p className="text-xs text-gray-500">
        Este documento es un esqueleto y debe ser revisado por un asesor legal antes de
        publicarse en producción. Los marcadores con doble paréntesis señalan los campos
        que necesitan datos reales del titular del servicio.
      </p>
    </>
  );
}
