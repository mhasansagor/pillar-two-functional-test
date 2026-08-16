import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { getProtectedRouteResponse } from "@/lib/routeProtection";

export default auth((req: NextRequest) => {
  return getProtectedRouteResponse(req) ?? NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
