"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useCartStore } from "@/store/cartStore";
import { formatCurrency } from "@/types/product";

export default function CartPage(): JSX.Element {
  const router = useRouter();
  const { data: session } = useSession();
  const items = useCartStore((state) => state.items);
  const hasHydrated = useCartStore((state) => state.hasHydrated);
  const subtotal = useCartStore((state) => state.subtotal());
  const checkout = useCartStore((state) => state.checkout);
  const increaseQuantity = useCartStore((state) => state.increaseQuantity);
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const status = useCartStore((state) => state.status);
  const isCheckingOut = status === "checking-out";

  const handleCheckout = async (): Promise<void> => {
    if (!session) {
      router.push("/login?callbackUrl=/dashboard/cart");
      return;
    }

    if (isCheckingOut) {
      return;
    }

    const result = await checkout();

    if (result.success) {
      toast.success("Order placed successfully.");
      return;
    }

    toast.error(result.error ?? "Checkout failed. Please try again.", {
      action: {
        label: "Retry",
        onClick: () => {
          void handleCheckout();
        },
      },
    });
  };

  if (!hasHydrated) {
    return (
      <section
        aria-busy="true"
        aria-label="Loading cart"
        className="space-y-5"
      >
        <div className="skeleton h-12 w-64 rounded-lg" />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-3">
            <div className="skeleton h-36 rounded-lg" />
            <div className="skeleton h-36 rounded-lg" />
          </div>
          <div className="skeleton h-72 rounded-lg" />
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-2xl rounded-lg border border-border bg-card p-8 text-center shadow-sm">
        <div
          aria-hidden="true"
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surface text-lg font-semibold text-muted"
        >
          0
        </div>
        <h1 className="mt-6 text-2xl font-semibold text-ink">
          Your cart is empty
        </h1>
        <p className="mt-2 text-sm text-muted">
          Add products from the dashboard to continue.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          Continue shopping
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent">
            Cart
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-ink">
            Shopping cart
          </h1>
          <p className="mt-1 text-sm text-muted">
            Review quantities, item totals, and checkout summary.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex min-h-10 items-center justify-center rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          Back to dashboard
        </Link>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          {items.map((item) => (
            <article
              key={item.id}
              className="grid gap-4 rounded-lg border border-border bg-card p-4 shadow-sm md:grid-cols-[112px_minmax(0,1fr)_minmax(170px,auto)_minmax(120px,auto)] md:items-center"
            >
              <div className="relative h-36 w-full overflow-hidden rounded-lg bg-surface md:h-28 md:w-28">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="112px"
                  className="object-contain p-3"
                />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  {item.category}
                </p>
                <h2 className="mt-1 text-base font-semibold leading-6 text-ink">
                  {item.name}
                </h2>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                  <span className="font-semibold text-ink">
                    {formatCurrency(item.price)}
                  </span>
                  <span className="text-muted">{item.stock} available</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 md:justify-end">
                <div className="flex h-11 items-center overflow-hidden rounded-lg border border-border bg-surface">
                  <button
                    type="button"
                    aria-label={`Decrease quantity of ${item.name}`}
                    onClick={() => decreaseQuantity(item.id)}
                    className="flex h-11 w-11 items-center justify-center text-lg font-medium text-ink transition hover:bg-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset"
                  >
                    -
                  </button>
                  <span className="min-w-11 text-center text-sm font-semibold text-ink">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    aria-label={`Increase quantity of ${item.name}`}
                    onClick={() => increaseQuantity(item.id)}
                    disabled={item.quantity >= item.stock}
                    className="flex h-11 w-11 items-center justify-center text-lg font-medium text-ink transition hover:bg-border disabled:cursor-not-allowed disabled:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  aria-label={`Remove ${item.name} from cart`}
                  onClick={() => {
                    removeItem(item.id);
                    toast.success(`${item.name} removed from cart.`);
                  }}
                  className="inline-flex h-11 items-center justify-center rounded-lg border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-700 transition hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                >
                  Remove
                </button>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-surface px-3 py-2 md:flex-col md:items-end md:bg-transparent md:px-0 md:py-0">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Item total
                </span>
                <span className="text-base font-semibold text-ink">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            </article>
          ))}
        </div>

        <aside className="rounded-lg border border-border bg-card p-5 shadow-sm lg:sticky lg:top-24">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Checkout
            </p>
            <h2 className="mt-1 text-lg font-semibold text-ink">Summary</h2>
          </div>

          <div className="mt-5 space-y-3 text-sm text-muted">
            <div className="flex items-center justify-between gap-4">
              <span>Subtotal</span>
              <span className="font-semibold text-ink">
                {formatCurrency(subtotal)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>Shipping</span>
              <span className="font-semibold text-success">Free</span>
            </div>
          </div>

          <div className="mt-5 border-t border-border pt-4">
            <div className="flex items-center justify-between gap-4 text-base font-semibold text-ink">
              <span>Total</span>
              <span className="text-lg">{formatCurrency(subtotal)}</span>
            </div>
          </div>

          <button
            type="button"
            aria-busy={isCheckingOut}
            disabled={isCheckingOut}
            onClick={() => {
              void handleCheckout();
            }}
            className="mt-6 flex min-h-12 w-full items-center justify-center rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            {isCheckingOut ? "Processing..." : "Checkout"}
          </button>
        </aside>
      </div>
    </section>
  );
}
