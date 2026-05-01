/**
 * Server-side HTTP client for simplefactu (Veri*Factu API).
 * Pass the per-user API key from Prisma — never a single global key for invoice routes.
 */

export type SimplefactuClientConfig = {
  baseUrl: string;
  apiKey: string;
};

function joinUrl(base: string, path: string): string {
  const b = base.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

async function parseJson(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

export function getSimplefactuBaseUrl(): string {
  const u = process.env.SIMPLEFACTU_API_BASE_URL?.trim();
  if (!u) {
    throw new Error("SIMPLEFACTU_API_BASE_URL is not set (e.g. http://localhost:3000/v1)");
  }
  return u.replace(/\/$/, "");
}

export function createSimplefactuClient(config: SimplefactuClientConfig) {
  const { baseUrl, apiKey } = config;
  const headers = {
    "Content-Type": "application/json",
    "x-api-key": apiKey,
  };

  return {
    async getMeCertificate(): Promise<Response> {
      return fetch(joinUrl(baseUrl, "/me/certificate"), { method: "GET", headers });
    },

    async postMeCertificate(body: { pfxBase64: string; pfxPassphrase: string }): Promise<Response> {
      return fetch(joinUrl(baseUrl, "/me/certificate"), {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
    },

    async postSendInvoice(body: Record<string, unknown>, idempotencyKey: string): Promise<Response> {
      return fetch(joinUrl(baseUrl, "/send-invoice"), {
        method: "POST",
        headers: {
          ...headers,
          "x-idempotency-key": idempotencyKey,
        },
        body: JSON.stringify(body),
      });
    },

    async getJob(jobId: string): Promise<Response> {
      return fetch(joinUrl(baseUrl, `/jobs/${jobId}`), { method: "GET", headers });
    },

    parseJson,
  };
}

export type SimplefactuClient = ReturnType<typeof createSimplefactuClient>;
