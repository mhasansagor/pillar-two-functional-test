import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(request: Request): Promise<NextResponse> {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const forceFailure =
    request.headers.get("x-force-fail") === "true" ||
    request.headers.get("x-force-fail") === "1";

  await new Promise((resolve) => setTimeout(resolve, 1500));

  if (forceFailure) {
    return NextResponse.json(
      { error: "Payment could not be processed. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, orderId: crypto.randomUUID() });
}
