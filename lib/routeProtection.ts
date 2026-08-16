import { NextResponse } from "next/server";

interface AuthenticatedRequest {
  url: string;
  nextUrl: {
    pathname: string;
    search: string;
  };
  auth?: unknown;
}

export function getProtectedRouteResponse(
  request: AuthenticatedRequest
): NextResponse | null {
  const { pathname, search } = request.nextUrl;
  const isLoggedIn = Boolean(request.auth);

  if (pathname === "/login" && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (pathname.startsWith("/dashboard") && !isLoggedIn) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return null;
}
