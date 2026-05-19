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
