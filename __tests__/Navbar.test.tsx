import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Navbar from "@/components/Navbar";
import { useCartStore } from "@/store/cartStore";

const authMocks = vi.hoisted(() => ({
  signOut: vi.fn(),
  useSession: vi.fn(),
}));

vi.mock("next-auth/react", () => ({
  signOut: authMocks.signOut,
  useSession: authMocks.useSession,
}));

describe("Navbar authentication UI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useCartStore.setState({ items: [], status: "idle", hasHydrated: true });
    authMocks.signOut.mockResolvedValue(undefined);
    authMocks.useSession.mockReturnValue({
      data: {
        user: {
          name: "Ada Lovelace",
          email: "ada@example.com",
          image: "/avatar.jpg",
        },
      },
    });
  });

  it("displays the signed-in user's name, email, avatar, and cart count", () => {
    useCartStore.getState().addItem({
      id: 1,
      name: "MacBook Pro M2",
      category: "Laptops",
      price: 2499,
      stock: 8,
      image: "/assets/images/macbook-pro-m2.jpg",
    });

    render(React.createElement(Navbar));

    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByText("ada@example.com")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Ada Lovelace" })).toBeInTheDocument();
    expect(screen.getByLabelText("1 items in cart")).toBeInTheDocument();
  });

  it("logs out and shows a pending state", () => {
    render(React.createElement(Navbar));

    fireEvent.click(screen.getByRole("button", { name: "Logout" }));

    expect(screen.getByRole("button", { name: "Logging out..." })).toBeDisabled();
    expect(authMocks.signOut).toHaveBeenCalledWith({ callbackUrl: "/login" });
  });
});
