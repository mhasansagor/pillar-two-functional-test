import { describe, expect, it } from "vitest";
import { getProtectedRouteResponse } from "@/lib/routeProtection";

function makeRequest(path: string, auth?: unknown) {
  const url = new URL(path, "http://localhost:3000");
  return {
    url: url.toString(),
    nextUrl: {
      pathname: url.pathname,
      search: url.search,
    },
    auth,
  };
}

describe("route protection", () => {
  it("redirects unauthenticated dashboard requests to login with callbackUrl", () => {
    const response = getProtectedRouteResponse(
      makeRequest("/dashboard/cart?coupon=test")
    );

    expect(response?.status).toBe(307);
    expect(response?.headers.get("location")).toBe(
      "http://localhost:3000/login?callbackUrl=%2Fdashboard%2Fcart%3Fcoupon%3Dtest"
    );
  });

  it("allows authenticated dashboard requests", () => {
    const response = getProtectedRouteResponse(
      makeRequest("/dashboard", { user: { name: "Ada" } })
    );

    expect(response).toBeNull();
  });

  it("redirects authenticated login requests to dashboard", () => {
    const response = getProtectedRouteResponse(
      makeRequest("/login", { user: { name: "Ada" } })
    );

    expect(response?.headers.get("location")).toBe(
      "http://localhost:3000/dashboard"
    );
  });
});
