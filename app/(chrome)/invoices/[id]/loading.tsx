export default function InvoiceDetailLoading() {
  return (
    <div className="animate-pulse">
      {/* Header back button and title */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="h-4 w-24 rounded bg-surface-muted" />
          <div className="mt-2 h-8 w-48 rounded bg-surface-muted" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-20 rounded bg-surface-muted" />
          <div className="h-9 w-24 rounded bg-surface-muted" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Details (2/3 width) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Card: Issuer and Customer Info */}
          <div className="rounded border border-outline-soft bg-surface p-4">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <div className="h-4 w-24 rounded bg-surface-muted mb-3" />
                <div className="h-6 w-40 rounded bg-surface-muted mb-2" />
                <div className="h-4 w-32 rounded bg-surface-muted" />
              </div>
              <div>
                <div className="h-4 w-24 rounded bg-surface-muted mb-3" />
                <div className="h-6 w-40 rounded bg-surface-muted mb-2" />
                <div className="h-4 w-32 rounded bg-surface-muted" />
              </div>
            </div>
          </div>

          {/* Card: Line Items Table */}
          <div className="rounded border border-outline-soft bg-surface overflow-hidden">
            <div className="border-b border-outline-soft bg-surface-muted px-4 py-3 flex gap-4">
              <div className="h-4 w-1/2 rounded bg-surface-muted" />
              <div className="h-4 w-12 rounded bg-surface-muted ml-auto" />
              <div className="h-4 w-16 rounded bg-surface-muted" />
              <div className="h-4 w-16 rounded bg-surface-muted" />
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="border-b border-outline-soft last:border-0 px-4 py-4 flex gap-4">
                <div className="h-4 w-1/3 rounded bg-surface-muted" />
                <div className="h-4 w-12 rounded bg-surface-muted ml-auto" />
                <div className="h-4 w-16 rounded bg-surface-muted" />
                <div className="h-4 w-16 rounded bg-surface-muted" />
              </div>
            ))}
          </div>

          {/* Totals Section */}
          <div className="flex justify-end">
            <div className="w-64 rounded border border-outline-soft bg-surface p-4 space-y-3">
              <div className="flex justify-between">
                <div className="h-4 w-20 rounded bg-surface-muted" />
                <div className="h-4 w-16 rounded bg-surface-muted" />
              </div>
              <div className="flex justify-between border-t border-outline-soft pt-2">
                <div className="h-5 w-24 rounded bg-surface-muted" />
                <div className="h-5 w-20 rounded bg-surface-muted" />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar panel (1/3 width) */}
        <div className="space-y-6">
          <div className="rounded border border-outline-soft bg-surface p-4 space-y-4">
            <div className="h-5 w-32 rounded bg-surface-muted" />
            <div className="h-24 rounded bg-surface-muted" />
            <div className="h-10 rounded bg-surface-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}
