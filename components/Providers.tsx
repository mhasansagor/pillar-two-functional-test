"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { Toaster } from "sonner";
import { getCartStorageKey } from "@/lib/cartStorage";
import { useCartStore } from "@/store/cartStore";

function CartHydrator(): null {
  const { data: session, status } = useSession();
  const activeStorageKey = useRef<string | null>(null);

  useEffect(() => {
    if (status === "loading") {
      useCartStore.getState().setHasHydrated(false);
      return;
    }

    const storageKey = getCartStorageKey(session?.user?.email);
    if (activeStorageKey.current === storageKey) {
      return;
    }

    activeStorageKey.current = storageKey;
    useCartStore.getState().setHasHydrated(false);
    useCartStore.persist.setOptions({ name: storageKey });

    if (!localStorage.getItem(storageKey)) {
      useCartStore.setState({
        items: [],
        status: "idle",
        hasHydrated: true,
      });
      return;
    }

    void useCartStore.persist.rehydrate();
  }, [session?.user?.email, status]);

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
