export default function SkeletonLoader(): JSX.Element {
  return (
    <div
      aria-busy="true"
      aria-label="Loading products"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-lg border border-border bg-card p-4"
          aria-hidden="true"
        >
          <div className="skeleton h-36 w-full rounded-lg" />
          <div className="skeleton mt-4 h-4 w-3/4 rounded" />
          <div className="skeleton mt-2 h-4 w-1/2 rounded" />
          <div className="skeleton mt-4 h-9 w-full rounded-lg" />
        </div>
      ))}
    </div>
  );
}
