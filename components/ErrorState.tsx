export default function ErrorState({
  onRetry,
}: {
  onRetry: () => void;
}): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-danger/30 bg-danger/5 py-16 text-center">
      <span
        className="flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-sm font-bold text-danger"
        aria-hidden="true"
      >
        !
      </span>
      <h3 className="mt-4 text-base font-semibold text-ink">
        Could not load products
      </h3>
      <p className="mt-1 max-w-xs text-sm text-muted">
        Something went wrong while fetching the catalog.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      >
        Retry
      </button>
    </div>
  );
}
