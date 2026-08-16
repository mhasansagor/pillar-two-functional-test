export default function EmptyState(): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
      <span
        className="flex h-12 w-12 items-center justify-center rounded-full bg-surface text-sm font-semibold text-muted"
        aria-hidden="true"
      >
        0
      </span>
      <h3 className="mt-4 text-base font-semibold text-ink">
        No products available
      </h3>
      <p className="mt-1 max-w-xs text-sm text-muted">
        No products are currently available. Please check back soon.
      </p>
    </div>
  );
}
