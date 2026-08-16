"use client";

import Image from "next/image";
import { toast } from "sonner";
import type { Product } from "@/types/product";
import { formatCurrency, getStockStatus } from "@/types/product";
import { useCartStore } from "@/store/cartStore";

export default function ProductCard({
  product,
}: {
  product: Product;
}): JSX.Element {
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

  return (
    <article className="flex flex-col rounded-lg border border-border bg-card p-4">
      <div className="relative h-36 w-full overflow-hidden rounded-lg bg-surface">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
        <span
          aria-hidden="true"
          className={`absolute right-2 top-2 h-2.5 w-2.5 rounded-full ${stock.dotClass}`}
        />
      </div>

      <div className="mt-4 flex items-start justify-between gap-2">
        <div>
          <p className="text-sm text-muted">{product.category}</p>
          <h3 className="text-sm font-semibold text-ink">{product.name}</h3>
        </div>
        <p className="text-sm font-semibold text-ink">
          {formatCurrency(product.price)}
        </p>
      </div>

      {stock.label && (
        <span
          className={`mt-2 inline-block w-fit rounded-full px-2 py-0.5 text-xs font-medium ${stock.badgeClass}`}
        >
          {stock.label}
        </span>
      )}

      {stock.remainingText && (
        <p className="mt-2 text-xs font-medium text-muted">
          {stock.remainingText}
        </p>
      )}

      <button
        type="button"
        disabled={stock.isOutOfStock}
        aria-disabled={stock.isOutOfStock}
        onClick={handleAddToCart}
        className="mt-4 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-border disabled:text-muted"
      >
        {stock.isOutOfStock ? "Out of Stock" : "Add to Cart"}
      </button>
    </article>
  );
}
