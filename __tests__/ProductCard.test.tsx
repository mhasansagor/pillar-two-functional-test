import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProductCard from "@/components/ProductCard";
import { useCartStore } from "@/store/cartStore";
import type { Product } from "@/types/product";

const navigationMocks = vi.hoisted(() => ({
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => navigationMocks,
}));

function makeProduct(stock: number): Product {
  return {
    id: stock + 10,
    name: `Product ${stock}`,
    category: "Accessories",
    price: 100,
    stock,
    image: "/assets/images/test.jpg",
  };
}

describe("ProductCard inventory states", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useCartStore.setState({ items: [], status: "idle", hasHydrated: true });
  });

  it("disables the buy and cart buttons when stock is zero", () => {
    render(React.createElement(ProductCard, { product: makeProduct(0) }));

    const buy = screen.getByRole("button", { name: "Unavailable" });
    const cart = screen.getByRole("button", { name: "Add Product 0 to cart" });
    const badge = screen.getByText("Out of Stock");
    const indicator = screen.getByLabelText("out stock indicator");

    expect(buy).toBeDisabled();
    expect(cart).toBeDisabled();
    expect(buy).toHaveAttribute("aria-disabled", "true");
    expect(cart).toHaveAttribute("aria-disabled", "true");
    expect(badge).toHaveClass("bg-red-100", "text-red-700");
    expect(indicator).toHaveClass("bg-red-500");

    fireEvent.click(buy);
    expect(useCartStore.getState().totalCount()).toBe(0);
  });

  it("keeps the buy and cart buttons enabled for stock from 1 to 4", () => {
    render(React.createElement(ProductCard, { product: makeProduct(3) }));

    expect(screen.queryByText("Accessories")).not.toBeInTheDocument();
    expect(screen.getByText("Low Stock")).toHaveClass(
      "bg-amber-100",
      "text-amber-700"
    );
    expect(screen.getByLabelText("low stock indicator")).toHaveClass("bg-amber-500");
    expect(screen.getByRole("button", { name: "Buy" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Add Product 3 to cart" })).toBeEnabled();
  });

  it("adds to cart with the icon button and sends Buy to the cart page", () => {
    render(React.createElement(ProductCard, { product: makeProduct(5) }));

    expect(screen.queryByText(/Stock/)).not.toBeInTheDocument();
    expect(screen.getByLabelText("in stock indicator")).toHaveClass("bg-emerald-500");

    fireEvent.click(screen.getByRole("button", { name: "Add Product 5 to cart" }));
    expect(useCartStore.getState().totalCount()).toBe(1);

    fireEvent.click(screen.getByRole("button", { name: "Buy" }));
    expect(navigationMocks.push).toHaveBeenCalledWith("/dashboard/cart");
  });
});
