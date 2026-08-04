import { prisma } from "@/lib/prisma";
import { ApproveRequestButton, RejectRequestForm } from "./RequestDecisionForms";

const PAGE_SIZE = 25;

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendiente",
  APPROVED: "Aprobada",
  REJECTED: "Rechazada",
};

export default async function AdminRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const { page: pageParam, status } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));
  const skip = (page - 1) * PAGE_SIZE;

  const where = {
    ...(status === "PENDING" || status === "APPROVED" || status === "REJECTED"
      ? { status: status as "PENDING" | "APPROVED" | "REJECTED" }
      : {}),
  };

  const [requests, total, pendingCount] = await Promise.all([
    prisma.activationRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.activationRequest.count({ where }),
    prisma.activationRequest.count({ where: { status: "PENDING" } }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-fg">Solicitudes de activación</h1>
          <p className="mt-0.5 text-sm text-fg-subtle">
            {pendingCount} pendiente{pendingCount === 1 ? "" : "s"} · {total} en esta vista
          </p>
        </div>
      </div>

      <form method="GET" className="flex flex-wrap gap-3">
        <select
          name="status"
          defaultValue={status ?? ""}
          className="rounded-md border border-outline px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-outline"
        >
          <option value="">Todos los estados</option>
          <option value="PENDING">Pendientes</option>
          <option value="APPROVED">Aprobadas</option>
          <option value="REJECTED">Rechazadas</option>
        </select>
        <button type="submit" className="btn btn-sm btn-primary">
          Filtrar
        </button>
        {status ? (
          <a href="/admin/requests" className="btn btn-sm btn-secondary">
            Limpiar
          </a>
        ) : null}
      </form>

      {requests.length === 0 ? (
        <p className="text-sm text-fg-subtle">No hay solicitudes con estos filtros.</p>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <article
              key={req.id}
              className="rounded-xl border border-outline-soft bg-surface p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-fg">{req.companyName}</h2>
                  <p className="mt-0.5 text-sm text-fg-muted">
                    NIF <span className="font-mono">{req.nif}</span>
                    {" · "}
                    <a href={`mailto:${req.email}`} className="text-accent hover:underline">
                      {req.email}
                    </a>
                  </p>
                  <p className="mt-1 break-all text-xs text-fg-subtle font-mono">{req.userId}</p>
                </div>
                <span
                  className={[
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                    req.status === "PENDING"
                      ? "bg-warning/50 text-warning-foreground"
                      : req.status === "APPROVED"
                        ? "bg-success/40 text-success-foreground"
                        : "bg-surface-muted text-fg-muted",
                  ].join(" ")}
                >
                  {STATUS_LABEL[req.status] ?? req.status}
                </span>
              </div>

              {req.message ? (
                <p className="mt-3 whitespace-pre-wrap text-sm text-fg-muted">{req.message}</p>
              ) : null}

              <p className="mt-3 text-xs text-fg-subtle">
                Creada{" "}
                {new Date(req.createdAt).toLocaleString("es-ES", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {req.decidedAt
                  ? ` · Decidida ${new Date(req.decidedAt).toLocaleString("es-ES", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}`
                  : ""}
              </p>

              {req.status === "REJECTED" && req.decisionNote ? (
                <p className="mt-2 text-xs text-fg-muted whitespace-pre-wrap">
                  Nota: {req.decisionNote}
                </p>
              ) : null}

              {req.status === "PENDING" ? (
                <div className="mt-4 border-t border-outline-soft pt-3">
                  <ApproveRequestButton requestId={req.id} />
                  <RejectRequestForm requestId={req.id} />
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}

      {totalPages > 1 ? (
        <div className="flex items-center gap-2 text-sm">
          {page > 1 ? (
            <a
              href={`?page=${page - 1}${status ? `&status=${status}` : ""}`}
              className="btn btn-sm btn-secondary"
            >
              ← Anterior
            </a>
          ) : null}
          <span className="text-fg-subtle">
            Página {page} de {totalPages}
          </span>
          {page < totalPages ? (
            <a
              href={`?page=${page + 1}${status ? `&status=${status}` : ""}`}
              className="btn btn-sm btn-secondary"
            >
              Siguiente →
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
