"use client";

import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";
import { Toaster } from "sonner";
import { useCartStore } from "@/store/cartStore";

function CartHydrator(): null {
  useEffect(() => {
    void useCartStore.persist.rehydrate();
  }, []);

  return null;
}

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <SessionProvider>
      <CartHydrator />
      {children}
      <Toaster position="top-right" richColors />
    </SessionProvider>
  );
}
