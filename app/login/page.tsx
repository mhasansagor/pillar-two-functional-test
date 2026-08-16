import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";

export default function LoginPage(): JSX.Element {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
          <div className="h-64 w-full max-w-md animate-pulse rounded-lg border border-slate-200 bg-white shadow-sm" />
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
