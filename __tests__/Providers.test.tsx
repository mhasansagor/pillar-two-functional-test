import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Providers from "@/components/Providers";
import { getCartStorageKey } from "@/lib/cartStorage";
import { useCartStore } from "@/store/cartStore";
import type { Product } from "@/types/product";

const authMocks = vi.hoisted(() => ({
  useSession: vi.fn(),
}));

vi.mock("next-auth/react", () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
  useSession: authMocks.useSession,
}));

const laptop: Product = {
  id: 1,
  name: "Admin Laptop",
  category: "Laptops",
  price: 1000,
  stock: 2,
  image: "/assets/images/laptop.jpg",
};

const earbuds: Product = {
  id: 2,
  name: "Manager Earbuds",
  category: "Gadget",
  price: 200,
  stock: 4,
  image: "/assets/images/earbuds.jpg",
};

function CartProbe(): JSX.Element {
  const hasHydrated = useCartStore((state) => state.hasHydrated);
  const items = useCartStore((state) => state.items);

  return (
    <div>
      <p>{hasHydrated ? "hydrated" : "loading"}</p>
      <p>{items.map((item) => item.name).join(",") || "empty"}</p>
    </div>
  );
}

function persistCart(email: string, product: Product): void {
  localStorage.setItem(
    getCartStorageKey(email),
    JSON.stringify({
      state: { items: [{ ...product, quantity: 1 }] },
      version: 0,
    })
  );
}

describe("Providers cart hydration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useCartStore.persist.setOptions({ name: getCartStorageKey() });
    useCartStore.setState({ items: [], status: "idle", hasHydrated: false });
  });

  it("hydrates a separate persisted cart for each signed-in user", async () => {
    persistCart("admin@example.com", laptop);
    persistCart("manager@example.com", earbuds);

    authMocks.useSession.mockReturnValue({
      status: "authenticated",
      data: { user: { email: "admin@example.com" } },
    });

    const { rerender } = render(
      <Providers>
        <CartProbe />
      </Providers>
    );

    expect(await screen.findByText("Admin Laptop")).toBeInTheDocument();

    authMocks.useSession.mockReturnValue({
      status: "authenticated",
      data: { user: { email: "manager@example.com" } },
    });

    rerender(
      <Providers>
        <CartProbe />
      </Providers>
    );

    await waitFor(() => {
      expect(screen.getByText("Manager Earbuds")).toBeInTheDocument();
    });
    expect(screen.queryByText("Admin Laptop")).not.toBeInTheDocument();
  });
});
