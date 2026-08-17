import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProductGrid from "@/components/ProductGrid";
import { useCartStore } from "@/store/cartStore";

const navigationMocks = vi.hoisted(() => ({
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => navigationMocks,
}));

const successResponse = {
  products: [
    {
      id: 1,
      name: "MacBook Air M5 13-Inch",
      category: "Laptops",
      price: 161999,
      stock: 8,
      image: "https://adminapi.applegadgetsbd.com/storage/media/large/MacBook-Air-M4-13-Incha-4820.png",
    },
    {
      id: 2,
      name: "Apple AirPods 4",
      category: "Gadget",
      price: 13799,
      stock: 11,
      image: "https://adminapi.applegadgetsbd.com/storage/media/large/Apple-AirPods-4-2341.png",
    },
  ],
  total: 2,
  page: 1,
  perPage: 20,
  totalPages: 1,
  categories: ["Laptops", "Accessories", "Mobile", "Tab", "Gadget", "Home Appliance"],
};

function mockFetchOnce(response: Response | Promise<Response>): void {
  const fetchMock = vi.fn().mockResolvedValue(response);
  globalThis.fetch = fetchMock as unknown as typeof fetch;
}

describe("ProductGrid API states", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    expect(await screen.findByText("MacBook Air M5 13-Inch")).toBeInTheDocument();
    expect(screen.getByText(/BDT\s*161,999/)).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: "Search products" })).toBeInTheDocument();
    expect(screen.queryByRole("combobox", { name: "Category" })).toBeNull();
  });

  it("requests products for the selected category", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(Response.json(successResponse))
      .mockResolvedValueOnce(
        Response.json({
          products: [
            {
              ...successResponse.products[0],
              id: 33,
              name: "Apple AirPods 4",
              category: "Gadget",
            },
          ],
          total: 1,
          categories: successResponse.categories,
        })
      );
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    render(React.createElement(ProductGrid));

    fireEvent.click(await screen.findByRole("button", { name: "Show filters" }));
    fireEvent.change(screen.getByRole("combobox", { name: "Category" }), {
      target: { value: "Gadget" },
    });

    expect(await screen.findByText("Apple AirPods 4")).toBeInTheDocument();
    await waitFor(() =>
      expect(fetchMock).toHaveBeenLastCalledWith(
        "/api/products?page=1&perPage=20&category=Gadget"
      )
    );
  });

  it("requests searched products from the API", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(Response.json(successResponse))
      .mockResolvedValueOnce(
        Response.json({
          products: [successResponse.products[1]],
          total: 1,
          page: 1,
          perPage: 20,
          totalPages: 1,
          categories: successResponse.categories,
        })
      );
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    render(React.createElement(ProductGrid));

    fireEvent.change(await screen.findByRole("searchbox", { name: "Search products" }), {
      target: { value: "airpods" },
    });

    expect(await screen.findByText("Apple AirPods 4")).toBeInTheDocument();
    await waitFor(() =>
      expect(fetchMock).toHaveBeenLastCalledWith(
        "/api/products?page=1&perPage=20&search=airpods"
      )
    );
    expect(screen.queryByText("MacBook Air M5 13-Inch")).not.toBeInTheDocument();
  });

  it("moves between product pages", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        Response.json({
          products: [successResponse.products[0]],
          total: 2,
          page: 1,
          perPage: 20,
          totalPages: 2,
          categories: successResponse.categories,
        })
      )
      .mockResolvedValueOnce(
        Response.json({
          products: [successResponse.products[1]],
          total: 2,
          page: 2,
          perPage: 20,
          totalPages: 2,
          categories: successResponse.categories,
        })
      );
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    render(React.createElement(ProductGrid));

    fireEvent.click(await screen.findByRole("button", { name: "Go to next page" }));

    expect(await screen.findByText("Apple AirPods 4")).toBeInTheDocument();
    await waitFor(() =>
      expect(fetchMock).toHaveBeenLastCalledWith("/api/products?page=2&perPage=20")
    );
  });

  it("shows an empty state for an empty product response", async () => {
    mockFetchOnce(Response.json({ products: [], total: 0 }));

    render(React.createElement(ProductGrid));

    expect(await screen.findByText("No products available")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Buy" })).toBeNull();
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
    expect(await screen.findByText("MacBook Air M5 13-Inch")).toBeInTheDocument();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  });
});
