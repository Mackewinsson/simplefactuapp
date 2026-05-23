export default function InvoicesLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-6 flex items-center justify-between">
        <div className="h-8 w-32 rounded bg-surface-muted" />
        <div className="h-9 w-36 rounded bg-surface-muted" />
      </div>
      
      {/* View tabs */}
      <div className="mb-5 flex gap-2 border-b border-outline-soft pb-2">
        <div className="h-8 w-24 rounded bg-surface-muted" />
        <div className="h-8 w-24 rounded bg-surface-muted" />
      </div>

      {/* Filters bar */}
      <div className="mb-4 rounded border border-outline-soft bg-surface p-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="h-8 w-40 rounded bg-surface-muted" />
          <div className="h-8 w-32 rounded bg-surface-muted" />
          <div className="h-8 w-32 rounded bg-surface-muted" />
          <div className="h-8 w-20 rounded bg-surface-muted" />
        </div>
      </div>

      {/* Desktop Table View Skeleton */}
      <div className="hidden overflow-x-auto rounded border border-outline-soft bg-surface md:block">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-outline-soft bg-surface-muted">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <th key={i} className="px-4 py-3">
                  <div className="h-4 w-20 rounded bg-surface-muted" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="border-b border-outline-soft last:border-0">
                <td className="px-4 py-4"><div className="h-4 w-24 rounded bg-surface-muted" /></td>
                <td className="px-4 py-4"><div className="h-4 w-12 rounded bg-surface-muted" /></td>
                <td className="px-4 py-4"><div className="h-4 w-40 rounded bg-surface-muted" /></td>
                <td className="px-4 py-4"><div className="h-4 w-20 rounded bg-surface-muted" /></td>
                <td className="px-4 py-4"><div className="h-4 w-20 rounded bg-surface-muted" /></td>
                <td className="px-4 py-4"><div className="h-5 w-24 rounded bg-surface-muted" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View Skeleton */}
      <div className="space-y-3 md:hidden">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded border border-outline-soft bg-surface p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="h-5 w-24 rounded bg-surface-muted" />
              <div className="h-5 w-16 rounded bg-surface-muted" />
            </div>
            <div className="mt-2 h-4 w-32 rounded bg-surface-muted" />
            <div className="mt-2 flex gap-2">
              <div className="h-4 w-16 rounded bg-surface-muted" />
              <div className="h-4 w-12 rounded bg-surface-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
