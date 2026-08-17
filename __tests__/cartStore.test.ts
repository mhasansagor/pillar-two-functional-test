import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCartStorageKey } from "@/lib/cartStorage";
import { useCartStore } from "@/store/cartStore";
import type { Product } from "@/types/product";

const product: Product = {
  id: 1,
  name: "MacBook Pro M2",
  category: "Laptops",
  price: 2499,
  stock: 2,
  image: "/assets/images/macbook-pro-m2.jpg",
};

function resetStore(): void {
  localStorage.clear();
  useCartStore.setState({
    items: [],
    status: "idle",
    hasHydrated: true,
  });
}

describe("cart store", () => {
  beforeEach(() => {
    resetStore();
    vi.restoreAllMocks();
  });

  it("adds a new product and increases an existing quantity", () => {
    expect(useCartStore.getState().addItem(product)).toBe("added");
    expect(useCartStore.getState().addItem(product)).toBe("added");

    expect(useCartStore.getState().items).toMatchObject([
      { id: 1, quantity: 2 },
    ]);
    expect(useCartStore.getState().totalCount()).toBe(2);
    expect(useCartStore.getState().subtotal()).toBe(4998);
  });

  it("prevents exceeding stock and blocks out-of-stock products", () => {
    useCartStore.getState().addItem(product);
    useCartStore.getState().addItem(product);

    expect(useCartStore.getState().addItem(product)).toBe("max-stock");
    expect(useCartStore.getState().items[0]?.quantity).toBe(2);
    expect(
      useCartStore.getState().addItem({ ...product, id: 2, stock: 0 })
    ).toBe("out-of-stock");
    expect(useCartStore.getState().totalCount()).toBe(2);
  });

  it("removes products, decreases quantity, and clears the cart", () => {
    useCartStore.getState().addItem(product);
    useCartStore.getState().addItem(product);
    useCartStore.getState().decreaseQuantity(product.id);

    expect(useCartStore.getState().items[0]?.quantity).toBe(1);

    useCartStore.getState().decreaseQuantity(product.id);
    expect(useCartStore.getState().items).toEqual([]);

    useCartStore.getState().addItem(product);
    useCartStore.getState().removeItem(product.id);
    expect(useCartStore.getState().items).toEqual([]);

    useCartStore.getState().addItem(product);
    useCartStore.getState().clearCart();
    expect(useCartStore.getState().items).toEqual([]);
  });

  it("persists and rehydrates cart items", async () => {
    const storageKey = getCartStorageKey();
    useCartStore.getState().addItem(product);

    expect(localStorage.getItem(storageKey)).toContain("MacBook Pro M2");

    useCartStore.setState({ items: [], hasHydrated: false });
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        state: { items: [{ ...product, quantity: 1 }] },
        version: 0,
      })
    );
    await useCartStore.persist.rehydrate();

    expect(useCartStore.getState().hasHydrated).toBe(true);
    expect(useCartStore.getState().items).toMatchObject([
      { id: 1, quantity: 1 },
    ]);
  });
});
