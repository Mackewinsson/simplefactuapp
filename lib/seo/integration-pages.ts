import { buildBreadcrumbSchema, type FAQItem } from "./schema";
import { canonicalUrl, getSiteUrl } from "./site-url";

export type IntegrationSlug =
  | "factusol-verifactu"
  | "contasimple-verifactu"
  | "odoo-verifactu";

export type IntegrationFeature = {
  title: string;
  body: string;
};

export type IntegrationPageContent = {
  slug: IntegrationSlug;
  path: string;
  navLabel: string;
  badge: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
  about: string[];
  features: IntegrationFeature[];
  steps: IntegrationFeature[];
  codeTitle: string;
  codeSample: string;
  comparisonTitle?: string;
  comparisonRows?: { criterion: string; left: string; right: string }[];
  comparisonLeftHeader?: string;
  comparisonRightHeader?: string;
  faqs: FAQItem[];
  relatedBlogSlug: string;
  relatedBlogLabel: string;
  softwareName: string;
  softwareDescription: string;
};

export const INTEGRATION_PAGES: IntegrationPageContent[] = [
  {
    slug: "factusol-verifactu",
    path: "/integraciones/factusol-verifactu",
    navLabel: "FactuSOL",
    badge: "Integración API · FactuSOL",
    title: "API FactuSOL Veri*Factu",
    metaTitle: "API FactuSOL Veri*Factu | Integra con AEAT en minutos",
    metaDescription:
      "Conecta FactuSOL (o tu ERP) a Veri*Factu con nuestra API REST. Huella SHA-256, SOAP AEAT y CSV sin montar mTLS. Docs + sandbox gratis.",
    h1: "API Veri*Factu para FactuSOL",
    intro:
      "FactuSOL no expone una API pública completa para Veri*Factu. Simple*Factu actúa como capa REST: tu conector o ERP envía la factura y nosotros gestionamos huella, SOAP AEAT, reintentos y CSV.",
    about: ["FactuSOL", "Veri*Factu", "API de facturación electrónica"],
    features: [
      {
        title: "Sin SOAP ni mTLS en tu lado",
        body: "Llamas a endpoints REST. El WSDL VeriFactuSOAP, el certificado y los reintentos los gestionamos nosotros.",
      },
      {
        title: "Compatible con FactuSOL u otro ERP",
        body: "No sustituye obligatoriamente FactuSOL: puedes usarlo como motor Veri*Factu detrás de tu flujo actual.",
      },
      {
        title: "Jobs, webhooks y CSV",
        body: "Estado asíncrono, notificaciones y código seguro de verificación listos para guardar en tu sistema.",
      },
    ],
    steps: [
      {
        title: "Crea una cuenta y obtén la API key",
        body: "Regístrate, configura el certificado del emisor y genera la clave en el panel o vía partner.",
      },
      {
        title: "Envía la factura por REST",
        body: "POST con NIF, serie, importes y líneas. Validamos el desglose antes de hablar con la AEAT.",
      },
      {
        title: "Recibe CSV, QR y estado",
        body: "Consulta el job o recibe el webhook. Devuelve el PDF con QR VERI*FACTU a tu cliente.",
      },
    ],
    codeTitle: "Ejemplo: alta de factura Veri*Factu (REST)",
    codeSample: `curl -X POST https://api.simplefactu.com/v1/invoices \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "series": "A",
    "number": "1001",
    "issueDate": "2026-08-03",
    "recipient": { "nif": "B12345678", "name": "Cliente SL" },
    "lines": [
      { "description": "Servicio", "quantity": 1, "unitPrice": 100, "taxRate": 21 }
    ]
  }'`,
    comparisonTitle: "Módulo FactuSOL vs API Simple*Factu",
    comparisonLeftHeader: "FactuSOL nativo",
    comparisonRightHeader: "Simple*Factu API",
    comparisonRows: [
      {
        criterion: "API REST documentada",
        left: "No (uso de escritorio)",
        right: "Sí, completa",
      },
      {
        criterion: "Integración con ERP propio",
        left: "Limitada",
        right: "Diseñado para ello",
      },
      {
        criterion: "SOAP / mTLS AEAT",
        left: "Dentro del programa",
        right: "Abstraído por la API",
      },
      {
        criterion: "Webhooks de estado",
        left: "No",
        right: "Sí",
      },
      {
        criterion: "Sandbox para developers",
        left: "Según versión",
        right: "Incluido",
      },
    ],
    faqs: [
      {
        question: "¿Existe una API oficial de FactuSOL para Veri*Factu?",
        answer:
          "FactuSOL no expone una API pública completa para Veri*Factu. Simple*Factu actúa como capa API REST: tu sistema (o un conector) envía la factura y nosotros gestionamos huella, SOAP AEAT y CSV.",
      },
      {
        question: "¿Puedo integrar FactuSOL con Veri*Factu sin implementar SOAP?",
        answer:
          "Sí. Con Simple*Factu solo llamas a endpoints REST; el protocolo SOAP, mTLS y reintentos los gestionamos nosotros.",
      },
      {
        question: "¿Simple*Factu sustituye a FactuSOL?",
        answer:
          "No necesariamente. Puedes seguir usando FactuSOL u otro ERP y usar Simple*Factu solo como motor Veri*Factu vía API.",
      },
      {
        question: "¿Sirve también si busco «FactuSOL API» o «API FactuSOL»?",
        answer:
          "Sí. Esta página está pensada para developers que buscan una API para conectar FactuSOL (o un sistema similar) con Veri*Factu y la AEAT.",
      },
    ],
    relatedBlogSlug: "factusol-verifactu-compatibilidad-migracion",
    relatedBlogLabel: "Guía: FactuSOL y Veri*Factu (compatibilidad)",
    softwareName: "Simple*Factu API — Integración FactuSOL Veri*Factu",
    softwareDescription:
      "API REST para conectar FactuSOL y ERPs con Veri*Factu (AEAT): huella, encadenamiento, SOAP y CSV.",
  },
  {
    slug: "contasimple-verifactu",
    path: "/integraciones/contasimple-verifactu",
    navLabel: "ContaSimple",
    badge: "Integración API · ContaSimple",
    title: "ContaSimple API Veri*Factu",
    metaTitle: "ContaSimple API Veri*Factu | Alternativa REST para AEAT",
    metaDescription:
      "¿Buscas API de ContaSimple para Veri*Factu? Integra facturación electrónica con Simple*Factu: REST, webhooks, CSV y envío AEAT sin SOAP. Sandbox gratis.",
    h1: "API ContaSimple Veri*Factu: cuándo integrar por API",
    intro:
      "ContaSimple y Simple*Factu son productos distintos. Si necesitas una API REST completa para Veri*Factu (más allá del acceso limitado de ContaSimple), esta es la ruta para developers y sistemas a medida.",
    about: ["ContaSimple", "Veri*Factu", "API REST"],
    features: [
      {
        title: "API REST completa",
        body: "Emisión, anulación, registros y webhooks pensados para automatizar Veri*Factu en tu stack.",
      },
      {
        title: "Sin confundir marcas",
        body: "No somos ContaSimple. Ofrecemos el motor Veri*Factu cuando tu caso exige integración técnica.",
      },
      {
        title: "Complemento o alternativa",
        body: "Úsalo si ContaSimple no cubre tu volumen, automatización o acceso API.",
      },
    ],
    steps: [
      {
        title: "Evalúa si necesitas API",
        body: "Si solo facturas a mano en la nube, ContaSimple puede bastar. Si automatizas, necesitas API.",
      },
      {
        title: "Conecta tu certificado",
        body: "Sube el certificado del obligado tributario. Queda cifrado; el envío AEAT lo hacemos nosotros.",
      },
      {
        title: "Integra desde tu backend",
        body: "POST de facturas, jobs asíncronos y webhooks de aceptación/rechazo AEAT.",
      },
    ],
    codeTitle: "Ejemplo: consulta de estado del envío",
    codeSample: `curl https://api.simplefactu.com/v1/jobs/JOB_ID \\
  -H "Authorization: Bearer YOUR_API_KEY"

# Respuesta típica:
# { "status": "SUCCEEDED", "csv": "...", "qrUrl": "https://..." }`,
    comparisonTitle: "ContaSimple vs Simple*Factu API",
    comparisonLeftHeader: "ContaSimple",
    comparisonRightHeader: "Simple*Factu",
    comparisonRows: [
      {
        criterion: "Contabilidad completa",
        left: "Sí",
        right: "No (foco Veri*Factu)",
      },
      {
        criterion: "Envío Veri*Factu",
        left: "Según plan",
        right: "Todos los planes",
      },
      {
        criterion: "API REST",
        left: "Limitada",
        right: "Completa",
      },
      {
        criterion: "Webhooks / jobs",
        left: "Limitado",
        right: "Sí",
      },
      {
        criterion: "Ideal para",
        left: "Autónomo todo-en-uno",
        right: "Devs / ERP / automatización",
      },
    ],
    faqs: [
      {
        question: "¿ContaSimple tiene API para Veri*Factu?",
        answer:
          "El acceso API de ContaSimple es limitado según plan. Si necesitas una API REST completa para emitir, anular y monitorizar registros Veri*Factu, Simple*Factu está diseñado para ese caso.",
      },
      {
        question: "¿Simple*Factu es lo mismo que ContaSimple?",
        answer:
          "No. Son productos distintos. ContaSimple es contabilidad + facturación; Simple*Factu es infraestructura Veri*Factu (SaaS + API).",
      },
      {
        question: "¿Puedo usar Simple*Factu como alternativa a ContaSimple?",
        answer:
          "Si tu necesidad principal es cumplir Veri*Factu e integrar por API, sí. Si necesitas contabilidad y modelos fiscales completos en la misma herramienta, ContaSimple puede seguir siendo mejor encaje.",
      },
    ],
    relatedBlogSlug: "contasimple-verifactu-diferencias-cuando-usar-cada-uno",
    relatedBlogLabel: "Comparativa ContaSimple vs Simple*Factu",
    softwareName:
      "Simple*Factu API — Alternativa / complemento ContaSimple Veri*Factu",
    softwareDescription:
      "API Veri*Factu para quien necesita más integración que ContaSimple: REST, jobs, webhooks y cumplimiento RD 1007/2023.",
  },
  {
    slug: "odoo-verifactu",
    path: "/integraciones/odoo-verifactu",
    navLabel: "Odoo",
    badge: "Integración API · Odoo / OCA",
    title: "Odoo Veri*Factu (OCA y API)",
    metaTitle: "Odoo Veri*Factu: módulo OCA o API REST (guía)",
    metaDescription:
      "Integra Odoo con Veri*Factu vía módulo OCA o conector API. Evita SOAP/mTLS en tu ERP: huella, CSV y AEAT gestionados. Ejemplo de flujo listo.",
    h1: "Integración Odoo Veri*Factu (OCA y API REST)",
    intro:
      "Puedes usar un módulo OCA/community o un conector HTTP a Simple*Factu. La segunda opción evita implementar el endpoint SOAP de la AEAT (VeriFactuSOAP), mTLS y el formato de huella dentro de Odoo.",
    about: ["Odoo", "OCA", "Veri*Factu", "SIF"],
    features: [
      {
        title: "OCA o API externa",
        body: "Elige módulo nativo o conector REST. La API reduce mantenimiento normativo en tu instancia.",
      },
      {
        title: "Abstracción del SOAP AEAT",
        body: "El WSDL oficial es complejo. Tu Odoo solo hace HTTP; nosotros hablamos con Hacienda.",
      },
      {
        title: "SIF / SI ID correctos",
        body: "Identificación del sistema informático de facturación alineada con RD 1007/2023.",
      },
    ],
    steps: [
      {
        title: "Al confirmar la factura en Odoo",
        body: "Un hook (account.move) envía los datos a Simple*Factu por REST.",
      },
      {
        title: "Procesamos Veri*Factu",
        body: "Huella SHA-256 encadenada, XML SOAP, mTLS y reintentos ante la AEAT.",
      },
      {
        title: "Guardas CSV y QR en Odoo",
        body: "Actualizas campos custom o adjuntos con el resultado del job/webhook.",
      },
    ],
    codeTitle: "Flujo conceptual Odoo → Simple*Factu",
    codeSample: `# En Odoo (pseudocódigo Python)
@api.model
def action_post(self):
    res = super().action_post()
    if self.move_type in ("out_invoice", "out_refund"):
        requests.post(
            "https://api.simplefactu.com/v1/invoices",
            headers={"Authorization": f"Bearer {API_KEY}"},
            json=self._to_verifactu_payload(),
            timeout=30,
        )
    return res

# El endpoint AEAT SOAP (VeriFactuSOAP) queda fuera de Odoo.`,
    comparisonTitle: "Módulo OCA vs conector API",
    comparisonLeftHeader: "Módulo Odoo/OCA",
    comparisonRightHeader: "API Simple*Factu",
    comparisonRows: [
      {
        criterion: "SOAP / mTLS en Odoo",
        left: "Sí, en el módulo",
        right: "No (solo REST)",
      },
      {
        criterion: "Mantenimiento XSD AEAT",
        left: "Tu partner / OCA",
        right: "Simple*Factu",
      },
      {
        criterion: "Reintentos / jobs",
        left: "Depende del módulo",
        right: "Incluidos",
      },
      {
        criterion: "Declaración responsable",
        left: "Del autor del módulo",
        right: "Del proveedor API",
      },
    ],
    faqs: [
      {
        question: "¿Odoo tiene módulo Veri*Factu OCA?",
        answer:
          "Existen módulos de localización española y partners OCA/community con soporte Veri*Factu. Alternativa estable: conector HTTP a una API especializada que gestiona SOAP AEAT.",
      },
      {
        question: "¿Qué es el endpoint VeriFactuSOAP de la AEAT?",
        answer:
          "Es el servicio SOAP oficial de la Agencia Tributaria para el sistema de facturación. Requiere mTLS, XSD y huella encadenada. Simple*Factu lo abstrae detrás de una API REST.",
      },
      {
        question: "¿Qué es el SIF / SI ID en Veri*Factu?",
        answer:
          "El SIF (Sistema Informático de Facturación) identifica el software emisor ante la AEAT. El SI ID forma parte de la identificación del sistema en los registros de facturación.",
      },
      {
        question: "¿Cómo integro Veri*Factu en Odoo sin tocar el WSDL?",
        answer:
          "Configura un conector que, al validar la factura, llame a la API REST de Simple*Factu. Odoo no necesita implementar SOAP ni certificados mTLS directamente.",
      },
    ],
    relatedBlogSlug: "odoo-verifactu-integracion-modulos-cumplimiento",
    relatedBlogLabel: "Artículo: Odoo y Veri*Factu (módulos)",
    softwareName: "Simple*Factu API — Conector Odoo Veri*Factu",
    softwareDescription:
      "Conector API REST para Odoo (Community/Enterprise/OCA): envío Veri*Factu a la AEAT sin implementar SOAP ni certificados mTLS en el ERP.",
  },
];

