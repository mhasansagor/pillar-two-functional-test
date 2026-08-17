import { describe, expect, it } from "vitest";
import { getProtectedRouteResponse } from "@/lib/routeProtection";

function createRequest(pathname: string, auth?: unknown) {
  return {
    url: `http://localhost:3000${pathname}`,
    nextUrl: {
      pathname,
      search: "",
    },
    auth,
  };
}

describe("route protection", () => {
  it("redirects anonymous dashboard users to login", () => {
    const response = getProtectedRouteResponse(createRequest("/dashboard/cart"));

    expect(response?.status).toBe(307);
    expect(response?.headers.get("location")).toBe(
      "http://localhost:3000/login?callbackUrl=%2Fdashboard%2Fcart"
    );
  });

  it("redirects authenticated users away from login", () => {
    const response = getProtectedRouteResponse(
      createRequest("/login", { user: { name: "Ada" } })
    );

    expect(response?.headers.get("location")).toBe(
      "http://localhost:3000/dashboard"
    );
  });

  it("allows authenticated dashboard requests", () => {
    const response = getProtectedRouteResponse(
      createRequest("/dashboard", { user: { name: "Ada" } })
    );

    expect(response).toBeNull();
  });
});
