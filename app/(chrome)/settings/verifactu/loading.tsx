export default function SettingsVerifactuLoading() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Title */}
      <div>
        <div className="h-8 w-64 rounded bg-surface-muted" />
        <div className="mt-2 h-4 w-96 rounded bg-surface-muted" />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Card 1: Emisor Profile Form */}
        <div className="rounded border border-outline-soft bg-surface p-4 space-y-4">
          <div className="h-6 w-48 rounded bg-surface-muted mb-6" />
          
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 rounded bg-surface-muted" />
              <div className="h-10 w-full rounded bg-surface-muted" />
            </div>
          ))}

          <div className="h-10 w-32 rounded bg-surface-muted pt-4" />
        </div>

        {/* Card 2: PFX Certificate Form */}
        <div className="rounded border border-outline-soft bg-surface p-4 space-y-4">
          <div className="h-6 w-48 rounded bg-surface-muted mb-6" />
          
          <div className="space-y-2">
            <div className="h-4 w-32 rounded bg-surface-muted" />
            <div className="h-32 w-full rounded border border-dashed border-outline-soft bg-surface-muted" />
          </div>

          <div className="space-y-2 pt-2">
            <div className="h-4 w-28 rounded bg-surface-muted" />
            <div className="h-10 w-full rounded bg-surface-muted" />
          </div>

          <div className="h-10 w-32 rounded bg-surface-muted pt-4" />
        </div>
      </div>
    </div>
  );
}
