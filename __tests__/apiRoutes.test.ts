import { describe, expect, it, vi } from "vitest";
import { GET as getProducts } from "@/app/api/products/route";

const authMocks = vi.hoisted(() => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  auth: authMocks.auth,
}));

describe("product API", () => {
  it("returns 20 products per page and leaves the final page with the remainder", async () => {
    const firstPage = await getProducts(
      new Request("http://localhost:3000/api/products?page=1&perPage=20")
    );
    const firstBody = (await firstPage.json()) as {
      products: unknown[];
      total: number;
      page: number;
      perPage: number;
      totalPages: number;
    };

    const lastPage = await getProducts(
      new Request("http://localhost:3000/api/products?page=3&perPage=20")
    );
    const lastBody = (await lastPage.json()) as { products: unknown[] };

    expect(firstPage.status).toBe(200);
    expect(firstBody.total).toBe(50);
    expect(firstBody.page).toBe(1);
    expect(firstBody.perPage).toBe(20);
    expect(firstBody.totalPages).toBe(3);
    expect(firstBody.products).toHaveLength(20);
    expect(lastBody.products).toHaveLength(10);
  });

  it("filters products by category and search query", async () => {
    const response = await getProducts(
      new Request(
        "http://localhost:3000/api/products?category=Mobile&search=iphone"
      )
    );
    const body = (await response.json()) as {
      products: Array<{ category: string; name: string }>;
      total: number;
      categories: string[];
    };

    expect(response.status).toBe(200);
    expect(body.total).toBeGreaterThan(0);
    expect(body.categories).toContain("Mobile");
    expect(
      body.products.every(
        (product) =>
          product.category === "Mobile" &&
          product.name.toLowerCase().includes("iphone")
      )
    ).toBe(true);
  });
});

describe("checkout API", () => {
  it("requires an authenticated session", async () => {
    const { POST } = await import("@/app/api/checkout/route");

    authMocks.auth.mockResolvedValueOnce(null);
    const response = await POST(
      new Request("http://localhost:3000/api/checkout", { method: "POST" })
    );

    expect(response.status).toBe(401);
  });
});
