import { describe, expect, it } from "vitest";
import { getCartStorageKey } from "@/lib/cartStorage";

describe("cart storage keys", () => {
  it("scopes persisted carts by normalized user email", () => {
    expect(getCartStorageKey("Admin@Example.com ")).toBe(
      "pillar-2-cart:admin%40example.com"
    );
    expect(getCartStorageKey("manager@example.com")).toBe(
      "pillar-2-cart:manager%40example.com"
    );
  });

  it("uses a guest cart when there is no signed-in email", () => {
    expect(getCartStorageKey()).toBe("pillar-2-cart:guest");
    expect(getCartStorageKey(" ")).toBe("pillar-2-cart:guest");
  });
});
