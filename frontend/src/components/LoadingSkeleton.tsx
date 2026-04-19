export default function LoadingSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-forest-800/40 rounded-xl overflow-hidden animate-pulse">
          <div className="aspect-[4/3] bg-forest-800" />
          <div className="p-4 space-y-3">
            <div className="h-5 bg-forest-700/50 rounded w-3/4" />
            <div className="h-3 bg-forest-700/50 rounded w-1/2" />
            <div className="flex gap-2">
              <div className="h-5 bg-forest-700/30 rounded w-16" />
              <div className="h-5 bg-forest-700/30 rounded w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
