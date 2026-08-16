import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProductGrid from "@/components/ProductGrid";
import { useCartStore } from "@/store/cartStore";

const successResponse = {
  products: [
    {
      id: 1,
      name: "MacBook Pro M2",
      category: "Laptops",
      price: 2499,
      stock: 8,
      image: "/assets/images/macbook-pro-m2.jpg",
    },
  ],
  total: 1,
};

function mockFetchOnce(response: Response | Promise<Response>): void {
  const fetchMock = vi.fn().mockResolvedValue(response);
  globalThis.fetch = fetchMock as unknown as typeof fetch;
}

describe("ProductGrid API states", () => {
  beforeEach(() => {
    localStorage.clear();
    useCartStore.setState({ items: [], status: "idle", hasHydrated: true });
    vi.restoreAllMocks();
  });

  it("shows loading skeletons and then renders products after success", async () => {
    mockFetchOnce(Response.json(successResponse));

    render(React.createElement(ProductGrid));

    expect(screen.getByLabelText("Loading products")).toHaveAttribute(
      "aria-busy",
      "true"
    );
    expect(await screen.findByText("MacBook Pro M2")).toBeInTheDocument();
    expect(screen.getByText("$2,499.00")).toBeInTheDocument();
  });

  it("shows an empty state for an empty product response", async () => {
    mockFetchOnce(Response.json({ products: [], total: 0 }));

    render(React.createElement(ProductGrid));

    expect(await screen.findByText("No products available")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Add to Cart" })).toBeNull();
  });

  it("shows an error with Retry and retries the product request", async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce(Response.json(successResponse));
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    render(React.createElement(ProductGrid));

    expect(await screen.findByText("Could not load products")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    expect(screen.getByLabelText("Loading products")).toBeInTheDocument();
    expect(await screen.findByText("MacBook Pro M2")).toBeInTheDocument();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  });
});
