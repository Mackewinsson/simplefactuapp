import { APP_DISPLAY_NAME, appDocumentTitle } from "@/lib/branding";

export const metadata = { title: appDocumentTitle("Aviso legal") };

export default function AvisoLegalPage() {
  return (
    <>
      <h1>Aviso legal</h1>
      <p className="text-sm text-fg-subtle">Última actualización: 19 de mayo de 2026</p>

      <h2>1. Identificación del titular</h2>
      <ul>
        <li>
          <strong>Titular:</strong> Mackewinsson Palencia
        </li>
        <li>
          <strong>NIF:</strong> Z0706098A
        </li>
        <li>
          <strong>Domicilio:</strong> Calle Alta de San Mateo 7, Málaga, España
        </li>
        <li>
          <strong>Email de contacto:</strong>{" "}
          <a href="mailto:soporte@simplefactu.com">soporte@simplefactu.com</a>
        </li>
      </ul>

      <h2>2. Objeto del sitio</h2>
      <p>
        {APP_DISPLAY_NAME} es una plataforma web y API para emitir facturas
        conforme al sistema Veri*Factu de la Agencia Estatal de Administración
        Tributaria (AEAT), regulado por el Real Decreto 1007/2023 y la Orden
        HAC/1177/2024. El servicio actúa como intermediario técnico entre el
        sistema de facturación del usuario y los servicios SOAP de Veri*Factu
        de la AEAT.
      </p>

      <h2>3. Condiciones de acceso</h2>
      <p>
        El acceso a {APP_DISPLAY_NAME} es libre y gratuito. La utilización de
        las funcionalidades de envío a AEAT requiere registro y la aceptación
        de los <a href="/legal/terminos">Términos y condiciones</a>. El usuario
        se compromete a utilizar la plataforma conforme a la legislación
        vigente, la moral, las buenas costumbres y el orden público.
      </p>

      <h2>4. Propiedad intelectual e industrial</h2>
      <p>
        Todos los elementos del sitio (textos, código, diseño, imágenes,
        marcas, logos) son titularidad de Mackewinsson Palencia o de terceros
        que han autorizado su uso. Su reproducción, distribución o modificación
        sin autorización escrita está prohibida.
      </p>

      <h2>5. Limitación de responsabilidad</h2>
      <p>
        Mackewinsson Palencia realiza esfuerzos razonables para que la
        información publicada sea exacta y esté actualizada, pero no garantiza
        la disponibilidad continua del servicio ni la ausencia total de errores.
        El usuario es el responsable último de la exactitud de los datos
        fiscales que envía a través de la plataforma a AEAT.
      </p>

      <h2>6. Enlaces a terceros</h2>
      <p>
        El sitio puede contener enlaces a recursos externos (sede AEAT, Stripe,
        Clerk). Mackewinsson Palencia no es responsable de los contenidos ni de
        las políticas de privacidad de dichos sitios.
      </p>

      <h2>7. Legislación aplicable y jurisdicción</h2>
      <p>
        Este aviso legal se rige por la legislación española. Para cualquier
        controversia las partes se someten a los Juzgados y Tribunales de
        Málaga, salvo que la legislación aplicable establezca un fuero distinto
        irrenunciable.
      </p>
    </>
  );
}
