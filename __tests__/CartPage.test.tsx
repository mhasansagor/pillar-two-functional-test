import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CartPage from "@/app/dashboard/cart/page";
import { useCartStore } from "@/store/cartStore";
import type { Product } from "@/types/product";

const authMocks = vi.hoisted(() => ({
  useSession: vi.fn(),
}));

const navigationMocks = vi.hoisted(() => ({
  push: vi.fn(),
}));

vi.mock("next-auth/react", () => ({
  useSession: authMocks.useSession,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => navigationMocks,
}));

const product: Product = {
  id: 1,
  name: "MacBook Pro M2",
  category: "Laptops",
  price: 2499,
  stock: 2,
  image: "/assets/images/macbook-pro-m2.jpg",
};

function seedCart(): void {
  useCartStore.setState({ items: [], status: "idle", hasHydrated: true });
  useCartStore.getState().addItem(product);
}

describe("CartPage checkout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    seedCart();
    authMocks.useSession.mockReturnValue({
      data: { user: { name: "Ada", email: "ada@example.com" } },
    });
  });

  it("redirects unauthenticated users to login before checkout", () => {
    authMocks.useSession.mockReturnValue({ data: null });

    render(React.createElement(CartPage));

    fireEvent.click(screen.getByRole("button", { name: "Checkout" }));
    expect(navigationMocks.push).toHaveBeenCalledWith(
      "/login?callbackUrl=/dashboard/cart"
    );
  });

  it("shows loading, blocks repeated checkout clicks, and clears on success", async () => {
    let resolveFetch: (value: Response) => void = () => undefined;
    const fetchPromise = new Promise<Response>((resolve) => {
      resolveFetch = resolve;
    });
    const fetchMock = vi.fn().mockReturnValue(fetchPromise);
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    render(React.createElement(CartPage));

    const checkout = screen.getByRole("button", { name: "Checkout" });
    fireEvent.click(checkout);

    expect(await screen.findByRole("button", { name: "Processing..." })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Processing..." }));
    expect(fetchMock).toHaveBeenCalledTimes(1);

    resolveFetch(Response.json({ success: true }));

    await waitFor(() => {
      expect(useCartStore.getState().items).toEqual([]);
    });
    expect(await screen.findByText("Your cart is empty")).toBeInTheDocument();
  });

  it("preserves the cart when checkout fails", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        Response.json(
          { error: "Payment could not be processed. Please try again." },
          { status: 500 }
        )
      );
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    render(React.createElement(CartPage));

    fireEvent.click(screen.getByRole("button", { name: "Checkout" }));

    await waitFor(() => {
      expect(useCartStore.getState().items).toHaveLength(1);
      expect(screen.getByText("MacBook Pro M2")).toBeInTheDocument();
    });
  });
});
