import { describe, expect, it, vi } from "vitest";
import { GET as getProducts } from "@/app/api/products/route";

const authMocks = vi.hoisted(() => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  auth: authMocks.auth,
}));

describe("API route handlers", () => {
  it("returns the required products in a typed response shape", async () => {
    const response = await getProducts(
      new Request("http://localhost:3000/api/products?perPage=24")
    );
    const body = (await response.json()) as {
      products: Array<{ id: number; name: string; stock: number }>;
      total: number;
      categories: string[];
      page: number;
      perPage: number;
      totalPages: number;
    };

    expect(response.status).toBe(200);
    expect(body.total).toBe(50);
    expect(body.products).toHaveLength(20);
    expect(body.page).toBe(1);
    expect(body.perPage).toBe(20);
    expect(body.totalPages).toBe(3);
    expect(body.categories).toEqual([
      "Laptops",
      "Accessories",
      "Mobile",
      "Tab",
      "Gadget",
      "Home Appliance",
    ]);
    expect(body.products[0].name).toBe("MacBook Air M5 13-Inch");
  });

  it("paginates products and searches by product name", async () => {
    const response = await getProducts(
      new Request("http://localhost:3000/api/products?page=2&perPage=10&search=galaxy")
    );
    const body = (await response.json()) as {
      products: Array<{ name: string }>;
      total: number;
      page: number;
      totalPages: number;
    };

    expect(response.status).toBe(200);
    expect(body.total).toBeGreaterThan(0);
    expect(body.page).toBeLessThanOrEqual(body.totalPages);
    expect(
      body.products.every((product) =>
        product.name.toLowerCase().includes("galaxy")
      )
    ).toBe(true);
  });

  it("returns later product pages", async () => {
    const response = await getProducts(
      new Request("http://localhost:3000/api/products?page=3&perPage=20")
    );
    const body = (await response.json()) as {
      products: Array<{ name: string; category: string }>;
      total: number;
      page: number;
      totalPages: number;
    };

    expect(response.status).toBe(200);
    expect(body.total).toBe(50);
    expect(body.page).toBe(3);
    expect(body.totalPages).toBe(3);
    expect(body.products).toHaveLength(10);
    expect(body.products).toContainEqual(
      expect.objectContaining({
        name: "Philips NA231 Air Fryer - 6.2L",
        category: "Home Appliance",
      })
    );
  });

  it("filters products by category", async () => {
    const response = await getProducts(
      new Request("http://localhost:3000/api/products?category=Gadget")
    );
    const body = (await response.json()) as {
      products: Array<{ category: string }>;
      total: number;
      totalPages: number;
    };

    expect(response.status).toBe(200);
    expect(body.total).toBeGreaterThan(0);
    expect(body.totalPages).toBeGreaterThanOrEqual(1);
    expect(body.products.every((product) => product.category === "Gadget")).toBe(
      true
    );
  });

  it("makes empty and error product states testable", async () => {
    const empty = await getProducts(
      new Request("http://localhost:3000/api/products?state=empty")
    );
    const emptyBody = (await empty.json()) as {
      products: unknown[];
      categories: string[];
    };

    const error = await getProducts(
      new Request("http://localhost:3000/api/products?state=error")
    );
    const errorBody = (await error.json()) as { error?: string };

    expect(empty.status).toBe(200);
    expect(emptyBody.products).toEqual([]);
    expect(emptyBody.categories).toContain("Mobile");
    expect(error.status).toBe(500);
    expect(errorBody.error).toBe(
      "The product catalog is temporarily unavailable. Please try again."
    );
  });

  it("requires authentication and supports deterministic checkout failure", async () => {
    const { POST } = await import("@/app/api/checkout/route");

    authMocks.auth.mockResolvedValueOnce(null);
    const unauthorized = await POST(
      new Request("http://localhost:3000/api/checkout", { method: "POST" })
    );
    expect(unauthorized.status).toBe(401);

    authMocks.auth.mockResolvedValueOnce({ user: { name: "Ada" } });
    const failure = await POST(
      new Request("http://localhost:3000/api/checkout", {
        method: "POST",
        headers: { "x-force-fail": "true" },
      })
    );
    const failureBody = (await failure.json()) as { error?: string };

    expect(failure.status).toBe(500);
    expect(failureBody.error).toBe(
      "Payment could not be processed. Please try again."
    );
  });
});
