import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it } from "vitest";
import ProductCard from "@/components/ProductCard";
import { useCartStore } from "@/store/cartStore";
import type { Product } from "@/types/product";

function makeProduct(stock: number): Product {
  return {
    id: stock + 10,
    name: `Product ${stock}`,
    category: "Test",
    price: 100,
    stock,
    image: "/assets/images/test.jpg",
  };
}

describe("ProductCard inventory states", () => {
  beforeEach(() => {
    localStorage.clear();
    useCartStore.setState({ items: [], status: "idle", hasHydrated: true });
  });

  it("disables the button and shows Out of Stock when stock is zero", () => {
    render(React.createElement(ProductCard, { product: makeProduct(0) }));

    const button = screen.getByRole("button", { name: "Out of Stock" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-disabled", "true");

    fireEvent.click(button);
    expect(useCartStore.getState().totalCount()).toBe(0);
  });

  it("shows Low Stock and keeps the add button enabled for stock from 1 to 4", () => {
    render(React.createElement(ProductCard, { product: makeProduct(3) }));

    expect(screen.getByText("Low Stock")).toBeInTheDocument();
    expect(screen.getByText("3 left in stock")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add to Cart" })).toBeEnabled();
  });

  it("shows normal state without the low-stock badge for stock of five or more", () => {
    render(React.createElement(ProductCard, { product: makeProduct(5) }));

    expect(screen.queryByText("Low Stock")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add to Cart" })).toBeEnabled();
  });
});
