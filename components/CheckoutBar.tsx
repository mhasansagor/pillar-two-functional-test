"use client";

import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { formatCurrency } from "@/types/product";

export default function CheckoutBar(): JSX.Element | null {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const hasHydrated = useCartStore((state) => state.hasHydrated);
  const totalCount = useCartStore((state) => state.totalCount());
  const subtotal = useCartStore((state) => state.subtotal());

  if (!hasHydrated || items.length === 0) return null;

  return (
    <div className="sticky bottom-4 mt-8 flex flex-col gap-4 rounded-lg border border-border bg-card p-4 shadow-lg sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Cart Summary
        </p>
        <p className="mt-1 text-sm text-muted">{totalCount} item(s) in cart</p>
        <p className="mt-1 text-xl font-semibold text-ink">
          {formatCurrency(subtotal)}
        </p>
      </div>
      <button
        type="button"
        onClick={() => {
          router.push("/dashboard/cart");
        }}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 sm:w-auto"
      >
        Checkout
      </button>
    </div>
  );
}
