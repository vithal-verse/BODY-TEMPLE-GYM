export default function MembersLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="h-7 w-36 rounded-sm bg-ink-line" />
          <div className="mt-2 h-4 w-24 rounded-sm bg-ink-line/50" />
        </div>
        <div className="h-11 w-36 rounded-sm bg-ink-line" />
      </div>

      {/* Controls skeleton */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="h-10 w-full rounded-sm bg-ink-line sm:max-w-xs" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-9 w-20 rounded-sm bg-ink-line" />
          ))}
        </div>
      </div>

      {/* Table skeleton */}
      <div className="border-2 border-ink-line overflow-hidden">
        {/* Header row */}
        <div className="border-b-2 border-ink-line bg-ink-raised flex gap-4 px-4 py-3">
          {[120, 80, 70, 70, 80, 60, 56].map((w, i) => (
            <div
              key={i}
              className="h-3 rounded-sm bg-ink-line"
              style={{ width: w }}
            />
          ))}
        </div>
        {/* Body rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-ink-line px-4 py-4 last:border-b-0"
          >
            <div className="flex flex-col gap-1.5" style={{ width: 120 }}>
              <div className="h-3.5 rounded-sm bg-ink-line" />
              <div className="h-2.5 w-24 rounded-sm bg-ink-line/50" />
            </div>
            {[80, 70, 70, 60, 52, 56].map((w, j) => (
              <div
                key={j}
                className="h-3 rounded-sm bg-ink-line/50"
                style={{ width: w }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
