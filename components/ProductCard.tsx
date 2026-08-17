"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Product } from "@/types/product";
import { formatCurrency, getStockStatus } from "@/types/product";
import { useCartStore } from "@/store/cartStore";

export default function ProductCard({
  product,
}: {
  product: Product;
}): JSX.Element {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const stock = getStockStatus(product.stock);

  const handleAddToCart = (): void => {
    const result = addItem(product);

    if (result === "out-of-stock") {
      toast.error(`${product.name} is out of stock.`);
      return;
    }

    if (result === "max-stock") {
      toast.message(`Only ${product.stock} ${product.name} available.`);
      return;
    }

    toast.success(`${product.name} added to cart.`);
  };

  const handleBuy = (): void => {
    const result = addItem(product);

    if (result === "out-of-stock") {
      toast.error(`${product.name} is out of stock.`);
      return;
    }

    if (result === "max-stock") {
      toast.message(`Only ${product.stock} ${product.name} available.`);
    }

    router.push("/dashboard/cart");
  };

  return (
    <article className="flex min-h-full flex-col rounded-lg border border-border bg-card p-4 shadow-sm transition hover:border-accent/30 hover:shadow-md">
      <div className="relative h-40 w-full overflow-hidden rounded-lg bg-surface">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-contain p-3"
        />
        <span
          aria-label={`${stock.level} stock indicator`}
          className={`absolute left-3 top-3 h-3 w-3 rounded-full ring-2 ring-white ${stock.dotClass}`}
        />
        {stock.label && (
          <span
            className={`absolute right-3 top-3 rounded-full px-2 py-1 text-xs font-semibold ${stock.badgeClass}`}
          >
            {stock.label}
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-1 flex-col gap-3">
        <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-ink">
          {product.name}
        </h3>

        <p className="text-base font-semibold text-ink">
          {formatCurrency(product.price)}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-[minmax(0,1fr)_44px] gap-2">
        <button
          type="button"
          disabled={stock.isOutOfStock}
          aria-disabled={stock.isOutOfStock}
          onClick={handleBuy}
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-border disabled:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          {stock.isOutOfStock ? "Unavailable" : "Buy"}
        </button>

        <button
          type="button"
          disabled={stock.isOutOfStock}
          aria-disabled={stock.isOutOfStock}
          aria-label={`Add ${product.name} to cart`}
          onClick={handleAddToCart}
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-white text-ink transition hover:bg-surface disabled:cursor-not-allowed disabled:bg-border disabled:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <circle cx="8" cy="21" r="1" />
            <circle cx="19" cy="21" r="1" />
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
          </svg>
        </button>
      </div>
    </article>
  );
}
