/**
 * CONDICIONES DE CANCELACIÓN Y REEMBOLSO — esqueleto pendiente de revisión.
 *
 * Necesario por el art. 97 TR-LGDCU para servicios de pago a consumidores.
 * Estructura mínima: derecho de desistimiento (14 días para consumidores
 * en B2C), política de reembolso, cómo cancelar la suscripción, cuándo no
 * aplica el desistimiento (servicios ya consumidos).
 */

export const metadata = { title: "Cancelación y reembolso — SimpleFactu" };

export default function CancellationPolicyPage() {
  return (
    <>
      <h1>Condiciones de cancelación y reembolso</h1>
      <p className="text-sm text-gray-500">Última actualización: ((FECHA_REVISION))</p>

      <p>
        <em>Documento pendiente de revisión.</em>
      </p>

      <h2>1. Derecho de desistimiento</h2>
      <h2>2. Cómo cancelar tu suscripción</h2>
      <h2>3. Política de reembolso</h2>
      <h2>4. Excepciones al derecho de desistimiento</h2>
      <h2>5. Periodo de gracia tras cancelación</h2>
      <h2>6. Conservación y exportación de tus datos</h2>
      <h2>7. Contacto</h2>
    </>
  );
}
