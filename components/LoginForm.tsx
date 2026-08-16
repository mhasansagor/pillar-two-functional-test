"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function LoginForm(): JSX.Element {
  const params = useSearchParams();
  const rawCallbackUrl = params.get("callbackUrl");
  const callbackUrl =
    rawCallbackUrl?.startsWith("/") && !rawCallbackUrl.startsWith("//")
      ? rawCallbackUrl
      : "/dashboard";
  const authError = params.get("error");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async (): Promise<void> => {
    setError(null);
    setIsSubmitting(true);

    try {
      await signIn("google", { callbackUrl });
    } catch {
      setError("Google sign-in is unavailable right now. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-600">
            Pillar 2
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-slate-900">
            Sign in
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Use your Google account to access the dashboard and product catalog.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            void handleGoogleSignIn();
          }}
          aria-label="Sign in with Google"
          aria-busy={isSubmitting}
          disabled={isSubmitting}
          className="mt-6 flex w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            aria-hidden="true"
            focusable="false"
          >
            <path
              fill="#4285F4"
              d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.87 2.7-6.62Z"
            />
            <path
              fill="#34A853"
              d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.98v2.33A9 9 0 0 0 9 18Z"
            />
            <path
              fill="#FBBC05"
              d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.98A9 9 0 0 0 0 9c0 1.45.35 2.83.98 4.03l2.97-2.33Z"
            />
            <path
              fill="#EA4335"
              d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .98 4.97l2.97 2.33C4.66 5.17 6.65 3.58 9 3.58Z"
            />
          </svg>
          {isSubmitting ? "Signing in..." : "Sign in with Google"}
        </button>

        {(error || authError) && (
          <p
            aria-live="polite"
            className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {error ??
              "Google sign-in could not be completed. Please try again."}
          </p>
        )}
      </div>
    </main>
  );
}
