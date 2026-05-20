/**
 * Declaración Responsable del Fabricante de Sistema Informático de Facturación
 * Artículo 15 — Orden HAC/1177/2024, de 17 de octubre
 * Real Decreto 1007/2023, de 5 de diciembre
 */

import { appDocumentTitle } from "@/lib/branding";

export const metadata = {
  title: appDocumentTitle("Declaración responsable Veri*Factu"),
};

export default function DeclaracionResponsablePage() {
  return (
    <>
      <h1>Declaración responsable del fabricante</h1>
      <p className="text-sm text-fg-subtle">
        En cumplimiento del artículo 15 de la Orden HAC/1177/2024, de 17 de
        octubre, y del Real Decreto 1007/2023, de 5 de diciembre.
      </p>

      <hr />

      <h2>1. Información del sistema informático</h2>

      <h3>1.a) Nombre del sistema informático</h3>
      <p>Simple*Factu API</p>

      <h3>1.b) Código identificador del sistema informático</h3>
      <p>SF</p>

      <h3>1.c) Versión del sistema informático</h3>
      <p>1.0.0</p>

      <h3>1.d) Descripción del sistema informático y sus funcionalidades</h3>
      <p>
        Simple*Factu API es una interfaz de programación de aplicaciones (API)
        SaaS diseñada para operar en la nube, accesible mediante peticiones HTTP
        estándar desde cualquier sistema de facturación. No requiere instalación
        local; toda la infraestructura está alojada en servidores seguros
        gestionados directamente por el fabricante. El acceso se realiza
        mediante claves de API personalizadas, lo que garantiza un entorno
        seguro y controlado.
      </p>
      <p>
        El sistema permite gestionar varios obligados tributarios de forma
        independiente (arquitectura multi-tenant), asegurando que cada uno
        cumpla individualmente con los requisitos normativos.
      </p>
      <p>Entre sus funcionalidades principales se encuentran:</p>
      <ul>
        <li>
          Recepción de registros de facturación de alta y anulación en formato
          JSON, con validación técnica y de negocio conforme al esquema
          Veri*Factu.
        </li>
        <li>
          Construcción del mensaje XML SOAP conforme al esquema oficial
          SuministroInformacion.xsd publicado por la AEAT.
        </li>
        <li>
          Gestión del encadenamiento de huellas SHA-256 por cadena de
          emisor/serie/número de instalación, garantizando la trazabilidad e
          inalterabilidad de los registros.
        </li>
        <li>
          Remisión autenticada mediante conexión mTLS (certificado PKCS#12 del
          obligado tributario) al servicio electrónico de la Agencia Estatal de
          Administración Tributaria.
        </li>
        <li>
          Persistencia inmutable del ledger de facturas registradas (registros
          de alta y anulación), con acceso de consulta pero sin posibilidad de
          modificación ni borrado a nivel de aplicación.
        </li>
        <li>
          Registro de eventos del sistema en una cadena de huellas propia, para
          garantizar la auditoría e integridad del historial de operaciones.
        </li>
      </ul>

      <h3>
        1.e) Indicación de si el sistema funciona exclusivamente como
        VERI*FACTU
      </h3>
      <p>
        <strong>S — Sí.</strong> El sistema está diseñado para funcionar
        exclusivamente en la modalidad Veri*Factu, remitiendo los registros de
        facturación a la Agencia Estatal de Administración Tributaria en el
        momento de su generación.
      </p>

      <h3>
        1.f) Indicación de si el sistema permite ser usado por varios obligados
        tributarios
      </h3>
      <p>
        <strong>S — Sí.</strong> El sistema está diseñado para dar soporte a la
        facturación de múltiples obligados tributarios de forma independiente
        (arquitectura multi-tenant).
      </p>

      <h3>
        1.g) Tipos de firma utilizados para los registros de facturación
      </h3>
      <p>
        No aplica. Al tratarse de un sistema que opera exclusivamente en la
        modalidad Veri*Factu, los registros de facturación no se firman
        electrónicamente de forma expresa. La normativa considera que quedan
        autenticados mediante la remisión correcta a los servicios electrónicos
        de la Agencia Tributaria con el certificado electrónico cualificado del
        obligado tributario a través de conexión mTLS.
      </p>

      <h3>
        1.h) Razón social de la entidad productora del sistema informático
      </h3>
      <p>Mackewinsson Palencia</p>

      <h3>
        1.i) Número de Identificación Fiscal (NIF) de la entidad productora
      </h3>
      <p>Z0706098A</p>

      <h3>
        1.j) Dirección postal completa de contacto de la entidad productora
      </h3>
      <p>Calle Alta de San Mateo 7, Málaga, España</p>

      <h3>1.k) Declaración de cumplimiento normativo</h3>
      <p>
        La entidad productora del sistema informático descrito en esta
        declaración hace constar que dicho sistema, en la versión indicada en
        ella, cumple con lo dispuesto en el artículo 29.2.j) de la Ley
        58/2003, de 17 de diciembre, General Tributaria; en el Reglamento que
        establece los requisitos que deben adoptar los sistemas y programas
        informáticos o electrónicos que soporten los procesos de facturación de
        empresarios y profesionales, y la estandarización de formatos de los
        registros de facturación, aprobado por el Real Decreto 1007/2023, de 5
        de diciembre; en la Orden HAC/1177/2024, de 17 de octubre; y en la sede
        electrónica de la Agencia Estatal de Administración Tributaria para todo
        aquello que complete las especificaciones de dicha orden.
      </p>

      <h3>
        1.l) Fecha y lugar de suscripción de esta declaración responsable
      </h3>
      <p>19 de mayo de 2026, Málaga, España.</p>

      <hr />

      <h2>2. Información adicional</h2>

      <h3>2.a) Otras formas de contacto con la entidad productora</h3>
      <p>
        Email:{" "}
        <a href="mailto:soporte@simplefactu.com">soporte@simplefactu.com</a>
      </p>

      <h3>
        2.b) Dirección de internet de la entidad productora del sistema
        informático
      </h3>
      <p>
        <a
          href="https://simplefactu.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://simplefactu.com
        </a>
      </p>

      <h3>
        2.c) Cumplimiento de las especificaciones técnicas y funcionales de la
        Orden HAC/1177/2024
      </h3>
      <p>
        El sistema cumple las especificaciones técnicas y funcionales de la
        Orden HAC/1177/2024 y de la sede electrónica de la AEAT de la siguiente
        manera:
      </p>
      <ul>
        <li>
          <strong>Integridad e inalterabilidad:</strong> El sistema implementa
          una cadena de huellas SHA-256 en la que cada registro de facturación
          incluye la huella del registro inmediatamente anterior, formando una
          cadena criptográficamente verificable. Cualquier manipulación de un
          registro rompe la cadena y es detectada automáticamente.
        </li>
        <li>
          <strong>Ledger append-only:</strong> Los registros de facturación
          (altas y anulaciones) se persisten en una tabla de base de datos cuya
          capa de aplicación no expone operaciones de modificación ni borrado.
          Las correcciones se modelan emitiendo nuevas facturas rectificativas
          (tipos R1–R5), conforme al reglamento.
        </li>
        <li>
          <strong>Trazabilidad y conservación:</strong> El sistema registra y
          conserva la huella de cada registro enviado a la AEAT, el timestamp de
          generación, el número de instalación, el CSV devuelto por la AEAT, y
          la respuesta SOAP completa, vinculando cada registro a su posición en
          la cadena.
        </li>
        <li>
          <strong>Validación previa al envío:</strong> Antes de la remisión, el
          sistema valida los datos conforme al esquema XSD oficial, aplica las
          reglas de negocio del RD 1007/2023 y rechaza los registros que no
          cumplan los requisitos (coherencia de desglose, encadenamiento,
          rectificativas, etc.).
        </li>
        <li>
          <strong>Remisión segura a la Administración Tributaria:</strong> El
          sistema establece una conexión mTLS con el endpoint SOAP de la AEAT
          utilizando el certificado electrónico cualificado del obligado
          tributario, garantizando la autenticidad e integridad de la
          comunicación.
        </li>
        <li>
          <strong>Registro de eventos del SIF:</strong> El sistema mantiene una
          cadena de eventos con su propia secuencia de huellas (CHAIN_BREAK,
          INVALID_HASH, RECORD_REGISTERED, etc.) que permite auditar el
          historial de operaciones e integridad del sistema.
        </li>
        <li>
          <strong>Seguridad de los certificados:</strong> Los certificados
          digitales de los obligados tributarios se almacenan cifrados con
          AES-256-GCM y nunca se exponen en texto claro por ningún endpoint del
          sistema.
        </li>
      </ul>
    </>
  );
}