export function getIntegrationPage(
  slug: IntegrationSlug
): IntegrationPageContent | undefined {
  return INTEGRATION_PAGES.find((p) => p.slug === slug);
}

export function buildIntegrationJsonLd(page: IntegrationPageContent) {
  const base = getSiteUrl();
  const url = canonicalUrl(page.path);

  return [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "@id": `${url}#software`,
      name: page.softwareName,
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web",
      url,
      description: page.softwareDescription,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "EUR",
        description: "Plan gratuito con sandbox",
      },
      publisher: {
        "@type": "Organization",
        "@id": `${base}/#organization`,
        name: "Simple*Factu",
      },
      featureList: page.features.map((f) => f.title),
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: page.h1,
      description: page.metaDescription,
      isPartOf: { "@type": "WebSite", "@id": `${base}/#website` },
      about: page.about.map((name) => ({ "@type": "Thing", name })),
    },
    buildBreadcrumbSchema([
      { name: "Inicio", url: "/" },
      { name: "Integraciones", url: "/integraciones" },
      { name: page.navLabel, url: page.path },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: page.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    },
  ];
}

export function buildIntegrationsHubJsonLd() {
  const base = getSiteUrl();
  const url = canonicalUrl("/integraciones");

  return [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": `${url}#webpage`,
      url,
      name: "Integraciones Veri*Factu API",
      description:
        "Conectores API REST Veri*Factu para FactuSOL, ContaSimple, Odoo y ERPs a medida.",
      isPartOf: { "@type": "WebSite", "@id": `${base}/#website` },
      hasPart: INTEGRATION_PAGES.map((p) => ({
        "@type": "WebPage",
        name: p.h1,
        url: canonicalUrl(p.path),
      })),
    },
    buildBreadcrumbSchema([
      { name: "Inicio", url: "/" },
      { name: "Integraciones", url: "/integraciones" },
    ]),
  ];
}
