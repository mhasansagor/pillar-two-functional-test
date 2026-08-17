import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CheckoutBar from "@/components/CheckoutBar";
import { useCartStore } from "@/store/cartStore";

const navigationMocks = vi.hoisted(() => ({
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => navigationMocks,
}));

describe("CheckoutBar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useCartStore.setState({ items: [], status: "idle", hasHydrated: true });
  });

  it("redirects dashboard checkout to the cart page", () => {
    useCartStore.getState().addItem({
      id: 1,
      name: "MacBook Air M5 13-Inch",
      category: "Laptops",
      price: 161999,
      stock: 8,
      image: "/assets/images/macbook.jpg",
    });

    render(React.createElement(CheckoutBar));

    fireEvent.click(screen.getByRole("button", { name: "Checkout" }));

    expect(navigationMocks.push).toHaveBeenCalledWith("/dashboard/cart");
  });

  it("stays hidden until the cart has hydrated", () => {
    useCartStore.setState({
      items: [
        {
          id: 1,
          name: "MacBook Air M5 13-Inch",
          category: "Laptops",
          price: 161999,
          stock: 8,
          image: "/assets/images/macbook.jpg",
          quantity: 1,
        },
      ],
      hasHydrated: false,
    });

    render(React.createElement(CheckoutBar));

    expect(screen.queryByRole("button", { name: "Checkout" })).toBeNull();
  });
});
