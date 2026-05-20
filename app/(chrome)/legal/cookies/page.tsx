import { APP_DISPLAY_NAME, appDocumentTitle } from "@/lib/branding";

export const metadata = { title: appDocumentTitle("Política de cookies") };

export default function CookiesPolicyPage() {
  return (
    <>
      <h1>Política de cookies</h1>
      <p className="text-sm text-fg-subtle">Última actualización: 19 de mayo de 2026</p>

      <h2>1. ¿Qué es una cookie?</h2>
      <p>
        Una cookie es un pequeño fichero de texto que un sitio web almacena en
        tu navegador cuando lo visitas. Las cookies permiten que el sitio
        recuerde tus preferencias o mantenga activa tu sesión entre páginas.
      </p>

      <h2>2. Cookies utilizadas por {APP_DISPLAY_NAME}</h2>
      <p>
        {APP_DISPLAY_NAME} utiliza exclusivamente{" "}
        <strong>cookies técnicas estrictamente necesarias</strong>:
      </p>
      <table>
        <thead>
          <tr>
            <th>Cookie</th>
            <th>Proveedor</th>
            <th>Finalidad</th>
            <th>Duración</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>__session</code> y similares de Clerk
            </td>
            <td>Clerk Inc.</td>
            <td>Mantener la sesión autenticada del usuario.</td>
            <td>Sesión / 1 año</td>
          </tr>
          <tr>
            <td>Cookies de Stripe</td>
            <td>Stripe Payments Europe Ltd.</td>
            <td>
              Procesamiento seguro del pago y prevención del fraude.
            </td>
            <td>Sesión</td>
          </tr>
        </tbody>
      </table>
      <p>
        No utilizamos cookies de analítica, publicidad, seguimiento entre
        sitios ni de ninguna otra naturaleza que no sea estrictamente
        necesaria para el funcionamiento del Servicio.
      </p>

      <h2>3. ¿Necesito dar consentimiento?</h2>
      <p>
        No. Las cookies técnicas necesarias están exentas del requisito de
        consentimiento conforme al artículo 22.2 de la Ley 34/2002 (LSSI-CE)
        y las directrices de la AEPD. Por este motivo {APP_DISPLAY_NAME} no
        muestra ningún banner de cookies.
      </p>

      <h2>4. Gestión y desactivación</h2>
      <p>
        Puedes configurar tu navegador para rechazar o eliminar las cookies.
        Ten en cuenta que si bloqueas las cookies técnicas el Servicio no
        funcionará correctamente (no podrás iniciar sesión ni procesar pagos).
      </p>
      <p>
        Instrucciones para los principales navegadores:{" "}
        <a
          href="https://support.google.com/chrome/answer/95647"
          target="_blank"
          rel="noreferrer"
        >
          Chrome
        </a>
        {" · "}
        <a
          href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias"
          target="_blank"
          rel="noreferrer"
        >
          Firefox
        </a>
        {" · "}
        <a
          href="https://support.apple.com/es-es/guide/safari/sfri11471/mac"
          target="_blank"
          rel="noreferrer"
        >
          Safari
        </a>
        .
      </p>

      <h2>5. Cambios en esta política</h2>
      <p>
        Si en el futuro se incorporaran cookies de analítica u otro tipo, se
        actualizará esta política y se implementará el mecanismo de
        consentimiento correspondiente con antelación.
      </p>

      <h2>6. Contacto</h2>
      <p>
        Para cualquier consulta sobre esta política:{" "}
        <a href="mailto:privacidad@simplefactu.com">
          privacidad@simplefactu.com
        </a>
        .
      </p>
    </>
  );
}
