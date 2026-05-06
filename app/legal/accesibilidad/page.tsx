/**
 * DECLARACIÓN DE ACCESIBILIDAD — esqueleto pendiente de revisión.
 *
 * Estructura conforme al RD 1112/2018 y a la WAD (Web Accessibility
 * Directive 2016/2102) que aplica a sectores específicos. Para SaaS
 * privados B2B la WAD no es obligatoria, pero declarar la adecuación
 * es buena práctica y suma puntos en RFP de sector público.
 */

export const metadata = { title: "Declaración de accesibilidad — SimpleFactu" };

export default function AccessibilityStatementPage() {
  return (
    <>
      <h1>Declaración de accesibilidad</h1>
      <p className="text-sm text-gray-500">Última actualización: ((FECHA_REVISION))</p>

      <p>
        <em>Documento pendiente de revisión.</em>
      </p>

      <h2>1. Estado de cumplimiento (WCAG 2.1 nivel AA)</h2>
      <h2>2. Contenidos no accesibles conocidos</h2>
      <h2>3. Métodos de evaluación</h2>
      <h2>4. Mecanismo de comunicación y solicitud de información</h2>
      <h2>5. Procedimiento de aplicación</h2>
      <h2>6. Compatibilidad con productos de apoyo</h2>
    </>
  );
}
