export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-8 animate-pulse">
      {/* Stat grid skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 border-2 border-ink-line bg-ink-raised p-5"
          >
            <div className="h-4 w-24 rounded-sm bg-ink-line" />
            <div className="h-8 w-16 rounded-sm bg-ink-line" />
          </div>
        ))}
      </div>

      {/* Chart + panel skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="border-2 border-ink-line bg-ink-raised p-6 lg:col-span-2">
          <div className="mb-4 h-5 w-40 rounded-sm bg-ink-line" />
          <div className="h-[220px] rounded-sm bg-ink-line/40" />
        </div>
        <div className="flex flex-col gap-3 border-2 border-ink-line bg-ink-raised p-6">
          <div className="h-5 w-32 rounded-sm bg-ink-line" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-14 rounded-sm bg-ink-line/40"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
