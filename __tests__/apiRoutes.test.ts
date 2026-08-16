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
      new Request("http://localhost:3000/api/products")
    );
    const body = (await response.json()) as {
      products: Array<{ id: number; name: string; stock: number }>;
      total: number;
    };

    expect(response.status).toBe(200);
    expect(body.total).toBe(3);
    expect(body.products.map((product) => product.name)).toEqual([
      "MacBook Pro M2",
      "Logitech MX Master 3",
      "Dell XPS 15",
    ]);
  });

  it("makes empty and error product states testable", async () => {
    const empty = await getProducts(
      new Request("http://localhost:3000/api/products?state=empty")
    );
    const emptyBody = (await empty.json()) as { products: unknown[] };

    const error = await getProducts(
      new Request("http://localhost:3000/api/products?state=error")
    );
    const errorBody = (await error.json()) as { error?: string };

    expect(empty.status).toBe(200);
    expect(emptyBody.products).toEqual([]);
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
