"use client";

import Image from "next/image";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { useCartStore } from "@/store/cartStore";

export default function Navbar(): JSX.Element {
  const { data: session } = useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const count = useCartStore((state) => state.totalCount());
  const hasHydrated = useCartStore((state) => state.hasHydrated);
  const visibleCount = hasHydrated ? count : 0;
  const initial = session?.user?.name?.[0] ?? session?.user?.email?.[0] ?? "U";

  const handleSignOut = async (): Promise<void> => {
    setIsSigningOut(true);
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          href="/dashboard"
          className="text-lg font-semibold text-ink transition hover:text-accent"
        >
          Dashboard
        </Link>

        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/dashboard/cart"
            aria-label={`${visibleCount} items in cart`}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-surface text-ink transition hover:bg-border"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
            {visibleCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs font-semibold text-white">
                {visibleCount}
              </span>
            )}
          </Link>

          {session?.user && (
            <div className="flex items-center gap-2">
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name ?? "User avatar"}
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full"
                />
              ) : (
                <div
                  aria-label="User avatar"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-surface text-sm font-medium text-ink"
                >
                  {initial.toUpperCase()}
                </div>
              )}
              <div className="hidden leading-tight sm:block">
                <p className="text-sm font-medium text-ink">
                  {session.user.name ?? "Signed-in user"}
                </p>
                {session.user.email && (
                  <p className="text-xs text-muted">{session.user.email}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  void handleSignOut();
                }}
                disabled={isSigningOut}
                aria-busy={isSigningOut}
                className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-ink transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSigningOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
