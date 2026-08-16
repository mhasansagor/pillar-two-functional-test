import Link from "next/link";

export default function DashboardNotFound(): JSX.Element {
  return (
    <section className="mx-auto max-w-2xl rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-600">
        404
      </p>
      <h1 className="mt-3 text-2xl font-semibold text-slate-900">
        Dashboard page not found
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        The dashboard route you requested does not exist.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 inline-flex items-center justify-center rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-sky-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
      >
        Back to dashboard
      </Link>
    </section>
  );
}
