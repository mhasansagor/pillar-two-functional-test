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
  const clearCart = useCartStore((state) => state.clearCart);
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
      <section aria-busy="true" aria-label="Loading cart" className="space-y-4">
        <div className="skeleton h-10 w-48 rounded" />
        <div className="skeleton h-40 rounded-lg" />
        <div className="skeleton h-40 rounded-lg" />
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-2xl rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div
          aria-hidden="true"
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-lg font-semibold text-slate-500"
        >
          0
        </div>
        <h1 className="mt-6 text-2xl font-semibold text-slate-900">
          Your cart is empty
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Add products from the dashboard to continue.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-sky-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
        >
          Continue shopping
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-600">
            Cart
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">
            Shopping cart
          </h1>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
        >
          Back to dashboard
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
        <div className="space-y-4">
          {items.map((item) => (
            <article
              key={item.id}
              className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:flex-row"
            >
              <div className="relative h-28 w-full overflow-hidden rounded-lg bg-slate-100 sm:h-24 sm:w-24">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>

              <div className="flex flex-1 flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    {item.name}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {item.category}
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {formatCurrency(item.price)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {item.stock} available
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                    <button
                      type="button"
                      aria-label={`Decrease quantity of ${item.name}`}
                      onClick={() => decreaseQuantity(item.id)}
                      className="flex h-10 w-10 items-center justify-center text-lg text-slate-700 transition hover:bg-slate-100"
                    >
                      -
                    </button>
                    <span className="min-w-10 text-center text-sm font-medium text-slate-800">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      aria-label={`Increase quantity of ${item.name}`}
                      onClick={() => increaseQuantity(item.id)}
                      disabled={item.quantity >= item.stock}
                      className="flex h-10 w-10 items-center justify-center text-lg text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400"
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
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 sm:w-28 sm:flex-col sm:items-end sm:justify-center">
                <span className="text-sm text-slate-500">Item total</span>
                <span className="text-base font-semibold text-slate-900">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            </article>
          ))}
        </div>

        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Summary</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span className="font-medium text-slate-900">
                {formatCurrency(subtotal)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Shipping</span>
              <span>Free</span>
            </div>
          </div>

          <div className="mt-5 border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between text-base font-semibold text-slate-900">
              <span>Total</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
          </div>

          <button
            type="button"
            aria-busy={isCheckingOut}
            disabled={isCheckingOut}
            onClick={() => {
              void handleCheckout();
            }}
            className="mt-6 flex min-h-12 w-full items-center justify-center rounded-lg bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
          >
            {isCheckingOut ? "Processing..." : "Checkout"}
          </button>

          <button
            type="button"
            onClick={() => {
              clearCart();
              toast.success("Cart cleared.");
            }}
            className="mt-3 w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
          >
            Clear cart
          </button>
        </aside>
      </div>
    </section>
  );
}
