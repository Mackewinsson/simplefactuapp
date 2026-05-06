/**
 * POLÍTICA DE COOKIES — esqueleto pendiente de revisión.
 *
 * Solo titulares y estructura de secciones por ahora. El contenido real se
 * añade cuando se decida si se incorporarán cookies de analítica o de
 * terceros. Hoy por hoy SimpleFactu solo usa cookies técnicas (Clerk + Stripe)
 * que no requieren consentimiento bajo el art. 22.2 LSSI.
 */

export const metadata = { title: "Política de cookies — SimpleFactu" };

export default function CookiesPolicyPage() {
  return (
    <>
      <h1>Política de cookies</h1>
      <p className="text-sm text-gray-500">Última actualización: ((FECHA_REVISION))</p>

      <p>
        <em>Documento pendiente de revisión.</em>
      </p>

      <h2>1. ¿Qué es una cookie?</h2>
      <h2>2. Cookies utilizadas por SimpleFactu</h2>
      <h2>3. Gestión y desactivación</h2>
      <h2>4. Cookies de terceros</h2>
      <h2>5. Cambios en esta política</h2>
      <h2>6. Contacto</h2>
    </>
  );
}
