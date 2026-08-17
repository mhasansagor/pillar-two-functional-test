import dynamic from "next/dynamic";
import Link from "next/link";
import ProductGrid from "@/components/ProductGrid";
import { auth } from "@/lib/auth";

const CheckoutBar = dynamic(() => import("@/components/CheckoutBar"), {
  loading: () => (
    <div className="mt-8 h-20 animate-pulse rounded-lg border border-slate-200 bg-slate-100" />
  ),
});

export default async function DashboardPage(): Promise<JSX.Element> {
  const session = await auth();
  const role = session?.user.role;

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Products</h1>
          <p className="mt-1 text-sm text-slate-600">
            Browse inventory and add items to your cart.
          </p>
        </div>

        {role === "admin" && (
          <Link
            href="/dashboard/admin/inventory"
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
          >
            Admin Inventory
          </Link>
        )}
      </div>

      <div className="mt-6">
        <ProductGrid isAdmin={role === "admin"} />
      </div>

      <CheckoutBar />
    </div>
  );
}
