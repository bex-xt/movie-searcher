export function SkeletonCard() {
  return (
    <div className="group relative flex flex-col glass-card border border-white/[0.04] bg-white/[0.01] overflow-hidden rounded-2xl h-full select-none pointer-events-none">
      {/* Top aspect-2/3 block */}
      <div className="relative w-full aspect-[2/3] overflow-hidden rounded-t-2xl bg-white/[0.02] skeleton-sheen animate-pulse" />
      {/* Bottom text block */}
      <div className="flex-grow p-4 bg-zinc-950/20 border-t border-white/[0.04] flex flex-col gap-3">
        {/* Year & Rating block */}
        <div className="h-3.5 w-20 bg-white/[0.03] rounded skeleton-sheen" />
        {/* Title */}
        <div className="h-5.5 w-3/4 bg-white/[0.05] rounded skeleton-sheen mt-1" />
        {/* Chips */}
        <div className="flex gap-1.5 mt-1">
          <div className="h-4.5 w-14 bg-white/[0.03] rounded-full skeleton-sheen" />
          <div className="h-4.5 w-16 bg-white/[0.03] rounded-full skeleton-sheen" />
        </div>
        {/* Reason text lines */}
        <div className="flex flex-col gap-2 mt-1.5">
          <div className="h-3.5 w-full bg-white/[0.02] rounded skeleton-sheen" />
          <div className="h-3.5 w-11/12 bg-white/[0.02] rounded skeleton-sheen" />
          <div className="h-3.5 w-4/5 bg-white/[0.02] rounded skeleton-sheen" />
        </div>
        {/* Action prompt row skeleton */}
        <div className="mt-4 pt-2.5 border-t border-white/[0.03] flex items-center justify-between">
          <div className="h-3.5 w-24 bg-white/[0.03] rounded skeleton-sheen" />
          <div className="h-4 w-4 bg-white/[0.03] rounded-full skeleton-sheen" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonGrid() {
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 w-full">
      {[0, 1, 2, 3, 4].map((item) => (
        <SkeletonCard key={item} />
      ))}
    </div>
  );
}
