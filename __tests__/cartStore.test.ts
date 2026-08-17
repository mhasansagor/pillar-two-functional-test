import { beforeEach, describe, expect, it } from "vitest";
import { useCartStore } from "@/store/cartStore";
import type { Product } from "@/types/product";

const product: Product = {
  id: 1,
  name: "MacBook Air M5 13-Inch",
  category: "Laptops",
  price: 161999,
  stock: 2,
  image: "https://example.com/macbook.png",
};

describe("cart store", () => {
  beforeEach(() => {
    localStorage.clear();
    useCartStore.setState({
      items: [],
      status: "idle",
      hasHydrated: true,
    });
  });

  it("adds products and blocks quantity above stock", () => {
    expect(useCartStore.getState().addItem(product)).toBe("added");
    expect(useCartStore.getState().addItem(product)).toBe("added");
    expect(useCartStore.getState().addItem(product)).toBe("max-stock");

    expect(useCartStore.getState().items).toEqual([
      expect.objectContaining({ id: product.id, quantity: 2 }),
    ]);
  });

  it("blocks out-of-stock products", () => {
    expect(
      useCartStore.getState().addItem({
        ...product,
        id: 2,
        stock: 0,
      })
    ).toBe("out-of-stock");
    expect(useCartStore.getState().items).toEqual([]);
  });

  it("removes an item when quantity is decreased below one", () => {
    useCartStore.getState().addItem(product);
    useCartStore.getState().decreaseQuantity(product.id);

    expect(useCartStore.getState().items).toEqual([]);
  });
});
