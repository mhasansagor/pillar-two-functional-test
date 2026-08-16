"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCartStore } from "@/store/cartStore";
import { formatCurrency } from "@/types/product";

export default function CheckoutBar(): JSX.Element | null {
  const { data: session } = useSession();
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const status = useCartStore((state) => state.status);
  const totalCount = useCartStore((state) => state.totalCount());
  const subtotal = useCartStore((state) => state.subtotal());
  const checkout = useCartStore((state) => state.checkout);
  const isCheckingOut = status === "checking-out";

  if (items.length === 0) return null;

  const handleCheckout = async (): Promise<void> => {
    if (!session) {
      router.push("/login?callbackUrl=/dashboard");
      return;
    }

    if (isCheckingOut) {
      return;
    }

    const result = await checkout();
    if (result.success) {
      toast.success("Order placed. Your cart has been cleared.");
      return;
    }

    toast.error(result.error ?? "Checkout failed.", {
      action: {
        label: "Retry",
        onClick: () => {
          void handleCheckout();
        },
      },
    });
  };

  return (
    <div className="sticky bottom-4 mt-8 flex items-center justify-between rounded-lg border border-border bg-card px-6 py-4 shadow-lg">
      <div>
        <p className="text-sm text-muted">{totalCount} item(s) in cart</p>
        <p className="text-lg font-semibold text-ink">
          {formatCurrency(subtotal)}
        </p>
      </div>
      <button
        type="button"
        onClick={() => {
          void handleCheckout();
        }}
        disabled={isCheckingOut}
        aria-busy={isCheckingOut}
        className="min-w-32 rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isCheckingOut ? "Processing..." : "Checkout"}
      </button>
    </div>
  );
}
