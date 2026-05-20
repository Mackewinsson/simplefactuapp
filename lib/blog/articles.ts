export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  date: string; // ISO YYYY-MM-DD
  readingMinutes: number;
  tags: string[];
  seoDescription: string;
  content: string; // HTML string
}

export const articles: Article[] = [
  {
    slug: "que-es-verifactu-guia-autonomos-2026",
    title: "Qué es Veri*Factu: guía completa para autónomos y pymes (2026)",
    excerpt:
      "El sistema Veri*Factu de la AEAT obliga a los programas de facturación a enviar cada registro en tiempo real. Te explicamos qué significa, quién está obligado y cómo afecta a tu día a día.",
    date: "2026-05-15",
    readingMinutes: 6,
    tags: ["verifactu", "autonomos", "facturacion-electronica"],
    seoDescription:
      "Guía completa sobre Veri*Factu 2026: qué es, quién está obligado, plazos y cómo cumplir con el RD 1007/2023 y la OM HAC/1177/2024 desde tu programa de facturación.",
    content: `
<h2>¿Qué es Veri*Factu?</h2>
<p>
  Veri*Factu es el sistema de remisión voluntaria de registros de facturación a la Agencia Estatal de Administración Tributaria (AEAT), regulado por el <strong>Real Decreto 1007/2023, de 5 de diciembre</strong>, y desarrollado técnicamente por la <strong>Orden HAC/1177/2024, de 17 de octubre</strong>.
</p>
<p>
  La idea es sencilla: cada vez que emites una factura, tu programa de facturación envía un registro firmado a los servidores de la AEAT en tiempo real. Ese registro incluye una <em>huella</em> (hash SHA-256) que encadena cada factura con la anterior, haciendo imposible modificar o eliminar facturas sin dejar rastro.
</p>

<h2>¿Por qué se llama así?</h2>
<p>
  El nombre viene de "verificación de facturación". El asterisco (*) es oficial: así aparece en todos los documentos de la AEAT. No es un error tipográfico.
</p>

<h2>¿Quién está obligado?</h2>
<p>
  Están obligados todos los empresarios y profesionales que deban llevar libros de registro de facturas emitidas conforme al artículo 62 del Reglamento del IVA, con estas excepciones principales:
</p>
<ul>
  <li>Los ya inscritos en el <strong>SII</strong> (Suministro Inmediato de Información) quedan excluidos, ya que tienen su propio sistema equivalente.</li>
  <li>Las grandes empresas con volumen de operaciones superior a 6 millones de euros anuales están incluidas en el SII, no en Veri*Factu.</li>
</ul>
<p>
  En la práctica, Veri*Factu afecta principalmente a <strong>autónomos, micropymes y pymes</strong> que no usan el SII.
</p>

<h2>¿Cuándo entra en vigor?</h2>
<p>
  La obligación entra en vigor en dos fases:
</p>
<ul>
  <li><strong>1 de julio de 2025:</strong> para fabricantes y comercializadores de software de facturación (deben adaptar sus programas).</li>
  <li><strong>1 de enero de 2026:</strong> para los obligados tributarios (autónomos y empresas) que usen esos programas.</li>
</ul>
<p>
  Dicho esto, puedes empezar a usar Veri*Factu antes de la fecha límite de forma voluntaria, lo que simplifica el cumplimiento y te protege ante posibles sanciones.
</p>

<h2>¿Qué ocurre si no cumplo?</h2>
<p>
  El incumplimiento puede conllevar sanciones económicas. Según el artículo 201 bis de la Ley General Tributaria (LGT), usar un sistema informático que no cumpla los requisitos puede suponer multas de <strong>hasta 50.000 € por ejercicio</strong>.
</p>

<h2>¿Cómo funciona técnicamente?</h2>
<ol>
  <li>Tu programa de facturación genera la factura y calcula una <strong>huella SHA-256</strong> que encadena los datos de la factura con la huella de la anterior.</li>
  <li>Envía un mensaje <strong>XML SOAP</strong> firmado mediante <strong>mTLS</strong> (con tu certificado digital FNMT) al endpoint de la AEAT.</li>
  <li>La AEAT devuelve un <strong>CSV</strong> (Código Seguro de Verificación) y un estado: <em>Correcto</em>, <em>ParcialmenteCorrecto</em> o <em>Incorrecto</em>.</li>
  <li>El CSV y un código QR aparecen en el PDF de la factura para que tu cliente pueda verificar la autenticidad en la sede electrónica de la AEAT.</li>
</ol>

<h2>¿Necesito un certificado digital?</h2>
<p>
  Sí. Para enviar facturas a través de Veri*Factu necesitas un <strong>certificado digital PKCS#12 (.pfx o .p12)</strong> emitido por la FNMT u otra entidad reconocida. Es el mismo certificado que usas para otros trámites con la AEAT.
</p>
<p>
  Simple*Factu almacena tu certificado cifrado con AES-256-GCM. Nunca sale del servidor en texto claro.
</p>

<h2>Resumen</h2>
<p>
  Veri*Factu es la respuesta de la AEAT a la facturación en negro y la manipulación de registros. Para la mayoría de autónomos y pymes, supone adaptar su programa de facturación antes del 1 de enero de 2026. El proceso es técnico pero, con la herramienta adecuada, transparente para el día a día del negocio.
</p>
    `.trim(),
  },
  {
    slug: "obligados-verifactu-quien-afecta-cuando",
    title: "¿Quién está obligado a Veri*Factu y desde cuándo?",
    excerpt:
      "No todos los empresarios se enfrentan a los mismos plazos. Descubre si estás en el SII, si eres REAGI, o si Veri*Factu te aplica directamente, y cuándo tienes que tenerlo operativo.",
    date: "2026-05-10",
    readingMinutes: 4,
    tags: ["verifactu", "obligados", "plazos"],
    seoDescription:
      "¿Estás obligado a Veri*Factu? Consulta los plazos del RD 1007/2023: autónomos, pymes, SII, REAGI y excepciones. Todo lo que necesitas saber antes del 1 de enero de 2026.",
    content: `
<h2>El mapa de obligados</h2>
<p>
  El Real Decreto 1007/2023 establece que están obligados a usar un sistema informático de facturación (SIF) conforme a Veri*Factu todos los empresarios y profesionales que soporten los procesos de facturación de sus actividades económicas. Sin embargo, hay importantes excepciones.
</p>

<h2>¿Estás en el SII? Entonces no te aplica Veri*Factu</h2>
<p>
  Si ya estás inscrito en el <strong>Suministro Inmediato de Información (SII)</strong> —obligatorio para empresas con volumen de operaciones superior a 6 millones de euros, grupos de IVA y grandes empresas—, tu sistema ya cumple una obligación equivalente y <strong>estás excluido de Veri*Factu</strong>.
</p>

<h2>Casos principales que SÍ están obligados</h2>
<ul>
  <li><strong>Autónomos en estimación directa</strong> (normal o simplificada) que emitan facturas.</li>
  <li><strong>Sociedades mercantiles</strong> (SL, SA) que no superen el umbral del SII.</li>
  <li><strong>Comunidades de bienes</strong> y otras entidades sin personalidad jurídica que realicen actividades económicas.</li>
  <li><strong>Profesionales liberales</strong>: abogados, arquitectos, médicos, consultores, etc.</li>
</ul>

<h2>Excepciones y casos especiales</h2>
<ul>
  <li><strong>Régimen de recargo de equivalencia</strong>: los minoristas en este régimen están obligados si emiten facturas a otros empresarios.</li>
  <li><strong>Régimen simplificado (módulos)</strong>: están obligados, aunque en la práctica emiten pocas facturas.</li>
  <li><strong>Actividades exentas de IVA sin obligación de facturar</strong>: como algunos arrendadores de inmuebles con exención, pueden quedar fuera si no emiten facturas.</li>
</ul>

<h2>Plazos concretos</h2>
<table>
  <thead>
    <tr><th>Sujeto</th><th>Fecha límite</th></tr>
  </thead>
  <tbody>
    <tr><td>Fabricantes de software de facturación</td><td>1 julio 2025</td></tr>
    <tr><td>Autónomos y pymes (no SII)</td><td>1 enero 2026</td></tr>
    <tr><td>Grandes empresas en SII</td><td>Ya obligadas (SII equivalente)</td></tr>
  </tbody>
</table>

<h2>¿Puedo empezar antes?</h2>
<p>
  Sí, y es recomendable. Empezar a usar Veri*Factu antes del 1 de enero de 2026 te permite detectar problemas con tu certificado digital, tu NIF o la configuración de tu programa de facturación sin la presión de la fecha límite.
</p>

<h2>¿Qué pasa si no tengo claro si estoy obligado?</h2>
<p>
  Consulta con tu asesor fiscal. La casuística es amplia y depende de tu régimen de IVA, el volumen de operaciones y el tipo de actividad. Como regla general, si emites facturas a otras empresas o profesionales y no estás en el SII, <strong>es muy probable que estés obligado</strong>.
</p>
    `.trim(),
  },
  {
    slug: "primera-factura-electronica-aeat-verifactu",
    title: "Cómo enviar tu primera factura electrónica a la AEAT con Veri*Factu",
    excerpt:
      "Paso a paso: desde obtener el certificado FNMT hasta ver el CSV en el PDF de tu factura. Sin tecnicismos innecesarios.",
    date: "2026-05-05",
    readingMinutes: 5,
    tags: ["verifactu", "tutorial", "facturacion-electronica", "fnmt"],
    seoDescription:
      "Tutorial paso a paso para enviar tu primera factura a la AEAT con Veri*Factu: certificado FNMT, configuración del software y verificación del CSV. Guía para autónomos.",
    content: `
<h2>Lo que necesitas antes de empezar</h2>
<ol>
  <li><strong>Certificado digital FNMT</strong> en formato .pfx o .p12. Si solo tienes el .cer, necesitas el .pfx que incluye la clave privada. Solicitarlo en <a href="https://www.sede.fnmt.gob.es" target="_blank" rel="noreferrer">sede.fnmt.gob.es</a>.</li>
  <li><strong>Contraseña del certificado</strong> que estableciste al exportarlo.</li>
  <li><strong>Tu NIF</strong>: debe coincidir exactamente con el del certificado. Extráelo con: <code>openssl pkcs12 -info -in certificado.p12 -passin pass:TU_PASS -noout</code></li>
  <li><strong>Cuenta en Simple*Factu</strong> (o en el programa de facturación que uses).</li>
</ol>

<h2>Paso 1: Sube tu certificado</h2>
<p>
  En <strong>Ajustes → Veri*Factu</strong>, sube tu archivo .pfx y la contraseña. El sistema lo almacena cifrado con AES-256-GCM; nunca se devuelve en texto claro por ningún endpoint.
</p>
<p>
  Si tu certificado es antiguo (FNMT anterior a 2023), puede usar el formato RC2-40-CBC que no es compatible con OpenSSL 3. En ese caso, conviértelo primero:
</p>
<pre><code>openssl pkcs12 -legacy -in antiguo.p12 -passin pass:PASS -nodes -out /tmp/cert.pem
openssl pkcs12 -export -in /tmp/cert.pem -out moderno.pfx -passout pass:PASS
rm /tmp/cert.pem</code></pre>

<h2>Paso 2: Crea la primera factura</h2>
<p>
  En <strong>Facturas → Nueva factura</strong>, rellena los datos del cliente (nombre y NIF) y las líneas de factura. Presta atención a:
</p>
<ul>
  <li><strong>Serie y número</strong>: el sistema genera automáticamente la serie de encadenamiento. Si cambias la serie, empezarás una nueva cadena (primerRegistro: true).</li>
  <li><strong>Descripción de la operación</strong>: es obligatoria. AEAT la registra; no uses textos genéricos.</li>
  <li><strong>IVA</strong>: selecciona el tipo correcto (21%, 10%, 4%, exento…).</li>
</ul>

<h2>Paso 3: Envía a Veri*Factu</h2>
<p>
  Haz clic en <strong>"Enviar a Veri*Factu"</strong>. El sistema crea un job asíncrono que:
</p>
<ol>
  <li>Valida el desglose IVA y el encadenamiento de huellas.</li>
  <li>Construye el XML SOAP conforme al esquema oficial.</li>
  <li>Envía el mensaje a la AEAT mediante conexión mTLS con tu certificado.</li>
  <li>Persiste la respuesta (CSV, huella) en el ledger inmutable.</li>
</ol>
<p>
  En pocos segundos verás el estado actualizado: <strong>Correcto</strong>, <em>ParcialmenteCorrecto</em> o <em>Incorrecto</em>.
</p>

<h2>Paso 4: Verifica el CSV</h2>
<p>
  Si el envío es correcto, aparecerá el <strong>CSV (Código Seguro de Verificación)</strong> en el panel de la factura y en el PDF. Es un código único de la AEAT del tipo <code>A-XXXXXXXXXXXX</code>.
</p>
<p>
  Tu cliente puede verificar la autenticidad de la factura escaneando el QR del PDF en la sede electrónica de la AEAT o accediendo a:
  <br />
  <code>https://www2.agenciatributaria.gob.es/wlpl/TIKE-CONT/ValidarQR?nif=...&numserie=...&fecha=...&importe=...</code>
</p>

<h2>Errores habituales en el primer envío</h2>
<table>
  <thead>
    <tr><th>Error AEAT</th><th>Causa</th><th>Solución</th></tr>
  </thead>
  <tbody>
    <tr><td>4116</td><td>NIF emisor no reconocido</td><td>Usa el NIF exacto del titular del certificado</td></tr>
    <tr><td>4109</td><td>NIF fabricante SIF incorrecto</td><td>El NIF del sistema informático debe ser real</td></tr>
    <tr><td>2000</td><td>Huella incorrecta</td><td>Suele ser formato de importes; usa el CSV de error para depurar</td></tr>
    <tr><td>4102</td><td>XML no conforme al XSD</td><td>Falta un campo obligatorio en el XML</td></tr>
  </tbody>
</table>

<h2>¡Listo!</h2>
<p>
  Una vez completados estos pasos, tienes tu primera factura registrada en Veri*Factu. A partir de aquí, cada nueva factura se encadena con la anterior automáticamente. No tienes que hacer nada más.
</p>
    `.trim(),
  },
  {
    slug: "verifactu-vs-sii-diferencias",
    title: "Veri*Factu vs SII: diferencias clave que debes conocer",
    excerpt:
      "Muchos autónomos confunden Veri*Factu con el SII. Son sistemas distintos con obligados distintos. Te explicamos cuál te aplica y por qué no puedes sustituir uno por otro.",
    date: "2026-04-28",
    readingMinutes: 4,
    tags: ["verifactu", "sii", "diferencias", "hacienda"],
    seoDescription:
      "Diferencias entre Veri*Factu y el SII (Suministro Inmediato de Información): quién está obligado a cada uno, cómo funcionan y si son compatibles. Guía 2026.",
    content: `
<h2>Dos sistemas, el mismo objetivo</h2>
<p>
  Tanto Veri*Factu como el SII buscan lo mismo: que la AEAT tenga acceso casi en tiempo real a los datos de facturación de las empresas, eliminando el fraude fiscal y la manipulación de registros contables.
</p>
<p>
  La diferencia está en <strong>quién está obligado</strong> y en <strong>cómo se envía la información</strong>.
</p>

<h2>SII: Suministro Inmediato de Información</h2>
<p>
  El SII entró en vigor el <strong>1 de julio de 2017</strong> para grandes empresas. Obliga a enviar los libros de registro de IVA (facturas emitidas, recibidas, bienes de inversión) a la AEAT en un plazo de 4 días hábiles desde la expedición o recepción de la factura.
</p>
<p><strong>Obligados al SII:</strong></p>
<ul>
  <li>Empresas con volumen de operaciones superior a <strong>6 millones de euros</strong> anuales.</li>
  <li>Grupos de entidades en IVA.</li>
  <li>Inscritos en el REDEME (Registro de Devolución Mensual).</li>
</ul>
<p>
  Los que ya están en el SII quedan <strong>excluidos de Veri*Factu</strong>.
</p>

<h2>Veri*Factu: para el resto</h2>
<p>
  Veri*Factu, implantado por el RD 1007/2023, va dirigido principalmente a <strong>autónomos, micropymes y pymes</strong> que no están en el SII. En lugar de enviar libros de registro, envía <em>cada registro de factura individualmente</em> en el momento de su generación.
</p>

<h2>Tabla comparativa</h2>
<table>
  <thead>
    <tr>
      <th></th>
      <th>SII</th>
      <th>Veri*Factu</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><strong>Obligados</strong></td><td>Grandes empresas (+6M€), REDEME, grupos IVA</td><td>Autónomos y pymes no SII</td></tr>
    <tr><td><strong>Inicio obligación</strong></td><td>1 julio 2017</td><td>1 enero 2026</td></tr>
    <tr><td><strong>Qué se envía</strong></td><td>Libros de registro IVA (emitidas + recibidas)</td><td>Solo facturas emitidas, una a una</td></tr>
    <tr><td><strong>Plazo de envío</strong></td><td>4 días hábiles</td><td>En tiempo real (al generar la factura)</td></tr>
    <tr><td><strong>Encadenamiento</strong></td><td>No (no hay huella SHA-256)</td><td>Sí (cada factura encadena con la anterior)</td></tr>
    <tr><td><strong>CSV en la factura</strong></td><td>No</td><td>Sí (código de verificación AEAT)</td></tr>
    <tr><td><strong>Facturas recibidas</strong></td><td>Sí</td><td>No</td></tr>
    <tr><td><strong>¿Son compatibles?</strong></td><td colspan="2">No: si estás en el SII, no usas Veri*Factu</td></tr>
  </tbody>
</table>

<h2>¿Por qué no puedo usar ambos?</h2>
<p>
  La normativa los diseña como sistemas mutuamente excluyentes. Si tu empresa ya reporta al SII, la AEAT ya tiene tus datos de facturación y no necesitas el sistema Veri*Factu. Intentar usar ambos a la vez generaría duplicidades y posibles inconsistencias en los registros de la AEAT.
</p>

<h2>¿Puedo cambiarme del SII a Veri*Factu?</h2>
<p>
  En general no. Si estás obligado al SII (por tamaño, régimen o inscripción voluntaria en REDEME), debes seguir en el SII. Si tu volumen de operaciones cae por debajo del umbral, es posible salir del SII, pero tiene implicaciones fiscales que debes consultar con tu asesor.
</p>

<h2>Conclusión</h2>
<p>
  Si eres autónomo o tienes una pyme y no estás en el SII, Veri*Factu es tu sistema. Si facturas más de 6 millones al año, ya estás en el SII y no tienes que hacer nada nuevo respecto a Veri*Factu.
</p>
    `.trim(),
  },
  {
    slug: "certificado-digital-fnmt-verifactu",
    title: "Certificado digital FNMT para Veri*Factu: obtención y configuración",
    excerpt:
      "Todo lo que necesitas saber sobre el certificado FNMT para enviar facturas a la AEAT: cómo solicitarlo, exportarlo en formato .pfx y subirlo a tu programa de facturación.",
    date: "2026-04-20",
    readingMinutes: 5,
    tags: ["fnmt", "certificado-digital", "verifactu", "tutorial"],
    seoDescription:
      "Cómo obtener el certificado digital FNMT para Veri*Factu, exportarlo como .pfx y configurarlo en tu software de facturación. Guía paso a paso para autónomos 2026.",
    content: `
<h2>¿Qué certificado necesito para Veri*Factu?</h2>
<p>
  Para enviar facturas a la AEAT a través de Veri*Factu necesitas un <strong>certificado digital de persona física o jurídica</strong> emitido por una entidad de certificación reconocida. El más habitual en España es el de la <strong>FNMT-RCM (Fábrica Nacional de Moneda y Timbre)</strong>.
</p>
<p>
  El formato requerido es <strong>PKCS#12 (.pfx o .p12)</strong>: un fichero que contiene tanto el certificado público como la clave privada, protegido por una contraseña.
</p>

<h2>Tipos de certificado FNMT válidos</h2>
<ul>
  <li><strong>Certificado de Persona Física</strong>: para autónomos que facturan a título personal. Identificado por tu DNI/NIE.</li>
  <li><strong>Certificado de Representante de Persona Jurídica</strong>: para administradores de SL/SA que facturan en nombre de la empresa. Identificado por el CIF de la empresa.</li>
  <li><strong>Certificado de Sede Electrónica / Empleado Público</strong>: no válido para Veri*Factu comercial.</li>
</ul>

<h2>Cómo obtener el certificado FNMT (persona física)</h2>
<ol>
  <li>Accede a <a href="https://www.sede.fnmt.gob.es/certificados/persona-fisica" target="_blank" rel="noreferrer">sede.fnmt.gob.es</a> y solicita el certificado de Persona Física.</li>
  <li>Anota el <strong>código de solicitud</strong> que recibes.</li>
  <li>Acredita tu identidad en una oficina de la AEAT, Seguridad Social o ayuntamiento adherido (presencialmente con DNI).</li>
  <li>Una vez acreditado, descarga e instala el certificado en el mismo navegador/dispositivo donde hiciste la solicitud.</li>
  <li>Exporta el certificado en formato .pfx desde el almacén del navegador (ver sección siguiente).</li>
</ol>

<h2>Cómo exportar el certificado a .pfx</h2>
<h3>En Windows (desde el navegador Edge/IE o el almacén de certificados)</h3>
<ol>
  <li>Abre el <strong>Administrador de certificados</strong> (Win+R → <code>certmgr.msc</code>).</li>
  <li>Ve a <em>Personal → Certificados</em>, localiza el tuyo y haz clic derecho → <em>Exportar</em>.</li>
  <li>Elige <strong>Exportar la clave privada</strong> → siguiente.</li>
  <li>Selecciona formato <strong>PKCS#12 (.pfx)</strong>, marca "Incluir todos los certificados" y establece una contraseña segura.</li>
  <li>Guarda el fichero .pfx.</li>
</ol>

<h3>Certificados legacy (RC2-40-CBC) y OpenSSL 3</h3>
<p>
  Los certificados FNMT emitidos antes de ~2023 usan el algoritmo de cifrado RC2-40-CBC, no compatible con OpenSSL 3 (Node.js 18+). Si al subirlo recibes el error <em>"Unsupported PKCS12 PFX data"</em>, conviértelo:
</p>
<pre><code># Extraer con soporte legacy
openssl pkcs12 -legacy -in antiguo.p12 -passin pass:TU_CONTRASEÑA -nodes -out /tmp/cert.pem

# Re-exportar con AES-256
openssl pkcs12 -export -in /tmp/cert.pem -out moderno.pfx -passout pass:TU_CONTRASEÑA

# ¡Importante! Eliminar el PEM sin cifrar
rm /tmp/cert.pem</code></pre>

<h2>Cómo verificar que el certificado es correcto</h2>
<pre><code>openssl pkcs12 -info -in certificado.pfx -passin pass:TU_CONTRASEÑA -noout
# Debe mostrar: PBES2, PBKDF2, AES-256-CBC (formato moderno)
# Si muestra: pbeWithSHA1And40BitRC2-CBC → necesita conversión</code></pre>

<h2>Extraer tu NIF del certificado</h2>
<pre><code>openssl pkcs12 -legacy -in certificado.p12 -passin pass:PASS \\
  -nokeys -clcerts 2>/dev/null \\
  | openssl x509 -noout -subject
# Subject: ..., serialNumber=IDCES-Z0706098A, ...
# Tu NIF es el valor tras "IDCES-"</code></pre>

<h2>Subir el certificado a Simple*Factu</h2>
<p>
  Una vez tienes el .pfx en formato moderno, sube en <strong>Ajustes → Veri*Factu → Certificado digital</strong>. El sistema lo almacena cifrado y lo usa automáticamente para cada envío a la AEAT. No necesitas volver a subirlo a menos que caduque o lo renueves.
</p>

<h2>¿Cuándo caduca el certificado?</h2>
<p>
  Los certificados FNMT de persona física tienen una validez de <strong>4 años</strong>. Recibirás un aviso por email antes de la caducidad para renovarlo. La renovación puede hacerse online desde el propio navegador si el certificado aún está vigente.
</p>
    `.trim(),
  },

  {
    slug: "verifactu-y-aeat-como-se-conecta-facturacion-hacienda",
    title: "Veri*Factu y AEAT: cómo se conecta tu facturación con Hacienda",
    excerpt:
      "Cada factura que emites viaja en tiempo real a los servidores de la Agencia Tributaria. Te explicamos qué pasa técnicamente, qué datos recibe Hacienda y qué garantías ofrece el sistema para ti y tu cliente.",
    date: "2026-05-20",
    readingMinutes: 6,
    tags: ["verifactu", "aeat", "software-facturacion"],
    seoDescription:
      "Cómo se conecta Veri*Factu con la AEAT: flujo técnico completo (certificado mTLS, XML SOAP, huella SHA-256, CSV) explicado para autónomos y pymes en 2026.",
    content: `
<h2>La idea detrás de la conexión</h2>
<p>
  Antes de Veri*Factu, una factura era un documento privado: la emitías, la guardabas y Hacienda solo la veía si había una inspección. Con Veri*Factu, cada factura genera un <strong>registro firmado que se envía a la AEAT en el momento de la emisión</strong>. No es una copia; es un resumen criptográfico que Hacienda usa para verificar que la factura no ha sido modificada ni eliminada después.
</p>
<p>
  Esto cambia la relación entre tu programa de facturación y Hacienda: de reactiva (inspecciones puntuales) a continua (registro en tiempo real).
</p>

<h2>Los tres componentes de la conexión</h2>

<h3>1. Tu certificado digital como llave de acceso</h3>
<p>
  La comunicación con la AEAT no usa usuario y contraseña. Usa <strong>mTLS (mutual TLS)</strong>: tanto el servidor de la AEAT como tu programa se autentican entre sí mediante certificados digitales. El tuyo es el certificado FNMT (.pfx o .p12) que ya usas para otros trámites con la Administración.
</p>
<p>
  Sin ese certificado instalado en el software, la conexión se rechaza antes de que llegue ningún dato. Este es el primer punto donde pueden surgir problemas: certificados caducados, en formato RC2 antiguo incompatible con OpenSSL 3, o con el NIF incorrecto.
</p>

<h3>2. El XML SOAP: el formato del mensaje</h3>
<p>
  Los datos de tu factura no viajan en JSON ni en PDF. El protocolo oficial es <strong>SOAP (XML)</strong>, conforme al esquema <code>SuministroInformacion.xsd</code> publicado por la AEAT. Cada mensaje incluye, entre otros:
</p>
<ul>
  <li><strong>IDFactura</strong>: NIF del emisor, número de serie y fecha de expedición.</li>
  <li><strong>Desglose IVA</strong>: base imponible, tipo impositivo y cuota para cada tramo.</li>
  <li><strong>DescripcionOperacion</strong>: texto que describes en la factura (obligatorio; no puede ser genérico).</li>
  <li><strong>SistemaInformatico</strong>: identificación del programa que genera la factura (nombre, versión, NIF del fabricante).</li>
  <li><strong>Encadenamiento</strong>: la huella de la factura anterior en la misma serie, o la indicación de que es la primera.</li>
  <li><strong>Huella</strong>: el hash SHA-256 de los campos canónicos de esta factura.</li>
</ul>

<h3>3. La huella SHA-256: la firma inviolable</h3>
<p>
  El elemento más importante del registro es la <strong>huella</strong>. Se calcula concatenando en un orden exacto los campos clave de la factura (NIF emisor, número de serie, fecha, tipo, importes, huella de la factura anterior…) y aplicando SHA-256. El resultado es una cadena hexadecimal de 64 caracteres en mayúsculas.
</p>
<p>
  La clave está en el <em>encadenamiento</em>: la huella de cada factura depende de la huella de la anterior. Si alguien modifica o elimina una factura intermedia, todas las huellas posteriores dejan de ser válidas. Es el mismo principio que una <strong>blockchain</strong>, aplicado a la facturación.
</p>

<h2>El flujo completo paso a paso</h2>
<ol>
  <li>Creas o guardas la factura en tu programa.</li>
  <li>El software calcula la <strong>huella SHA-256</strong> concatenando los campos canónicos con los importes en formato AEAT (<code>210.0</code>, no <code>210.00</code>).</li>
  <li>Se construye el mensaje <strong>XML SOAP</strong> con todos los datos del registro de alta (<em>RegistroAlta</em>).</li>
  <li>El mensaje se envía mediante <strong>HTTP POST con mTLS</strong> al endpoint de la AEAT:
    <br /><code>https://www1.agenciatributaria.gob.es/wlpl/TIKE-CONT/ws/SistemaFacturacion/VerifactuSOAP</code>
  </li>
  <li>La AEAT valida el esquema, el NIF y la huella. Responde con un estado (<em>Correcto</em>, <em>ParcialmenteCorrecto</em> o <em>Incorrecto</em>) y, si todo va bien, un <strong>CSV (Código Seguro de Verificación)</strong>.</li>
  <li>El CSV y un <strong>código QR</strong> se incluyen en el PDF de la factura. Tu cliente puede escanearlos para verificar la factura en la sede electrónica de la AEAT.</li>
</ol>

<h2>¿Qué recibe exactamente la AEAT?</h2>
<p>
  Es una pregunta frecuente. La AEAT recibe el <strong>registro del alta</strong>, no el PDF ni los adjuntos. Recibe los metadatos fiscales: identificación de emisor y receptor, importes, tipo de IVA, descripción de la operación y la huella. <strong>No recibe archivos binarios, imágenes ni datos bancarios</strong>.
</p>
<p>
  Lo que sí queda registrado de forma permanente en la AEAT es que la factura existe, con esos importes, en esa fecha, y que su huella es la que indica el registro. Cualquier discrepancia posterior es detectable.
</p>

<h2>¿Qué ocurre si la conexión falla?</h2>
<p>
  La conexión con la AEAT puede fallar puntualmente (mantenimiento, timeout, error de red). Un sistema bien diseñado como Simple*Factu gestiona esto con un <strong>sistema de jobs con reintentos y backoff exponencial</strong>: el registro se vuelve a intentar automáticamente hasta 8 veces antes de marcarse como fallido y notificar al operador. La factura queda registrada localmente desde el primer momento; el envío a la AEAT se completa en cuanto la conexión se restablece.
</p>

<h2>Entorno de preproducción para pruebas</h2>
<p>
  La AEAT ofrece un entorno de preproducción (<code>prewww1.aeat.es</code>) donde puedes enviar facturas de prueba con el mismo certificado real, sin consecuencias fiscales. Es el entorno habitual para validar que tu configuración es correcta antes de empezar a emitir facturas reales.
</p>
<p>
  Simple*Factu usa preproducción por defecto en el entorno QA y producción en el entorno live. No hay riesgo de enviar facturas de prueba a Hacienda por accidente si usas el panel de desarrollo.
</p>

<h2>Resumen</h2>
<p>
  La conexión entre tu facturación y la AEAT es técnicamente sencilla: un mensaje XML firmado con tu certificado, que incluye una huella encadenada con la factura anterior. Lo que hace especial a Veri*Factu no es la tecnología, sino la consecuencia: <strong>cada factura queda registrada de forma inmutable en Hacienda en el momento de emitirla</strong>. Para la mayoría de autónomos y pymes, esto es transparente si el software está bien configurado.
</p>
    `.trim(),
  },
  {
    slug: "verifactu-entrada-en-vigor-calendario-obligaciones",
    title: "Veri*Factu: entrada en vigor y calendario de obligaciones",
    excerpt:
      "¿Cuándo empieza a ser obligatorio Veri*Factu? Las fechas clave, quién tiene más tiempo y qué ocurre si llegas tarde. Calendario completo actualizado a 2026.",
    date: "2026-05-20",
    readingMinutes: 5,
    tags: ["verifactu", "plazos", "obligaciones", "hacienda"],
    seoDescription:
      "Calendario de entrada en vigor de Veri*Factu: fechas para fabricantes de software, autónomos y pymes. Qué pasa si no cumples los plazos del RD 1007/2023.",
    content: `
<h2>Dos plazos, dos protagonistas</h2>
<p>
  El Real Decreto 1007/2023 establece una entrada en vigor escalonada con dos fechas distintas según si eres el <strong>fabricante del software de facturación</strong> o el <strong>usuario que emite facturas</strong>. No es un error: el legislador quiso dar tiempo a los desarrolladores para adaptar sus programas antes de exigírselo a los obligados tributarios.
</p>

<h2>Calendario oficial</h2>
<table>
  <thead>
    <tr><th>Fecha</th><th>Quién</th><th>Obligación</th></tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>1 julio 2025</strong></td>
      <td>Fabricantes y comercializadores de software de facturación</td>
      <td>Sus programas deben cumplir los requisitos técnicos del RD 1007/2023 y la OM HAC/1177/2024. No pueden vender ni distribuir software no conforme a partir de esta fecha.</td>
    </tr>
    <tr>
      <td><strong>1 enero 2026</strong></td>
      <td>Empresarios y profesionales obligados (autónomos y pymes no SII)</td>
      <td>Deben usar un programa de facturación conforme a Veri*Factu para todas las facturas que emitan.</td>
    </tr>
    <tr>
      <td><strong>Ya activos</strong></td>
      <td>Grandes empresas en SII (&gt; 6M € de operaciones)</td>
      <td>Quedan excluidos de Veri*Factu; el SII es su sistema equivalente.</td>
    </tr>
  </tbody>
</table>

<h2>¿El plazo del 1 de enero de 2026 ya ha pasado?</h2>
<p>
  Sí. A fecha de publicación de este artículo (mayo de 2026), la obligación ya está en vigor para autónomos y pymes. Si aún no has adaptado tu software de facturación, estás fuera de plazo.
</p>
<p>
  La AEAT no ha publicado ningún período de gracia formal, aunque en la práctica los primeros meses de cualquier nueva obligación tributaria suelen tener un nivel de inspección menor mientras el sistema madura. Eso no significa que no exista riesgo; significa que el riesgo es menor ahora que dentro de un año.
</p>

<h2>¿Puede haber más retrasos o aplazamientos?</h2>
<p>
  Históricamente, la entrada en vigor de Veri*Factu acumuló varios aplazamientos desde su anuncio inicial. El RD 1007/2023 fue aprobado en diciembre de 2023, la OM HAC/1177/2024 no llegó hasta octubre de 2024, y el plazo original para software se movió más de una vez.
</p>
<p>
  Dicho esto, desde enero de 2026 el sistema está operativo y la AEAT está recibiendo registros. Esperar a un nuevo aplazamiento que no está anunciado es una estrategia de riesgo elevado.
</p>

<h2>¿Y Veri*Factu en 2027?</h2>
<p>
  No hay, a día de hoy, una nueva fecha normativa anunciada para 2027. Lo que sí se espera es que la AEAT intensifique la vigilancia y el cruce de datos a medida que el volumen de registros acumulados en el sistema crezca. En 2027, Hacienda tendrá más de un año de histórico de facturas de millones de contribuyentes: ese es el momento en que la utilidad del sistema para detectar irregularidades aumenta exponencialmente.
</p>

<h2>Qué pasa si no cumples los plazos</h2>
<p>
  El artículo 201 bis de la <strong>Ley General Tributaria</strong> tipifica el uso de sistemas informáticos que no cumplan los requisitos como infracción tributaria. Las sanciones pueden llegar a:
</p>
<ul>
  <li><strong>150.000 € por ejercicio</strong> si el software no cumple los requisitos técnicos.</li>
  <li><strong>50.000 € por ejercicio</strong> si se permiten comportamientos prohibidos (borrado, modificación sin registro, doble base de datos…).</li>
</ul>
<p>
  Estas sanciones van dirigidas principalmente a los <em>fabricantes</em> de software no conforme, pero el <em>usuario</em> que use conscientemente ese software también puede ser sancionado. Lo más sensato es usar un programa que ya cumpla y que pueda demostrarlo (certificación o declaración responsable del fabricante).
</p>

<h2>Cómo saber si tu software ya cumple</h2>
<p>
  Pregunta directamente al proveedor de tu programa de facturación si cumple el RD 1007/2023 y la OM HAC/1177/2024, y pídele la <strong>declaración responsable de conformidad</strong> prevista en el artículo 8 del RD. Esa declaración es el documento que te protege en caso de inspección.
</p>
<p>
  Si usas Simple*Factu, el sistema envía directamente a la AEAT en tiempo real mediante mTLS con tu certificado FNMT. Cada factura genera un CSV de verificación que puedes consultar en la sede electrónica de la AEAT. Eso es cumplimiento demostrable.
</p>

<h2>Resumen del calendario</h2>
<ul>
  <li><strong>Julio 2025:</strong> fabricantes de software obligados a tener programas conformes.</li>
  <li><strong>Enero 2026:</strong> autónomos y pymes obligados a usarlos. Ya en vigor.</li>
  <li><strong>SII (grandes empresas):</strong> quedan excluidos; su sistema ya es equivalente.</li>
  <li><strong>2027 en adelante:</strong> no hay nuevas fechas anunciadas, pero la vigilancia aumentará.</li>
</ul>
    `.trim(),
  },
  {
    slug: "verifactu-es-obligatorio-quien-debe-cumplir-excepciones",
    title: "¿Es obligatorio Veri*Factu? Quién debe cumplir y excepciones",
    excerpt:
      "No todo el mundo está obligado a Veri*Factu de la misma forma. Descubre si te afecta, qué excepciones existen y qué pasa si tu actividad está exenta de IVA o en módulos.",
    date: "2026-05-20",
    readingMinutes: 5,
    tags: ["verifactu", "obligados", "excepciones", "autonomos"],
    seoDescription:
      "¿Es obligatorio Veri*Factu para tu negocio? Guía completa de obligados, excepciones (SII, exentos IVA, módulos) y casos especiales según el RD 1007/2023.",
    content: `
<h2>La respuesta corta</h2>
<p>
  <strong>Sí, Veri*Factu es obligatorio</strong> para la gran mayoría de autónomos y pymes que emiten facturas en España y no están incluidos en el SII. La obligación entró en vigor el 1 de enero de 2026. Sin embargo, hay excepciones importantes que vale la pena conocer.
</p>

<h2>¿Quién está obligado?</h2>
<p>
  El artículo 3 del Real Decreto 1007/2023 establece que deben usar un sistema informático de facturación (SIF) conforme a Veri*Factu todos los <strong>empresarios y profesionales</strong> que:
</p>
<ul>
  <li>Estén sujetos al Impuesto sobre la Renta de las Personas Físicas (IRPF) en estimación directa, normal o simplificada.</li>
  <li>Sean sujetos pasivos del Impuesto sobre Sociedades (IS).</li>
  <li>Sean sujetos pasivos del Impuesto sobre la Renta de no Residentes (IRNR) con establecimiento permanente en España.</li>
  <li>En general, cualquier empresario o profesional que deba emitir facturas y no esté excluido expresamente.</li>
</ul>
<p>
  En la práctica, esto cubre: <strong>autónomos, SL, SA, cooperativas, comunidades de bienes y cualquier entidad con actividad económica</strong> por debajo del umbral del SII.
</p>

<h2>Excepciones: quién NO está obligado a Veri*Factu</h2>

<h3>1. Empresas en el SII (Suministro Inmediato de Información)</h3>
<p>
  Si tu volumen de operaciones supera los <strong>6 millones de euros anuales</strong>, estás obligado al SII, no a Veri*Factu. También están en el SII los grupos de IVA y las empresas que lo solicitaron voluntariamente. El SII es el sistema equivalente para grandes empresas: ya envías tus facturas a la AEAT en tiempo real, solo que con un protocolo distinto.
</p>

<h3>2. Actividades totalmente exentas de IVA sin obligación de facturar</h3>
<p>
  Algunas actividades están exentas de IVA (artículo 20 de la Ley del IVA) y además no tienen obligación de emitir facturas a particulares. En esos casos, si no emites facturas, no necesitas un SIF conforme a Veri*Factu. Ejemplo típico: ciertos arrendadores de viviendas a particulares sin actividad económica registrada.
</p>
<p>
  Ojo: si esa misma persona realiza <em>cualquier otra actividad</em> que sí genera facturas, la obligación aplica para esas facturas.
</p>

<h3>3. Contribuyentes en estimación objetiva (módulos) sin facturas a empresarios</h3>
<p>
  Los autónomos en módulos que <strong>solo venden a particulares</strong> y no emiten facturas a otros empresarios o profesionales tienen una situación particular. Técnicamente están obligados, pero si no emiten facturas, la obligación no tiene efecto práctico. Si emiten aunque sea una factura a otra empresa, necesitan un SIF conforme.
</p>

<h3>4. No residentes sin establecimiento permanente</h3>
<p>
  Las empresas extranjeras que venden en España sin establecimiento permanente no están sujetas al IRPF ni al IS español, por lo que quedan fuera del ámbito del RD 1007/2023.
</p>

<h2>Casos frecuentes con dudas</h2>
<table>
  <thead>
    <tr><th>Caso</th><th>¿Obligado a Veri*Factu?</th></tr>
  </thead>
  <tbody>
    <tr><td>Autónomo en estimación directa</td><td>Sí</td></tr>
    <tr><td>SL o SA con facturación &lt; 6M €</td><td>Sí</td></tr>
    <tr><td>Autónomo en módulos que factura a empresas</td><td>Sí</td></tr>
    <tr><td>Autónomo en módulos que solo vende a particulares</td><td>Técnicamente sí, sin efecto práctico si no emite facturas</td></tr>
    <tr><td>Empresa en SII (&gt; 6M € operaciones)</td><td>No (usa SII)</td></tr>
    <tr><td>Médico o abogado con actividad exenta IVA</td><td>Sí si emiten facturas a clientes empresas; consultar con asesor</td></tr>
    <tr><td>Arrendador de vivienda a particulares sin actividad económica</td><td>No, si no emite facturas</td></tr>
    <tr><td>Sociedad patrimonial sin actividad</td><td>Depende; consultar con asesor</td></tr>
  </tbody>
</table>

<h2>¿Qué pasa si no cumples?</h2>
<p>
  El incumplimiento está tipificado en el artículo 201 bis de la Ley General Tributaria. Las sanciones van desde <strong>50.000 € hasta 150.000 € por ejercicio</strong> dependiendo del tipo de infracción (uso de software no conforme, permitir borrado retroactivo, doble contabilidad…).
</p>
<p>
  Estas sanciones se dirigen principalmente al fabricante del software, pero el usuario que lo utiliza conscientemente también puede ser sancionado. La recomendación es solicitar siempre la <strong>declaración responsable de conformidad</strong> al proveedor de tu programa.
</p>

<h2>Veri*Factu voluntario: ¿tiene ventajas?</h2>
<p>
  Sí. Acogerse voluntariamente a Veri*Factu —incluso antes de estar obligado— tiene una ventaja fiscal relevante: quedas <strong>exonerado de conservar las facturas emitidas</strong> durante el período en que AEAT tiene los registros (disposición adicional primera del RD 1007/2023). Además, la AEAT puede agilizar devoluciones de IVA para contribuyentes con historial limpio en Veri*Factu.
</p>

<h2>Cómo saber con certeza si te aplica</h2>
<p>
  La casuística es amplia. Si tienes dudas sobre tu situación concreta, el camino más seguro es <strong>consultar con tu asesor fiscal</strong> y pedirle que revise tu régimen de IVA, IRPF y volumen de operaciones. Como regla práctica: si emites facturas a otras empresas o profesionales en España y no estás en el SII, <strong>es casi seguro que estás obligado</strong>.
</p>
    `.trim(),
  },
  // ── artículo 4 ──────────────────────────────────────────────────────────────
  {
    slug: "verifactu-2027-plazos-cambios-que-preparar",
    title: "Veri*Factu 2027: plazos, cambios y qué preparar",
    excerpt:
      "No hay nuevas fechas anunciadas para 2027, pero Hacienda tendrá un año completo de registros acumulados. Qué esperar y cómo adelantarte.",
    date: "2026-05-20",
    readingMinutes: 4,
    tags: ["verifactu", "plazos", "2027", "hacienda"],
    seoDescription:
      "Qué cambia en Veri*Factu en 2027: nuevas normativas esperadas, intensificación de la vigilancia de la AEAT y cómo preparar tu negocio con tiempo.",
    content: `
<h2>¿Hay nuevos plazos para 2027?</h2>
<p>
  A fecha de publicación (mayo de 2026), la AEAT <strong>no ha anunciado ningún nuevo plazo ni modificación normativa específica para 2027</strong>. La obligación de usar Veri*Factu ya entró en vigor el 1 de enero de 2026 y el sistema está operativo.
</p>
<p>
  Sin embargo, 2027 será un año relevante por una razón distinta: será el primer ejercicio fiscal completo en el que Hacienda habrá acumulado registros de facturas de millones de contribuyentes durante 12 meses seguidos. Eso cambia el escenario de control tributario de forma significativa.
</p>

<h2>Por qué 2027 importa aunque no haya nuevos plazos</h2>
<h3>1. Cruce de datos a gran escala</h3>
<p>
  Con un año completo de facturas en Veri*Factu, la AEAT puede cruzar automáticamente las facturas emitidas por un proveedor con las recibidas por su cliente. Si hay discrepancias —facturas que aparecen en el sistema del emisor pero no en el del receptor, o importes que no cuadran—, el sistema las detecta sin inspección manual.
</p>

<h3>2. Comparativa interanual</h3>
<p>
  En 2027 Hacienda podrá comparar el ejercicio 2026 (primer año completo en Veri*Factu) con los ejercicios anteriores. Contribuyentes cuya facturación declarada cae significativamente respecto al patrón previo —o cuya actividad real no coincide con los registros— quedarán más expuestos.
</p>

<h3>3. Posibles desarrollos normativos</h3>
<p>
  Es razonable esperar que la AEAT publique en 2026 o principios de 2027 alguna circular o instrucción sobre el funcionamiento del sistema, aclaraciones sobre casos especiales (facturas rectificativas, anulaciones, autofacturas) y posiblemente ampliaciones del ámbito a colectivos que hoy están excluidos.
</p>

<h2>Qué preparar ahora para estar listo en 2027</h2>
<ol>
  <li>
    <strong>Verifica que tu software envía correctamente</strong>. Revisa los CSV de las últimas facturas y confirma que el estado es <em>Correcto</em> o <em>ParcialmenteCorrecto</em>. Cualquier factura con estado <em>Incorrecto</em> no está registrada en la AEAT.
  </li>
  <li>
    <strong>Mantén la cadena de huellas limpia</strong>. No cambies de software ni de número de instalación sin entender las implicaciones para el encadenamiento. Una cadena rota es detectable.
  </li>
  <li>
    <strong>Archiva los CSV</strong>. Aunque la AEAT tiene los registros, tener los CSV de cada factura en tu contabilidad simplifica cualquier requerimiento de información.
  </li>
  <li>
    <strong>Revisa las facturas rectificativas y anulaciones</strong>. Son el punto donde más errores se acumulan. Asegúrate de que las anulaciones en Veri*Factu corresponden exactamente con los abonos contabilizados.
  </li>
  <li>
    <strong>Pide la declaración responsable a tu proveedor de software</strong>. Si aún no la tienes, solicítala. Es tu escudo en caso de inspección.
  </li>
</ol>

<h2>Resumen</h2>
<p>
  2027 no trae nuevos plazos normativos conocidos, pero sí más datos en manos de Hacienda y más capacidad de cruce. El mejor preparativo es haber operado correctamente en 2026: facturas enviadas, cadena de huellas íntegra y discrepancias cero.
</p>
    `.trim(),
  },

  // ── artículo 5 ──────────────────────────────────────────────────────────────
  {
    slug: "verifactu-agencia-tributaria-tramites-sede-electronica",
    title: "Veri*Factu en la Agencia Tributaria: trámites, sede electrónica y enlaces útiles",
    excerpt:
      "Dónde verificar una factura Veri*Factu, cómo acceder al validador QR de la AEAT y qué trámites puedes hacer desde la sede electrónica relacionados con Veri*Factu.",
    date: "2026-05-20",
    readingMinutes: 4,
    tags: ["verifactu", "aeat", "sede-electronica", "tramites"],
    seoDescription:
      "Cómo usar la sede electrónica de la AEAT con Veri*Factu: validar facturas con el QR, acceder al historial de registros y trámites relacionados con el RD 1007/2023.",
    content: `
<h2>La AEAT como registro central</h2>
<p>
  Cuando envías una factura con Veri*Factu, la AEAT guarda un registro de ese alta. Ese registro es consultable: tanto tú como tu cliente (y en una inspección, Hacienda) podéis verificar que la factura existe, que no ha sido modificada y que los importes coinciden. El canal principal para esa verificación es el <strong>código QR</strong> del PDF de la factura.
</p>

<h2>Validar una factura: el QR y el validador oficial</h2>
<p>
  Cada factura registrada correctamente en Veri*Factu incluye un código QR que enlaza al validador de la AEAT. La URL del validador tiene este formato:
</p>
<pre><code>https://www2.agenciatributaria.gob.es/wlpl/TIKE-CONT/ValidarQR
  ?nif=Z0706098A
  &numserie=2026%2FF-001
  &fecha=20-05-2026
  &importe=1210.00</code></pre>
<p>
  Escaneando el QR del PDF con cualquier lector (móvil, cámara), el receptor de la factura puede confirmar en tiempo real que el registro existe en la AEAT y que los datos coinciden. Esto es la <strong>garantía de autenticidad</strong> que exige el RD 1007/2023.
</p>

<h2>El CSV: Código Seguro de Verificación</h2>
<p>
  Además del QR, cada factura aceptada tiene un <strong>CSV</strong> (Código Seguro de Verificación) asignado por la AEAT, con formato <code>A-XXXXXXXXXXXX</code>. Este código identifica unívocamente el registro en los sistemas de la AEAT. Guárdalo junto a cada factura; es el equivalente al número de registro en el libro oficial de facturas emitidas.
</p>

<h2>Sede electrónica: ¿qué puedo hacer?</h2>
<p>
  La <a href="https://sede.agenciatributaria.gob.es" target="_blank" rel="noreferrer">sede electrónica de la AEAT</a> centraliza los trámites. Los relacionados con Veri*Factu más útiles son:
</p>
<ul>
  <li>
    <strong>Validar QR de una factura recibida</strong>: cualquier persona con el QR o los datos de la factura puede comprobar su autenticidad sin necesidad de certificado.
  </li>
  <li>
    <strong>Consultar el estado de un registro</strong>: con certificado digital, puedes consultar los registros enviados a través de tu NIF.
  </li>
  <li>
    <strong>Descargar el esquema XSD oficial</strong>: el esquema técnico del sistema está disponible en el entorno de preproducción (requiere certificado para acceder).
  </li>
  <li>
    <strong>Acceder al entorno de preproducción</strong>: <code>prewww1.aeat.es</code> y <code>prewww2.aeat.es</code> para pruebas con certificado real sin consecuencias fiscales.
  </li>
</ul>

<h2>Verificar el NIF de un cliente o proveedor</h2>
<p>
  La AEAT también ofrece el servicio <strong>VNIF (Verificación de NIF)</strong>, accesible mediante SOAP desde tu software de facturación. Simple*Factu lo expone en el endpoint <code>POST /verify-nif</code>: puedes comprobar si el NIF de un cliente existe en el censo de la AEAT antes de emitir la factura, evitando el error <code>1239</code> (NIF destinatario no identificado).
</p>

<h2>Entornos disponibles</h2>
<table>
  <thead>
    <tr><th>Entorno</th><th>URL</th><th>Uso</th></tr>
  </thead>
  <tbody>
    <tr><td>Preproducción SOAP</td><td><code>prewww1.aeat.es/…/VerifactuSOAP</code></td><td>Pruebas con certificado real</td></tr>
    <tr><td>Preproducción XSD</td><td><code>prewww2.aeat.es/…/SuministroInformacion.xsd</code></td><td>Descargar esquema técnico</td></tr>
    <tr><td>Validador QR producción</td><td><code>www2.agenciatributaria.gob.es/…/ValidarQR</code></td><td>Verificar facturas reales</td></tr>
    <tr><td>SOAP producción</td><td><code>www1.agenciatributaria.gob.es/…/VerifactuSOAP</code></td><td>Envío de facturas reales</td></tr>
  </tbody>
</table>

<h2>Preguntas frecuentes sobre la sede</h2>
<p><strong>¿Necesito certificado para validar el QR?</strong> No. El validador QR es público. Solo necesitas los datos de la factura (o escanear el QR).</p>
<p><strong>¿Puedo ver todas mis facturas registradas en Veri*Factu?</strong> La AEAT no ofrece actualmente un portal de consulta masiva para el contribuyente. Tu fuente de verdad es el ledger de tu programa de facturación (Simple*Factu lo expone en <code>GET /me/invoice-records</code>).</p>
<p><strong>¿Qué pasa si la AEAT no está disponible?</strong> El sistema tiene downtime ocasional. Un buen software gestiona esto con reintentos automáticos. La factura se genera igualmente; el envío se completa cuando la conexión se restablece.</p>
    `.trim(),
  },

  // ── artículo 6 ──────────────────────────────────────────────────────────────
  {
    slug: "verifactu-aeat-descargar-software-requisitos-sif",
    title: "Veri*Factu AEAT: descargar software oficial y requisitos del SIF",
    excerpt:
      "¿Existe un software gratuito oficial de la AEAT para Veri*Factu? Qué requisitos debe cumplir cualquier programa, qué es el SIF y cómo elegir bien.",
    date: "2026-05-20",
    readingMinutes: 5,
    tags: ["verifactu", "aeat", "software", "sif", "requisitos"],
    seoDescription:
      "Software de Veri*Factu: requisitos técnicos del SIF según el RD 1007/2023, si existe descarga oficial de la AEAT y cómo elegir un programa conforme.",
    content: `
<h2>¿Tiene la AEAT un software oficial para descargar?</h2>
<p>
  No exactamente. La AEAT <strong>no distribuye un programa de facturación gratuito</strong> con interfaz de usuario para autónomos y pymes como sí hace con algunos modelos tributarios (p.ej. el antiguo programa PADRE). Lo que sí publica son:
</p>
<ul>
  <li>El <strong>esquema XSD técnico</strong> (<code>SuministroInformacion.xsd</code>) en el entorno de preproducción, que define el formato XML de los mensajes.</li>
  <li>La <strong>documentación de los servicios web SOAP</strong> en la web de la AEAT.</li>
  <li>El <strong>entorno de preproducción</strong> (<code>prewww1.aeat.es</code>) para que los desarrolladores prueben sus integraciones.</li>
</ul>
<p>
  En resumen: la AEAT define el protocolo y valida los datos, pero delega en el mercado privado la creación de los programas de facturación. Tú debes usar un software certificado de un proveedor privado o desarrollar tu propia integración.
</p>

<h2>Qué es el SIF (Sistema Informático de Facturación)</h2>
<p>
  El <strong>SIF</strong> es el nombre técnico que el RD 1007/2023 da al conjunto de aplicaciones y sistemas que soportan los procesos de facturación. Tu programa de facturación —sea de escritorio, en la nube o una API— es tu SIF.
</p>
<p>
  Para ser conforme a Veri*Factu, un SIF debe cumplir una serie de requisitos técnicos y funcionales definidos en la <strong>Orden HAC/1177/2024</strong>.
</p>

<h2>Requisitos técnicos del SIF</h2>
<p>Los requisitos se agrupan en dos categorías:</p>

<h3>Requisitos de integridad e inalterabilidad</h3>
<ul>
  <li>Cada registro de factura debe generar una <strong>huella SHA-256</strong> que encadene los datos de la factura con la huella de la anterior.</li>
  <li>No puede ser posible modificar ni eliminar facturas sin dejar rastro en el sistema.</li>
  <li>No puede haber dobles bases de datos ni modos ocultos.</li>
  <li>El sistema debe mantener un <strong>registro de eventos</strong> (alta, modificación, anulación) con marca temporal.</li>
</ul>

<h3>Requisitos de remisión a la AEAT</h3>
<ul>
  <li>El software debe enviar los registros de alta y anulación al endpoint SOAP de la AEAT en <strong>tiempo real o en batch</strong> (máximo 4 días hábiles de retraso en el régimen de remisión voluntaria).</li>
  <li>La conexión debe ser <strong>mTLS</strong> con el certificado digital del contribuyente.</li>
  <li>El mensaje XML debe cumplir el esquema <code>SuministroInformacion.xsd</code> de la AEAT.</li>
  <li>Debe incluir el bloque <code>SistemaInformatico</code> con el NIF del fabricante, nombre del sistema e identificador.</li>
</ul>

<h3>Requisitos de información al usuario</h3>
<ul>
  <li>El PDF de la factura debe incluir el <strong>CSV</strong> devuelto por la AEAT y el <strong>código QR</strong> de verificación.</li>
  <li>La leyenda <strong>VERI*FACTU</strong> debe aparecer en la factura cuando el sistema opera bajo este régimen.</li>
</ul>

<h2>La declaración responsable del fabricante</h2>
<p>
  El artículo 8 del RD 1007/2023 exige que el fabricante del software emita una <strong>declaración responsable de conformidad</strong> donde certifica que su producto cumple todos los requisitos. Como usuario, debes pedir esta declaración a tu proveedor. Es el documento que te protege ante la AEAT en caso de que el software tenga un fallo de cumplimiento.
</p>

<h2>Cómo elegir el software adecuado</h2>
<ol>
  <li><strong>Confirma que envía en tiempo real a la AEAT</strong> y que puedes ver el CSV de cada factura en el panel.</li>
  <li><strong>Pide la declaración responsable</strong> de conformidad con el RD 1007/2023.</li>
  <li><strong>Verifica que gestiona reintentos</strong>: si la AEAT está caída, el software debe reintentar automáticamente.</li>
  <li><strong>Comprueba el soporte de certificados legacy</strong>: si tu .pfx es antiguo (FNMT pre-2023), el software debe poder convertirlo o al menos informarte claramente.</li>
  <li><strong>Revisa el tratamiento de anulaciones</strong>: el <em>RegistroAnulacion</em> tiene su propio esquema y lógica de encadenamiento.</li>
</ol>

<h2>Simple*Factu como SIF en la nube</h2>
<p>
  Simple*Factu actúa como SIF a través de API: recibe los datos de tu factura, calcula la huella, construye el XML SOAP y lo envía a la AEAT con tu certificado almacenado cifrado. Los registros quedan en un ledger inmutable consultable desde el panel o vía API. El PDF incluye CSV y QR automáticamente.
</p>
    `.trim(),
  },

  // ── artículo 7 ──────────────────────────────────────────────────────────────
  {
    slug: "verifactu-para-autonomos-pasos-certificado-primera-factura",
    title: "Veri*Factu para autónomos: pasos, certificado y primera factura",
    excerpt:
      "Guía práctica para el autónomo que empieza con Veri*Factu desde cero: qué certificado necesitas, cómo configurar el software y enviar la primera factura sin errores.",
    date: "2026-05-20",
    readingMinutes: 6,
    tags: ["verifactu", "autonomos", "certificado", "tutorial"],
    seoDescription:
      "Veri*Factu para autónomos: guía paso a paso para obtener el certificado FNMT, configurar el software y emitir la primera factura con código QR y CSV de la AEAT.",
    content: `
<h2>¿Qué necesita un autónomo para cumplir con Veri*Factu?</h2>
<p>
  Tres cosas: un <strong>certificado digital válido</strong>, un <strong>programa de facturación conforme</strong> y el <strong>NIF correcto configurado</strong>. Con eso, el resto es automático.
</p>

<h2>Paso 1: Obtener o localizar tu certificado digital</h2>
<p>
  El certificado que ya usas para hacer trámites con la AEAT (presentar declaraciones, consultar notificaciones) sirve para Veri*Factu. Debe estar en formato <strong>.pfx o .p12</strong>, que incluye tanto el certificado como la clave privada. Si solo tienes el .cer o el .crt, necesitas el .pfx completo.
</p>
<p><strong>Cómo obtenerlo si no lo tienes:</strong></p>
<ol>
  <li>Accede a <a href="https://www.sede.fnmt.gob.es/certificados/persona-fisica" target="_blank" rel="noreferrer">sede.fnmt.gob.es</a> y solicita un certificado de persona física.</li>
  <li>Acredita tu identidad (presencialmente en una oficina de la AEAT, Correos u otras entidades registradoras).</li>
  <li>Descarga el certificado desde la sede FNMT con el código que te enviaron por correo.</li>
  <li>Exporta el .pfx desde tu navegador o desde el almacén de certificados de Windows/Mac con clave privada incluida.</li>
</ol>
<p>
  <strong>Formato antiguo (RC2):</strong> los certificados FNMT emitidos antes de 2023 pueden usar un cifrado incompatible con sistemas modernos. Si al subirlo ves un error, conviértelo:
</p>
<pre><code>openssl pkcs12 -legacy -in antiguo.p12 -passin pass:TU_PASS -nodes -out /tmp/cert.pem
openssl pkcs12 -export -in /tmp/cert.pem -out moderno.pfx -passout pass:TU_PASS
rm /tmp/cert.pem</code></pre>

<h2>Paso 2: Configurar el software</h2>
<p>
  En Simple*Factu (o en cualquier programa conforme), el proceso es:
</p>
<ol>
  <li><strong>Ajustes → Veri*Factu</strong>: introduce tu NIF y razón social exactamente como aparecen en el certificado.</li>
  <li><strong>Sube el .pfx</strong> y la contraseña. El sistema lo almacena cifrado; nunca lo devuelve en texto claro.</li>
  <li><strong>Comprueba la conexión</strong>: usa el verificador de NIF con tu propio NIF para confirmar que el certificado conecta correctamente con la AEAT.</li>
</ol>

<h2>Paso 3: Crear y enviar la primera factura</h2>
<p>
  La primera factura de cada serie activa el <strong>primer registro de la cadena</strong> (<em>primerRegistro: true</em>). El software lo gestiona automáticamente, pero conviene entender qué significa: a partir de esa factura, cada siguiente se encadena con la anterior. No hay vuelta atrás en la cadena.
</p>
<p><strong>Qué revisar antes de enviar:</strong></p>
<ul>
  <li><strong>NIF del cliente</strong>: si es una empresa española, la AEAT lo valida. Un NIF ficticio genera el error <code>1239</code>.</li>
  <li><strong>Descripción de la operación</strong>: obligatoria y específica. "Servicios de asesoría junio 2026" es válido; "Servicios" solo no lo es.</li>
  <li><strong>Tipo de IVA</strong>: asegúrate de seleccionar el correcto según tu actividad (21%, 10%, 4%, exento…).</li>
  <li><strong>Número de serie</strong>: usa un formato consistente. Si cambias el formato de serie, empiezas una nueva cadena.</li>
</ul>

<h2>Paso 4: Verificar el resultado</h2>
<p>
  Tras el envío, verás el estado en el panel:
</p>
<ul>
  <li><strong>Correcto</strong>: la AEAT aceptó la factura. El CSV aparece en el panel y en el PDF.</li>
  <li><strong>ParcialmenteCorrecto</strong>: aceptada con advertencias (normalmente huella con pequeña desviación horaria). La factura está registrada; el CSV es válido.</li>
  <li><strong>Incorrecto</strong>: rechazada. El código de error indica la causa. Las más frecuentes en la primera factura son NIF incorrecto (4116) o XML mal formado (4102).</li>
</ul>

<h2>Errores frecuentes del primer envío y cómo resolverlos</h2>
<table>
  <thead>
    <tr><th>Error</th><th>Causa</th><th>Solución</th></tr>
  </thead>
  <tbody>
    <tr><td>4116</td><td>NIF emisor no en el censo AEAT</td><td>Usa el NIF exacto del titular del certificado</td></tr>
    <tr><td>1239</td><td>NIF del cliente no existe</td><td>Verifica el NIF del cliente en la AEAT antes de facturar</td></tr>
    <tr><td>Certificado RC2</td><td>Formato antiguo incompatible</td><td>Convierte con OpenSSL (ver paso 1)</td></tr>
    <tr><td>Contraseña incorrecta</td><td>Error al subir el .pfx</td><td>Asegúrate de usar la contraseña de exportación, no la del DNIe</td></tr>
  </tbody>
</table>

<h2>¿Qué pasa con las facturas a particulares?</h2>
<p>
  Veri*Factu también aplica a las facturas a particulares (B2C). El tratamiento es idéntico: se envían a la AEAT, generan CSV y QR. El particular puede escanear el QR para verificar la factura, aunque en la práctica pocos lo hacen.
</p>

<h2>Resumen para el autónomo</h2>
<p>
  El proceso completo —certificado, configuración y primera factura— se puede completar en menos de una hora si tienes el .pfx a mano. El mayor obstáculo suele ser el certificado antiguo en formato RC2 o no tener la contraseña de exportación del .pfx. Con eso resuelto, el resto es configurar el NIF y enviar.
</p>
    `.trim(),
  },

  // ── artículo 8 ──────────────────────────────────────────────────────────────
  {
    slug: "verifactu-gratis-software-planes-opciones",
    title: "¿Hay Veri*Factu gratis? Software, planes y qué incluye cada opción",
    excerpt:
      "Comparativa de opciones de software Veri*Factu: qué es gratuito, qué tiene coste y qué debes mirar más allá del precio antes de elegir.",
    date: "2026-05-20",
    readingMinutes: 5,
    tags: ["verifactu", "gratis", "software", "precios", "comparativa"],
    seoDescription:
      "¿Existe Veri*Factu gratis? Opciones de software, qué incluye el plan gratuito vs de pago y qué funcionalidades son imprescindibles para cumplir con la AEAT.",
    content: `
<h2>La pregunta correcta no es «¿es gratis?»</h2>
<p>
  La pregunta más útil es: <strong>¿qué incluye exactamente el plan gratuito?</strong> Muchos programas de facturación ofrecen una capa gratuita con limitaciones que pueden ser un problema en la práctica: número de facturas al mes, sin envío automático a la AEAT, sin gestión de reintentos o sin soporte de certificados.
</p>

<h2>¿Tiene la AEAT un software gratuito?</h2>
<p>
  No. La AEAT define el protocolo técnico (RD 1007/2023 + OM HAC/1177/2024) y ofrece el entorno de conexión, pero <strong>no distribuye un programa de facturación con interfaz para el contribuyente</strong>. El mercado privado cubre esa necesidad.
</p>

<h2>Tipos de soluciones en el mercado</h2>
<h3>1. Programas de escritorio tradicionales</h3>
<p>
  Factusol, ContaPlus, a3factura, Sage… Muchos han añadido un módulo Veri*Factu a sus versiones actuales. La actualización puede ser gratuita para suscriptores activos o tener coste adicional. Funcionan bien para negocios que ya los usan, pero la curva de actualización es variable.
</p>

<h3>2. Software en la nube (SaaS)</h3>
<p>
  Holded, Billin, Anfix, Simple*Factu… Ofrecen planes desde gratuito hasta enterprise. La ventaja es que el cumplimiento de Veri*Factu se actualiza automáticamente en el servidor; no necesitas instalar nada.
</p>

<h3>3. API para desarrolladores</h3>
<p>
  Si tienes un ERP propio o un sistema a medida, puedes integrar Veri*Factu via API usando servicios como Simple*Factu API. El desarrollador de tu sistema gestiona la integración; el servicio API se encarga del protocolo SOAP, la huella, el encadenamiento y la conexión mTLS.
</p>

<h2>Qué mirar en un plan «gratuito»</h2>
<table>
  <thead>
    <tr><th>Criterio</th><th>Qué preguntar</th></tr>
  </thead>
  <tbody>
    <tr><td>Límite de facturas</td><td>¿Cuántas facturas/mes incluye? ¿Qué pasa si supero el límite?</td></tr>
    <tr><td>Envío a AEAT</td><td>¿El envío a Veri*Factu está incluido o es un add-on de pago?</td></tr>
    <tr><td>Reintentos automáticos</td><td>Si la AEAT falla, ¿reintenta solo o tengo que hacerlo a mano?</td></tr>
    <tr><td>CSV y QR en PDF</td><td>¿El PDF incluye automáticamente el CSV y el QR de verificación?</td></tr>
    <tr><td>Anulaciones</td><td>¿Puedo anular facturas en Veri*Factu desde el programa?</td></tr>
    <tr><td>Soporte técnico</td><td>¿Hay soporte si tengo un error de la AEAT que no entiendo?</td></tr>
    <tr><td>Declaración responsable</td><td>¿El fabricante ha emitido la declaración del art. 8 RD 1007/2023?</td></tr>
  </tbody>
</table>

<h2>Simple*Factu: plan gratuito y planes de pago</h2>
<p>
  Simple*Factu ofrece un <strong>plan gratuito</strong> que incluye envío a Veri*Factu, CSV, QR en PDF y gestión de anulaciones hasta un límite mensual de facturas. Los planes de pago amplían ese límite y añaden funcionalidades como mayor historial, acceso API ilimitado y soporte prioritario.
</p>
<p>
  Para un autónomo que emite 10-20 facturas al mes, el plan gratuito suele ser suficiente. Para pymes con mayor volumen o con ERPs propios, los planes de pago o el acceso API son más adecuados.
</p>

<h2>El coste real de no cumplir</h2>
<p>
  Elegir el software más barato que no cumple los requisitos puede salir mucho más caro: las sanciones del artículo 201 bis de la LGT van de <strong>50.000 € a 150.000 € por ejercicio</strong>. El criterio de selección debería ser la conformidad primero, el precio después.
</p>
    `.trim(),
  },

  // ── artículo 9 ──────────────────────────────────────────────────────────────
  {
    slug: "verifactu-noticias-ultimas-novedades-hacienda",
    title: "Veri*Factu: noticias y últimas novedades de Hacienda (2026)",
    excerpt:
      "Resumen de las novedades más importantes sobre Veri*Factu: cambios normativos, aclaraciones de la AEAT y lo que se espera para los próximos meses.",
    date: "2026-05-20",
    readingMinutes: 4,
    tags: ["verifactu", "noticias", "novedades", "hacienda", "2026"],
    seoDescription:
      "Últimas noticias sobre Veri*Factu en 2026: cambios normativos, aclaraciones de la AEAT, estado del sistema y qué esperar en los próximos meses.",
    content: `
<h2>Estado actual del sistema (mayo 2026)</h2>
<p>
  Veri*Factu está operativo desde el 1 de enero de 2026. El sistema SOAP de la AEAT recibe registros en tiempo real y devuelve CSV de verificación. Según los datos disponibles, el volumen de registros crece cada semana a medida que más contribuyentes y programas de facturación se integran.
</p>
<p>
  No se han publicado datos oficiales de adopción, pero los principales proveedores de software de facturación (Holded, Sage, Anfix, Billin, entre otros) ya tienen sus integraciones certificadas y activas.
</p>

<h2>Hitos normativos hasta la fecha</h2>
<table>
  <thead>
    <tr><th>Fecha</th><th>Hito</th></tr>
  </thead>
  <tbody>
    <tr><td>Diciembre 2023</td><td>Publicación del RD 1007/2023 en el BOE</td></tr>
    <tr><td>Octubre 2024</td><td>Publicación de la OM HAC/1177/2024 con los requisitos técnicos detallados</td></tr>
    <tr><td>Julio 2025</td><td>Plazo para fabricantes de software: programas deben ser conformes</td></tr>
    <tr><td>Enero 2026</td><td>Plazo para contribuyentes: obligación en vigor para autónomos y pymes</td></tr>
  </tbody>
</table>

<h2>Aclaraciones técnicas de la AEAT</h2>
<p>
  La AEAT ha publicado diversas aclaraciones técnicas y FAQ en su portal de desarrolladores. Los puntos más destacados:
</p>
<ul>
  <li><strong>Formato de importes en la huella</strong>: los importes deben formatearse eliminando el cero final cuando el segundo decimal es cero (<code>210.0</code>, no <code>210.00</code>). Esto generó errores <code>2000</code> en muchas integraciones iniciales.</li>
  <li><strong>Encadenamiento en el primer registro</strong>: el elemento <code>PrimerRegistro</code> es obligatorio cuando no hay registro anterior. Un XML con el bloque <code>Encadenamiento</code> vacío genera el error <code>4102</code>.</li>
  <li><strong>Certificados RC2</strong>: la AEAT recomienda convertir certificados antiguos al formato AES-256 antes de intentar la integración.</li>
  <li><strong>Preproducción disponible</strong>: el entorno <code>prewww1.aeat.es</code> está disponible 24/7 para pruebas con certificado real.</li>
</ul>

<h2>¿Se esperan cambios normativos en 2026-2027?</h2>
<p>
  No hay ningún cambio normativo anunciado oficialmente. Sin embargo, es razonable esperar:
</p>
<ul>
  <li>Posibles <strong>aclaraciones sobre autofacturas y facturas simplificadas</strong> en el ámbito de Veri*Factu.</li>
  <li>Actualizaciones del esquema XSD para cubrir casos no contemplados en la versión inicial.</li>
  <li>Mayor integración entre Veri*Factu y el sistema de <strong>devoluciones de IVA</strong>: la AEAT ha mencionado la posibilidad de agilizar devoluciones para contribuyentes con buen historial en el sistema.</li>
  <li>Posible extensión del ámbito a colectivos actualmente excluidos (como algunos regímenes especiales de IVA).</li>
</ul>

<h2>Dónde seguir las novedades oficiales</h2>
<ul>
  <li><a href="https://www.agenciatributaria.es/AEAT.internet/Inicio/Ayuda/Manuales__Folletos_y_Videos/Manuales_de_ayuda_a_la_presentacion/Ejercicio_2024_y_siguientes/Verifactu/Verifactu.shtml" target="_blank" rel="noreferrer">Portal Veri*Factu de la AEAT</a>: manuales técnicos, preguntas frecuentes y esquemas XSD.</li>
  <li><strong>BOE (boe.es)</strong>: publicaciones oficiales de nuevas órdenes o modificaciones del RD.</li>
  <li><strong>Blog de Simple*Factu</strong>: actualizaciones prácticas sobre cambios que afectan a la integración.</li>
</ul>
    `.trim(),
  },

  // ── artículo 10 ─────────────────────────────────────────────────────────────
  {
    slug: "retraso-verifactu-que-ha-pasado-nuevas-fechas",
    title: "Retraso de Veri*Factu: qué ha pasado y nuevas fechas",
    excerpt:
      "Veri*Factu acumuló varios aplazamientos desde su anuncio. Repaso de la historia de los retrasos, por qué ocurrieron y dónde estamos ahora.",
    date: "2026-05-20",
    readingMinutes: 4,
    tags: ["verifactu", "retraso", "aplazamiento", "historia"],
    seoDescription:
      "Historia de los retrasos de Veri*Factu: por qué se aplazó la entrada en vigor, cuántas veces se movieron los plazos y cuál es el calendario actual en 2026.",
    content: `
<h2>El origen: una obligación que tardó en arrancar</h2>
<p>
  Veri*Factu fue anunciada originalmente como parte de la reforma de la Ley Antifraude (Ley 11/2021), que ya en 2021 prohibía los <em>programas de doble uso</em> —software que permitía llevar una contabilidad oficial y otra paralela en negro. Sin embargo, la concreción técnica tardó años en materializarse.
</p>

<h2>Cronología de los aplazamientos</h2>
<table>
  <thead>
    <tr><th>Fecha prevista inicialmente</th><th>Fecha real</th><th>Motivo del retraso</th></tr>
  </thead>
  <tbody>
    <tr>
      <td>Varios intentos 2022-2023</td>
      <td>—</td>
      <td>Falta de desarrollo reglamentario. La Ley Antifraude habilitaba la obligación pero no definía los requisitos técnicos.</td>
    </tr>
    <tr>
      <td>Finales 2023</td>
      <td>Diciembre 2023</td>
      <td>Publicación del RD 1007/2023. Primer texto legal completo con plazos concretos.</td>
    </tr>
    <tr>
      <td>Primer semestre 2024 (software)</td>
      <td>Octubre 2024</td>
      <td>La OM HAC/1177/2024 no llegó hasta octubre, dejando solo 9 meses a los fabricantes para adaptar sus programas.</td>
    </tr>
    <tr>
      <td>1 julio 2025 (software)</td>
      <td>1 julio 2025</td>
      <td>Se cumplió sin más retraso. Los fabricantes debían tener programas conformes.</td>
    </tr>
    <tr>
      <td>1 enero 2026 (contribuyentes)</td>
      <td>1 enero 2026</td>
      <td>Se cumplió. Obligación en vigor para autónomos y pymes.</td>
    </tr>
  </tbody>
</table>

<h2>¿Por qué tantos retrasos?</h2>
<p>
  Las causas fueron principalmente dos:
</p>
<ol>
  <li>
    <strong>Complejidad técnica</strong>: el sistema requería definir un protocolo SOAP, un esquema XSD, reglas de encadenamiento de huellas SHA-256 y un sistema de certificados mTLS. Coordinarlo con la infraestructura existente de la AEAT llevó más tiempo del previsto.
  </li>
  <li>
    <strong>Presión del sector del software</strong>: las asociaciones de fabricantes de software de gestión pedían más tiempo para adaptar sus productos. El mercado español de software de facturación es fragmentado, con centenares de aplicaciones distintas.
  </li>
</ol>

<h2>¿Hay más retrasos previstos?</h2>
<p>
  No. A fecha de mayo de 2026, el sistema lleva cinco meses operativo y no hay ningún nuevo aplazamiento anunciado. La obligación está en vigor y la AEAT recibe registros diariamente.
</p>
<p>
  Lo que sí puede haber son <strong>actualizaciones del esquema técnico</strong> (nuevas versiones del XSD para cubrir casos no contemplados) y posibles modificaciones normativas menores. Pero el marco general no está en revisión.
</p>

<h2>Lección para el futuro</h2>
<p>
  El patrón de retrasos de Veri*Factu es habitual en las grandes modernizaciones fiscales. El SII para grandes empresas también tuvo un periodo de adaptación. La diferencia es que ahora el sistema está activo y esperar un nuevo aplazamiento que no está anunciado expone al contribuyente a sanciones reales.
</p>
    `.trim(),
  },

  // ── artículo 11 ─────────────────────────────────────────────────────────────
  {
    slug: "hacienda-retrasa-verifactu-que-significa-para-tu-negocio",
    title: "Hacienda retrasa Veri*Factu: qué significó para tu negocio",
    excerpt:
      "Los aplazamientos de Veri*Factu dieron más tiempo para prepararse, pero también generaron confusión. Qué aprender de esa historia y cómo usarla a tu favor ahora.",
    date: "2026-05-20",
    readingMinutes: 4,
    tags: ["verifactu", "retraso", "hacienda", "autonomos", "pymes"],
    seoDescription:
      "Hacienda retrasó Veri*Factu varias veces. Qué significaron esos aplazamientos para autónomos y pymes, qué aprender y cómo estar preparado ahora que está en vigor.",
    content: `
<h2>Un retraso que confundió a muchos</h2>
<p>
  Durante 2023 y 2024, la noticia «Hacienda retrasa Veri*Factu» apareció repetidamente en la prensa económica y en los boletines de asesores fiscales. Para muchos autónomos y pymes, la reacción fue razonable: «si lo retrasan, ya me preocuparé más adelante». El problema es que ese «más adelante» llegó el 1 de enero de 2026.
</p>

<h2>Por qué los retrasos fueron una oportunidad desperdiciada</h2>
<p>
  Cada aplazamiento era en realidad tiempo extra para:
</p>
<ul>
  <li>Obtener y configurar el certificado digital FNMT (que puede tardar días si hay incidencias).</li>
  <li>Revisar si el software de facturación que usabas iba a ser conforme o necesitabas cambiar.</li>
  <li>Hablar con tu asesor sobre el impacto en tu contabilidad y flujo de trabajo.</li>
  <li>Hacer pruebas en el entorno de preproducción de la AEAT sin riesgo.</li>
</ul>
<p>
  Los negocios que usaron ese tiempo bien llegaron a enero de 2026 sin problemas. Los que esperaron al último momento tuvieron prisas, errores de configuración y, en algunos casos, facturas sin enviar a la AEAT durante las primeras semanas.
</p>

<h2>El impacto real de no estar preparado en enero de 2026</h2>
<p>
  Sin un SIF conforme, en enero de 2026 un autónomo podía seguir emitiendo facturas en PDF y enviándolas a sus clientes, pero esas facturas <strong>no estaban registradas en la AEAT</strong>. En una inspección, la discrepancia entre lo declarado en la contabilidad y lo registrado en Veri*Factu es inmediatamente visible.
</p>
<p>
  Además, las facturas emitidas sin registrar no tienen CSV ni QR. Si un cliente solicita verificar la factura en la sede electrónica de la AEAT, no encontrará nada.
</p>

<h2>Qué hacer si llevas tiempo sin registrar facturas</h2>
<p>
  Si empezaste a usar Veri*Factu tarde y tienes facturas de enero-mayo 2026 sin registrar, la situación es compleja:
</p>
<ul>
  <li>El sistema Veri*Factu <strong>no permite registrar facturas con fecha pasada</strong> de forma retroactiva sin que la AEAT detecte la anomalía (el timestamp de envío no coincide con la fecha de la factura).</li>
  <li>Lo más prudente es consultar con tu asesor fiscal para determinar el mejor camino. En algunos casos, presentar una declaración complementaria puede ser mejor que intentar subsanar los registros a posteriori en Veri*Factu.</li>
  <li>A partir de hoy, <strong>empieza a registrar todas las facturas correctamente</strong>. El daño histórico no se puede deshacer, pero detenerlo sí.</li>
</ul>

<h2>Cómo evitar estar en esta situación en el futuro</h2>
<p>
  La lección principal es no esperar a que un nuevo retraso «salve» la situación. Las obligaciones tributarias rara vez desaparecen; suelen endurecerse con el tiempo. Si en el futuro se anuncia cualquier nueva obligación relacionada con la facturación electrónica (TicketBAI en País Vasco ya es un ejemplo regional), la estrategia correcta es adaptarse antes del plazo, no después.
</p>
    `.trim(),
  },

  // ── artículo 12 ─────────────────────────────────────────────────────────────
  {
    slug: "aplazamiento-verifactu-calendario-excepciones-sii",
    title: "Aplazamiento Veri*Factu: calendario, excepciones y relación con el SII",
    excerpt:
      "Repaso de todos los aplazamientos de Veri*Factu, quién quedó exento en cada fase y la diferencia entre Veri*Factu y el SII en términos de plazos.",
    date: "2026-05-20",
    readingMinutes: 4,
    tags: ["verifactu", "aplazamiento", "sii", "plazos", "excepciones"],
    seoDescription:
      "Historial de aplazamientos de Veri*Factu, diferencias con el SII en plazos y obligados, y excepciones que se mantienen vigentes en 2026.",
    content: `
<h2>Veri*Factu y el SII: dos sistemas, dos calendarios</h2>
<p>
  Una fuente frecuente de confusión es pensar que Veri*Factu y el SII son el mismo sistema con distintos nombres. No lo son: son dos sistemas paralelos dirigidos a colectivos distintos, con plazos de entrada en vigor completamente diferentes.
</p>
<table>
  <thead>
    <tr><th>Sistema</th><th>Obligados</th><th>En vigor desde</th></tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>SII</strong> (Suministro Inmediato de Información)</td>
      <td>Grandes empresas (&gt; 6M € operaciones), grupos IVA, inscritos voluntarios</td>
      <td>Julio 2017</td>
    </tr>
    <tr>
      <td><strong>Veri*Factu</strong></td>
      <td>Autónomos y pymes no SII</td>
      <td>Enero 2026</td>
    </tr>
  </tbody>
</table>
<p>
  Si ya estás en el SII desde 2017, Veri*Factu no te aplica. Son mutuamente excluyentes.
</p>

<h2>Historial de aplazamientos de Veri*Factu</h2>
<p>
  El sistema tardó varios años en materializarse desde la aprobación de la Ley Antifraude (2021). Los hitos más relevantes:
</p>
<ul>
  <li><strong>2021-2022</strong>: La Ley 11/2021 prohíbe el software de doble uso pero no define el sistema técnico concreto. No hay plazos operativos.</li>
  <li><strong>Diciembre 2023</strong>: El RD 1007/2023 establece el primer calendario concreto: software conforme en julio 2025, contribuyentes en enero 2026.</li>
  <li><strong>Octubre 2024</strong>: La OM HAC/1177/2024 publica los requisitos técnicos detallados, dejando pocos meses a fabricantes y contribuyentes para adaptarse antes del plazo de software.</li>
  <li><strong>1 julio 2025</strong>: Plazo para fabricantes cumplido. Programas deben ser conformes.</li>
  <li><strong>1 enero 2026</strong>: Plazo para contribuyentes cumplido. Sistema en vigor.</li>
</ul>

<h2>Excepciones que se mantienen en 2026</h2>
<p>
  Los siguientes colectivos siguen sin estar obligados a Veri*Factu aunque la obligación general ya esté en vigor:
</p>
<ul>
  <li><strong>Empresas en el SII</strong>: quedan excluidas de Veri*Factu indefinidamente mientras sigan en el SII.</li>
  <li><strong>No residentes sin establecimiento permanente</strong>: fuera del ámbito del RD 1007/2023.</li>
  <li><strong>Actividades exentas de IVA sin obligación de facturar</strong>: si no emites facturas, no necesitas un SIF conforme (aunque si emites aunque sea una factura, la obligación aplica para esa factura).</li>
</ul>

<h2>¿Puede haber un nuevo aplazamiento en 2026?</h2>
<p>
  No hay ningún indicio de ello. El sistema lleva meses operativo y la AEAT no ha abierto ningún período de consulta pública ni proceso normativo que sugiera una modificación de los plazos. El escenario más probable es que los plazos vigentes se mantengan y que la vigilancia aumente gradualmente.
</p>

<h2>Lección práctica</h2>
<p>
  Si en el pasado esperaste a un aplazamiento que no llegó y ahora tienes facturas sin registrar, lee el artículo sobre <a href="/blog/hacienda-retrasa-verifactu-que-significa-para-tu-negocio">qué hacer si llevas tiempo sin registrar facturas</a>. Si acabas de empezar, el momento de integrar Veri*Factu es ahora: el sistema ya está activo y cada semana de retraso añade facturas no conformes a tu contabilidad.
</p>
    `.trim(),
  },

  // ── artículo 13 ─────────────────────────────────────────────────────────────
  {
    slug: "facturacion-verifactu-requisitos-programa-facturacion",
    title: "Facturación con Veri*Factu: requisitos de tu programa de facturación",
    excerpt:
      "Qué debe hacer tu software de facturación para cumplir con Veri*Factu: desde la generación de la huella hasta el CSV en el PDF. Lista de comprobación.",
    date: "2026-05-20",
    readingMinutes: 5,
    tags: ["verifactu", "software-facturacion", "requisitos", "sif"],
    seoDescription:
      "Requisitos técnicos y funcionales que debe cumplir tu programa de facturación para Veri*Factu: huella SHA-256, envío SOAP, CSV, QR y declaración responsable.",
    content: `
<h2>Tu programa de facturación es tu SIF</h2>
<p>
  El RD 1007/2023 llama <strong>Sistema Informático de Facturación (SIF)</strong> al conjunto de aplicaciones que soportan los procesos de facturación de tu negocio. Puede ser un software de escritorio, una aplicación en la nube, una app móvil o incluso un sistema desarrollado a medida. En todos los casos, debe cumplir los mismos requisitos.
</p>

<h2>Requisitos obligatorios</h2>

<h3>1. Generación de huella SHA-256</h3>
<p>
  Cada registro de factura debe incluir una <strong>huella criptográfica SHA-256</strong> calculada sobre los campos canónicos de la factura (NIF emisor, número de serie, fecha, tipo, importes y huella de la factura anterior). Esta huella es el elemento central del sistema de inalterabilidad.
</p>
<p>
  El formato de los importes en la cadena de cálculo tiene una regla específica: se elimina el cero final cuando el segundo decimal es cero (<code>210.0</code>, no <code>210.00</code>). Un error en este punto genera el rechazo <code>2000</code> de la AEAT.
</p>

<h3>2. Encadenamiento de registros</h3>
<p>
  La huella de cada factura debe incluir la huella de la factura anterior en la misma serie. El primer registro incluye la indicación <code>PrimerRegistro: S</code> en lugar de la huella anterior. Si el encadenamiento se rompe (por borrado o modificación de una factura intermedia), todas las huellas posteriores son inválidas.
</p>

<h3>3. Envío SOAP a la AEAT</h3>
<p>
  El software debe enviar los registros de alta y anulación al endpoint SOAP oficial de la AEAT mediante <strong>conexión mTLS con el certificado digital del contribuyente</strong>. El mensaje XML debe cumplir el esquema <code>SuministroInformacion.xsd</code>.
</p>
<p>
  El envío puede ser en tiempo real o con un máximo de <strong>4 días hábiles de retraso</strong> en el régimen de remisión voluntaria (Veri*Factu). En el régimen de suministro inmediato (similar al SII), el plazo es menor.
</p>

<h3>4. CSV y QR en el PDF</h3>
<p>
  Una vez que la AEAT acepta el registro, devuelve un <strong>CSV (Código Seguro de Verificación)</strong>. El software debe incluir este CSV y un <strong>código QR de verificación</strong> en el PDF de la factura. El QR enlaza al validador público de la AEAT.
</p>
<p>
  La leyenda <strong>VERI*FACTU</strong> también debe aparecer en el PDF cuando el sistema opera bajo este régimen.
</p>

<h3>5. Gestión de reintentos</h3>
<p>
  Si la AEAT no está disponible o responde con un error transitorio, el software debe <strong>reintentar automáticamente</strong> el envío. Un sistema que falla silenciosamente y no reintenta puede dejar facturas sin registrar sin que el usuario lo sepa.
</p>

<h3>6. Registro de eventos</h3>
<p>
  El RD 1007/2023 exige mantener un <strong>registro de eventos</strong> (altas, modificaciones de estado, anulaciones) con marca temporal. Este log es auditable en caso de inspección.
</p>

<h3>7. Prohibición de doble base de datos</h3>
<p>
  El software no puede tener modos ocultos, bases de datos paralelas ni funcionalidades que permitan ocultar o alterar facturas. Esto incluye la prohibición de borrar o modificar registros ya enviados a la AEAT sin dejar rastro.
</p>

<h2>Lista de comprobación rápida</h2>
<table>
  <thead>
    <tr><th>Requisito</th><th>¿Tu software lo cumple?</th></tr>
  </thead>
  <tbody>
    <tr><td>Genera huella SHA-256 encadenada</td><td>✓ / ✗</td></tr>
    <tr><td>Envía al SOAP de la AEAT con mTLS</td><td>✓ / ✗</td></tr>
    <tr><td>Gestiona reintentos automáticos</td><td>✓ / ✗</td></tr>
    <tr><td>Incluye CSV y QR en el PDF</td><td>✓ / ✗</td></tr>
    <tr><td>Muestra leyenda VERI*FACTU</td><td>✓ / ✗</td></tr>
    <tr><td>Mantiene log de eventos</td><td>✓ / ✗</td></tr>
    <tr><td>Tiene declaración responsable del fabricante</td><td>✓ / ✗</td></tr>
  </tbody>
</table>

<h2>La declaración responsable: tu documento de protección</h2>
<p>
  El artículo 8 del RD 1007/2023 obliga al fabricante del software a emitir una <strong>declaración responsable de conformidad</strong>. Pídela a tu proveedor. Sin ella, en caso de inspección, no tienes documentación que acredite que tu software cumplía los requisitos en el momento en que emitiste las facturas.
</p>
    `.trim(),
  },

  // ── artículo 14 ─────────────────────────────────────────────────────────────
  {
    slug: "sistema-verifactu-sif-que-debe-cumplir-tu-software",
    title: "Sistema Veri*Factu (SIF): qué debe cumplir tu software",
    excerpt:
      "El SIF es el nombre técnico de tu programa de facturación según el RD 1007/2023. Qué requisitos debe cumplir, cómo verificarlo y qué documentos pedir al fabricante.",
    date: "2026-05-20",
    readingMinutes: 5,
    tags: ["verifactu", "sif", "software", "requisitos", "cumplimiento"],
    seoDescription:
      "Qué es el SIF (Sistema Informático de Facturación) de Veri*Factu, qué requisitos técnicos y funcionales debe cumplir según el RD 1007/2023 y la OM HAC/1177/2024.",
    content: `
<h2>¿Qué es exactamente el SIF?</h2>
<p>
  El <strong>Sistema Informático de Facturación (SIF)</strong> es el término legal que el RD 1007/2023 usa para referirse al software que genera, gestiona y envía las facturas de un contribuyente. No es una certificación ni un sello: es simplemente el nombre que la normativa da a cualquier programa de facturación que opere bajo las reglas de Veri*Factu.
</p>
<p>
  Tu programa de facturación —sea un SaaS en la nube, un software de escritorio o un sistema propio desarrollado por tu empresa— es tu SIF. Y debe cumplir los requisitos del RD 1007/2023 y la OM HAC/1177/2024.
</p>

<h2>Clasificación de los requisitos</h2>
<p>
  La normativa agrupa los requisitos en tres bloques:
</p>

<h3>Bloque A: Integridad e inalterabilidad</h3>
<p>
  El SIF debe garantizar que los registros de facturación no pueden ser modificados ni eliminados una vez generados, sin dejar rastro. Esto se implementa mediante:
</p>
<ul>
  <li><strong>Huella SHA-256 encadenada</strong>: cada registro tiene una huella que depende del registro anterior. Modificar uno invalida todos los posteriores.</li>
  <li><strong>Prohibición de doble base de datos</strong>: no puede existir ningún mecanismo para tener una facturación «real» y una facturación «oficial» distintas.</li>
  <li><strong>Registro de eventos</strong>: el sistema debe registrar todos los eventos relevantes (creación, modificación de estado, envío, recepción de respuesta AEAT) con marca temporal.</li>
</ul>

<h3>Bloque B: Remisión a la AEAT</h3>
<p>
  El SIF debe enviar los registros a la AEAT cumpliendo:
</p>
<ul>
  <li><strong>Protocolo SOAP</strong> con el esquema XML <code>SuministroInformacion.xsd</code> oficial.</li>
  <li><strong>Conexión mTLS</strong> con el certificado digital PKCS#12 del contribuyente.</li>
  <li><strong>Plazos de envío</strong>: en el régimen voluntario (Veri*Factu), máximo 4 días hábiles desde la expedición.</li>
  <li><strong>Identificación del SIF</strong>: el mensaje debe incluir el bloque <code>SistemaInformatico</code> con el NIF del fabricante, nombre, versión e ID del sistema.</li>
</ul>

<h3>Bloque C: Información al usuario y receptor</h3>
<ul>
  <li>El <strong>PDF de la factura</strong> debe incluir el CSV devuelto por la AEAT y el código QR de verificación.</li>
  <li>La leyenda <strong>VERI*FACTU</strong> debe aparecer cuando el sistema opera en modo voluntario.</li>
  <li>El usuario debe poder consultar el estado de cada registro (Correcto, ParcialmenteCorrecto, Incorrecto) y los errores asociados.</li>
</ul>

<h2>La identificación del SIF: el bloque SistemaInformatico</h2>
<p>
  Cada mensaje enviado a la AEAT debe incluir un bloque <code>SistemaInformatico</code> que identifica al fabricante del software. Los campos obligatorios son:
</p>
<ul>
  <li><code>NombreRazon</code>: razón social del fabricante.</li>
  <li><code>NIF</code>: NIF del fabricante (debe ser real y existir en el censo de la AEAT).</li>
  <li><code>NombreSistemaInformatico</code>: nombre comercial del programa.</li>
  <li><code>IdSistemaInformatico</code>: identificador único asignado por el fabricante.</li>
  <li><code>Version</code>: versión del software.</li>
  <li><code>TipoUsoPosibleSoloVerifactu</code>: si el sistema solo opera en modo Veri*Factu (<code>S/N</code>).</li>
</ul>
<p>
  El <code>NumeroInstalacion</code> se genera automáticamente a partir de la combinación NIF emisor + ID sistema + NIF fabricante. Es permanente: si cualquiera de estos tres datos cambia, se genera un nuevo número de instalación y la cadena anterior queda huérfana.
</p>

<h2>Cómo verificar que tu software cumple</h2>
<ol>
  <li><strong>Pide la declaración responsable</strong> al fabricante (art. 8 RD 1007/2023). Es el documento que certifica el cumplimiento.</li>
  <li><strong>Verifica en producción</strong>: envía una factura real y comprueba que recibes un CSV de la AEAT y que el PDF incluye QR.</li>
  <li><strong>Revisa los errores recientes</strong>: si tienes facturas con estado <em>Incorrecto</em> en el sistema, investiga el código de error. Errores sistemáticos (4102, 4116) indican problemas de configuración o software no conforme.</li>
  <li><strong>Comprueba el encadenamiento</strong>: el panel de administración de tu software debería permitirte verificar que la cadena de huellas está íntegra.</li>
</ol>

<h2>¿Qué pasa si el software no cumple?</h2>
<p>
  Si el SIF que usas no cumple los requisitos, la responsabilidad recae principalmente en el <strong>fabricante</strong> (sanciones del art. 201 bis LGT hasta 150.000 €/ejercicio). Pero si el usuario usa conscientemente un software no conforme, también puede ser sancionado. La declaración responsable del fabricante es la prueba de buena fe del usuario.
</p>
    `.trim(),
  },

  // ── artículo 15 ─────────────────────────────────────────────────────────────
  {
    slug: "que-es-el-verifactu-resumen-5-minutos",
    title: "Qué es el Veri*Factu: resumen en 5 minutos",
    excerpt:
      "Todo lo esencial sobre Veri*Factu en un solo artículo: qué es, quién está obligado, cómo funciona y qué necesitas para cumplir. Sin tecnicismos.",
    date: "2026-05-20",
    readingMinutes: 5,
    tags: ["verifactu", "resumen", "guia", "autonomos", "pymes"],
    seoDescription:
      "Qué es Veri*Factu: resumen completo en 5 minutos. Definición, obligados, cómo funciona, plazos y qué necesitas para cumplir con la AEAT en 2026.",
    content: `
<h2>Veri*Factu en una frase</h2>
<p>
  Veri*Factu es el sistema por el que <strong>tu programa de facturación envía cada factura a la Agencia Tributaria en tiempo real</strong>, con una firma criptográfica que hace imposible modificarla después sin que Hacienda lo detecte.
</p>

<h2>¿Por qué existe?</h2>
<p>
  Para acabar con el fraude fiscal vinculado a la manipulación de facturas: borrar ingresos, duplicar gastos o llevar dos contabilidades paralelas. Con Veri*Factu, cada factura queda registrada en la AEAT en el momento de emitirla. No hay vuelta atrás.
</p>

<h2>¿A quién afecta?</h2>
<ul>
  <li><strong>Autónomos</strong> en estimación directa (normal o simplificada). ✓ Obligados.</li>
  <li><strong>Sociedades</strong> (SL, SA…) con facturación inferior a 6 millones de euros anuales. ✓ Obligadas.</li>
  <li><strong>Grandes empresas</strong> en el SII (&gt; 6M €). ✗ Ya tienen un sistema equivalente.</li>
  <li><strong>Autónomos en módulos</strong> que no emiten facturas a empresas. ✗ Sin efecto práctico.</li>
</ul>

<h2>¿Desde cuándo es obligatorio?</h2>
<ul>
  <li><strong>Fabricantes de software</strong>: desde el 1 de julio de 2025.</li>
  <li><strong>Autónomos y pymes</strong>: desde el 1 de enero de 2026. Ya está en vigor.</li>
</ul>

<h2>¿Qué necesitas para cumplir?</h2>
<ol>
  <li>
    <strong>Certificado digital</strong>: el .pfx o .p12 de la FNMT que ya usas para trámites con la AEAT. Debe incluir la clave privada.
  </li>
  <li>
    <strong>Programa de facturación conforme</strong>: uno que envíe automáticamente cada factura a la AEAT y te devuelva el CSV de verificación.
  </li>
  <li>
    <strong>Tu NIF correcto</strong>: debe coincidir exactamente con el del certificado.
  </li>
</ol>

<h2>Cómo funciona en la práctica</h2>
<ol>
  <li>Creas una factura en tu programa.</li>
  <li>El software calcula una huella SHA-256 y la encadena con la factura anterior.</li>
  <li>Envía un mensaje XML a la AEAT mediante conexión segura con tu certificado.</li>
  <li>La AEAT responde con un <strong>CSV</strong> (Código Seguro de Verificación) y el estado: <em>Correcto</em> o <em>Incorrecto</em>.</li>
  <li>El CSV y un <strong>código QR</strong> aparecen en el PDF de la factura. Tu cliente puede verificarla escaneando el QR.</li>
</ol>

<h2>¿Qué pasa si no cumples?</h2>
<p>
  Sanciones de hasta <strong>150.000 € por ejercicio</strong> para el fabricante del software no conforme, y hasta <strong>50.000 €</strong> para el usuario que lo usa conscientemente (art. 201 bis LGT).
</p>

<h2>Preguntas frecuentes</h2>
<p><strong>¿Tengo que hacer algo diferente con mis facturas?</strong> No para el cliente. El PDF que recibirá incluirá el CSV y el QR, pero por lo demás es una factura normal.</p>
<p><strong>¿Y las facturas a particulares?</strong> También se envían a la AEAT. El particular puede verificarlas, aunque en la práctica pocos lo hacen.</p>
<p><strong>¿Qué pasa si la AEAT falla?</strong> Un buen programa reintenta automáticamente. La factura ya existe en tu sistema; el registro en la AEAT se completa cuando la conexión se restablece.</p>
<p><strong>¿Necesito conservar las facturas en papel?</strong> Si usas Veri*Factu, la AEAT tiene los registros. La normativa prevé exonerarte de la obligación de conservar las facturas emitidas para el período cubierto por Veri*Factu.</p>

<h2>El siguiente paso</h2>
<p>
  Si aún no tienes un programa de facturación conforme, el momento de actuar es ahora. Prueba Simple*Factu, configura tu certificado en menos de 10 minutos y envía tu primera factura a la AEAT con todo en orden.
</p>
    `.trim(),
  },

  // ── artículo 16 ─────────────────────────────────────────────────────────────
  {
    slug: "odoo-verifactu-integracion-modulos-cumplimiento",
    title: "Odoo y Veri*Factu: integración, módulos y cumplimiento",
    excerpt:
      "Si usas Odoo como ERP, necesitas un módulo o conector que gestione el envío a Veri*Factu. Opciones disponibles, cómo funciona la integración y qué verificar.",
    date: "2026-05-20",
    readingMinutes: 5,
    tags: ["verifactu", "odoo", "erp", "integracion", "modulos"],
    seoDescription:
      "Cómo integrar Veri*Factu con Odoo: módulos disponibles, opciones de conector API y qué comprobar para garantizar el cumplimiento con el RD 1007/2023.",
    content: `
<h2>Odoo y Veri*Factu: la situación actual</h2>
<p>
  Odoo es uno de los ERP más usados por pymes en España. La integración con Veri*Factu no viene de fábrica en todas las versiones: depende de la versión de Odoo, del módulo de facturación que uses y del proveedor que lo haya desarrollado.
</p>
<p>
  En términos generales, hay tres caminos para integrar Odoo con Veri*Factu:
</p>

<h3>Opción 1: Módulo oficial de la comunidad Odoo</h3>
<p>
  La comunidad de Odoo (OCA — Odoo Community Association) y algunos partners han desarrollado módulos de localización española que incluyen soporte para Veri*Factu. Estos módulos se instalan directamente en tu instancia de Odoo y gestionan el cálculo de la huella, la conexión SOAP y el CSV.
</p>
<p><strong>Ventaja:</strong> integración nativa en Odoo, sin sistemas externos.<br />
<strong>Riesgo:</strong> debes verificar que el módulo está actualizado y cumple exactamente el esquema XSD de la AEAT. No todos los módulos de la comunidad han sido probados exhaustivamente en producción.</p>

<h3>Opción 2: Conector con una API externa</h3>
<p>
  En lugar de implementar toda la lógica Veri*Factu dentro de Odoo, puedes usar un conector que envíe los datos de la factura a un servicio API especializado (como Simple*Factu API) que gestiona la huella, el SOAP y la comunicación con la AEAT.
</p>
<p><strong>Ventaja:</strong> el servicio API se mantiene actualizado con los cambios normativos. Tu Odoo solo necesita enviar los datos de la factura en un formato estándar.<br />
<strong>Riesgo:</strong> dependencia de un servicio externo; latencia adicional en el envío.</p>

<h3>Opción 3: Integración a medida</h3>
<p>
  Si tienes un partner de Odoo que desarrolla a medida, puede implementar directamente la integración con Veri*Factu usando las librerías SOAP de Python y el certificado mTLS. Es el camino más flexible pero el más costoso en tiempo de desarrollo y mantenimiento.
</p>

<h2>Qué debe hacer cualquier integración Odoo-Veri*Factu</h2>
<ol>
  <li>Interceptar el evento de validación de factura en Odoo (cuando el usuario confirma la factura).</li>
  <li>Calcular la huella SHA-256 encadenada con la factura anterior de la misma serie.</li>
  <li>Construir el mensaje XML SOAP según el esquema de la AEAT.</li>
  <li>Enviarlo mediante mTLS con el certificado del contribuyente.</li>
  <li>Guardar el CSV y el estado en los campos de la factura de Odoo.</li>
  <li>Generar el PDF con el CSV, QR y la leyenda VERI*FACTU.</li>
</ol>

<h2>Puntos críticos a verificar</h2>
<ul>
  <li><strong>Formato de importes en la huella</strong>: el error más común en integraciones Odoo. El número <code>210</code> debe formatearse como <code>210.0</code>, no <code>210.00</code>. Si el módulo usa <code>toFixed(2)</code> o el equivalente Python sin el ajuste correcto, todas las huellas serán incorrectas (error AEAT <code>2000</code>).</li>
  <li><strong>Encadenamiento correcto</strong>: el módulo debe gestionar correctamente el primer registro de cada serie (<code>PrimerRegistro: S</code>) y los siguientes.</li>
  <li><strong>Gestión de reintentos</strong>: Odoo no tiene por defecto un sistema de jobs con reintentos. Verifica que la integración reintenta automáticamente si la AEAT está caída.</li>
  <li><strong>Declaración responsable</strong>: si el módulo lo desarrolló un partner, ese partner debe emitir la declaración responsable del art. 8 RD 1007/2023.</li>
</ul>

<h2>Simple*Factu API como backend para Odoo</h2>
<p>
  Una alternativa es configurar Odoo para que, al confirmar una factura, llame a la API de Simple*Factu con los datos de la factura. Simple*Factu gestiona toda la lógica Veri*Factu (huella, SOAP, reintentos, CSV) y devuelve el CSV para que Odoo lo guarde en la factura. Esta arquitectura simplifica el módulo de Odoo: solo necesita hacer una llamada HTTP REST, sin implementar SOAP ni certificados mTLS directamente.
</p>
    `.trim(),
  },

  // ── artículo 17 ─────────────────────────────────────────────────────────────
  {
    slug: "factusol-verifactu-compatibilidad-migracion",
    title: "FactuSOL y Veri*Factu: compatibilidad y migración",
    excerpt:
      "FactuSOL es uno de los programas de facturación gratuitos más usados en España. ¿Es compatible con Veri*Factu? Qué versión necesitas y cómo migrar si no lo es.",
    date: "2026-05-20",
    readingMinutes: 4,
    tags: ["verifactu", "factusol", "software", "migracion", "compatibilidad"],
    seoDescription:
      "FactuSOL y Veri*Factu: compatibilidad, qué versión necesitas, cómo verificar que cumple el RD 1007/2023 y opciones de migración si tu versión no es conforme.",
    content: `
<h2>FactuSOL y la adaptación a Veri*Factu</h2>
<p>
  FactuSOL (de Software DELSOL) es uno de los programas de gestión empresarial y facturación más populares en España, en parte por ofrecer una versión gratuita funcional. Ante la entrada en vigor de Veri*Factu, Software DELSOL ha trabajado en adaptar sus productos para cumplir el RD 1007/2023.
</p>
<p>
  La compatibilidad con Veri*Factu <strong>depende de la versión que tengas instalada</strong>. Las versiones más antiguas pueden no incluir el módulo de envío a la AEAT.
</p>

<h2>Cómo verificar si tu versión de FactuSOL cumple</h2>
<ol>
  <li><strong>Comprueba la versión instalada</strong>: en el menú Ayuda → Acerca de, verifica el número de versión.</li>
  <li><strong>Busca el módulo Veri*Factu</strong>: en una versión conforme, debería existir una opción de configuración para el certificado digital y el envío a la AEAT.</li>
  <li><strong>Solicita la declaración responsable</strong> a Software DELSOL. Esta declaración (art. 8 RD 1007/2023) confirma que la versión que usas cumple los requisitos técnicos.</li>
  <li><strong>Verifica en producción</strong>: envía una factura de prueba y comprueba que recibes un CSV de la AEAT y que el PDF incluye el QR de verificación.</li>
</ol>

<h2>Pasos para actualizar FactuSOL</h2>
<p>
  Si tienes una versión antigua:
</p>
<ol>
  <li>Descarga la última versión desde la web oficial de Software DELSOL.</li>
  <li>Antes de actualizar, <strong>haz una copia de seguridad completa</strong> de tu base de datos de FactuSOL.</li>
  <li>Instala la actualización y verifica que la base de datos se migra correctamente.</li>
  <li>Configura el certificado digital en la sección de Veri*Factu del programa.</li>
  <li>Realiza una prueba con una factura real en el entorno de preproducción de la AEAT si el programa lo permite.</li>
</ol>

<h2>¿Qué pasa con las facturas anteriores a la actualización?</h2>
<p>
  Las facturas emitidas antes de configurar Veri*Factu en FactuSOL no están registradas en la AEAT. No es posible registrarlas retroactivamente de forma automática. Si tienes facturas sin registrar de 2026, consulta con tu asesor fiscal la mejor forma de gestionar la situación.
</p>

<h2>Alternativas si FactuSOL no se adapta a tus necesidades</h2>
<p>
  Si FactuSOL no cubre tus necesidades (por volumen, por funcionalidades de Veri*Factu o por integraciones con otros sistemas), considera:
</p>
<ul>
  <li><strong>Simple*Factu</strong>: SaaS en la nube con API, sin instalación local. Útil si tienes un sistema ERP propio o quieres integrar vía API.</li>
  <li><strong>Holded</strong>: ERP en la nube con módulo de facturación electrónica.</li>
  <li><strong>Billin</strong>: software de facturación en la nube con soporte Veri*Factu.</li>
</ul>
<p>
  En cualquier migración, asegúrate de <strong>exportar el histórico de facturas</strong> de FactuSOL antes de cambiar de sistema. El historial de facturas es un documento contable obligatorio independientemente de Veri*Factu.
</p>
    `.trim(),
  },

  // ── artículo 18 ─────────────────────────────────────────────────────────────
  {
    slug: "contasimple-verifactu-diferencias-cuando-usar-cada-uno",
    title: "ContaSimple y Veri*Factu: diferencias y cuándo usar cada uno",
    excerpt:
      "ContaSimple es una herramienta de contabilidad y facturación para autónomos. ¿Es lo mismo que Simple*Factu? ¿Cuál cumple mejor con Veri*Factu para tu negocio?",
    date: "2026-05-20",
    readingMinutes: 4,
    tags: ["verifactu", "contasimple", "comparativa", "software", "autonomos"],
    seoDescription:
      "ContaSimple vs Simple*Factu para Veri*Factu: diferencias, casos de uso y cuál elegir según el tipo de negocio y necesidades de integración con la AEAT.",
    content: `
<h2>ContaSimple y Simple*Factu: dos productos distintos</h2>
<p>
  Antes de cualquier comparativa: <strong>ContaSimple y Simple*Factu son productos completamente distintos</strong> de empresas distintas. No hay relación entre ellos. La similitud en los nombres puede generar confusión en búsquedas.
</p>
<ul>
  <li><strong>ContaSimple</strong>: software de contabilidad y facturación en la nube para autónomos y pymes, con funcionalidades de contabilidad, declaraciones fiscales y gestión de gastos.</li>
  <li><strong>Simple*Factu</strong>: servicio especializado en la integración con Veri*Factu (AEAT), accesible vía API o panel web, sin módulo de contabilidad completa.</li>
</ul>

<h2>ContaSimple y Veri*Factu</h2>
<p>
  ContaSimple ha ido incorporando el cumplimiento con Veri*Factu en sus planes. Para verificar si tu plan actual incluye el envío a la AEAT:
</p>
<ol>
  <li>Accede a la sección de Configuración → Facturación electrónica en ContaSimple.</li>
  <li>Comprueba si existe la opción de configurar el certificado digital para Veri*Factu.</li>
  <li>Emite una factura de prueba y verifica que recibes un CSV de la AEAT.</li>
  <li>Solicita a ContaSimple la declaración responsable de conformidad con el RD 1007/2023.</li>
</ol>
<p>
  Si tu plan de ContaSimple no incluye Veri*Factu, es posible que necesites actualizar a un plan superior o añadir un módulo adicional.
</p>

<h2>Cuándo usar ContaSimple</h2>
<p>
  ContaSimple es una buena opción si:
</p>
<ul>
  <li>Necesitas <strong>contabilidad completa</strong> además de facturación: libro diario, balance, cuenta de pérdidas y ganancias.</li>
  <li>Quieres gestionar <strong>declaraciones fiscales</strong> (IVA, IRPF, IS) desde la misma herramienta.</li>
  <li>Tu volumen de facturas es <strong>moderado</strong> y no necesitas acceso API para integraciones externas.</li>
  <li>Prefieres una solución <strong>todo en uno</strong> para un autónomo sin sistema ERP.</li>
</ul>

<h2>Cuándo usar Simple*Factu</h2>
<p>
  Simple*Factu es más adecuado si:
</p>
<ul>
  <li>Ya tienes un ERP o sistema propio y solo necesitas el <strong>componente Veri*Factu</strong> como servicio.</li>
  <li>Necesitas acceso <strong>API</strong> para integrar Veri*Factu en tu flujo de trabajo automatizado.</li>
  <li>Quieres un sistema especializado en Veri*Factu con <strong>máximo control técnico</strong>: cadena de huellas, ledger inmutable, histórico de registros AEAT.</li>
  <li>Tu negocio tiene un volumen alto de facturas y necesitas <strong>gestión de reintentos, jobs asíncronos</strong> y monitorización operativa.</li>
</ul>

<h2>Comparativa rápida</h2>
<table>
  <thead>
    <tr><th>Criterio</th><th>ContaSimple</th><th>Simple*Factu</th></tr>
  </thead>
  <tbody>
    <tr><td>Contabilidad completa</td><td>Sí</td><td>No</td></tr>
    <tr><td>Declaraciones fiscales</td><td>Sí</td><td>No</td></tr>
    <tr><td>Envío Veri*Factu</td><td>Sí (según plan)</td><td>Sí (todos los planes)</td></tr>
    <tr><td>Acceso API REST</td><td>Limitado</td><td>Sí, completo</td></tr>
    <tr><td>Ledger inmutable de registros AEAT</td><td>Básico</td><td>Completo con auditoría</td></tr>
    <tr><td>Gestión de reintentos automáticos</td><td>Depende del plan</td><td>Sí, con backoff exponencial</td></tr>
    <tr><td>Precio base</td><td>Desde ~7€/mes</td><td>Plan gratuito disponible</td></tr>
  </tbody>
</table>

<h2>La recomendación práctica</h2>
<p>
  Si eres autónomo y buscas <strong>una sola herramienta</strong> que cubra contabilidad, declaraciones y facturación electrónica, ContaSimple (o alternativas como Holded o Anfix) es una opción razonable siempre que verifiques que su módulo Veri*Factu está activo en tu plan.
</p>
<p>
  Si ya tienes un programa de contabilidad y solo necesitas añadir Veri*Factu, o si tienes un sistema propio que necesita integrarse vía API, Simple*Factu cubre exactamente ese caso sin añadir capas innecesarias.
</p>
    `.trim(),
  },
];

export function getArticle(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

export function getAllSlugs(): string[] {
  return articles.map((a) => a.slug);
}

export function formatArticleDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
