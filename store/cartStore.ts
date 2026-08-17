import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getCartStorageKey } from "@/lib/cartStorage";
import type { Product } from "@/types/product";

export interface CartItem extends Product {
  quantity: number;
}

export type AddItemResult = "added" | "out-of-stock" | "max-stock";

interface CartState {
  items: CartItem[];
  status: "idle" | "checking-out" | "error";
  hasHydrated: boolean;
  addItem: (product: Product) => AddItemResult;
  increaseQuantity: (productId: number) => void;
  decreaseQuantity: (productId: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
  checkout: () => Promise<{ success: boolean; error?: string }>;
  totalCount: () => number;
  subtotal: () => number;
  setHasHydrated: (hasHydrated: boolean) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      status: "idle",
      hasHydrated: false,

      addItem: (product) => {
        if (product.stock === 0) {
          return "out-of-stock";
        }

        let result: AddItemResult = "added";

        set((state) => {
          const existing = state.items.find(
            (item) => item.id === product.id
          );

          if (existing) {
            if (existing.quantity >= existing.stock) {
              result = "max-stock";
              return state;
            }

            return {
              items: state.items.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          }

          return { items: [...state.items, { ...product, quantity: 1 }] };
        });

        return result;
      },

      increaseQuantity: (productId) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === productId && item.quantity < item.stock
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        }));
      },

      decreaseQuantity: (productId) => {
        set((state) => ({
          items: state.items
            .map((item) =>
              item.id === productId
                ? { ...item, quantity: Math.max(0, item.quantity - 1) }
                : item
            )
            .filter((item) => item.quantity > 0),
        }));
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        }));
      },

      clearCart: () => set({ items: [], status: "idle" }),

      checkout: async () => {
        set({ status: "checking-out" });
        try {
          const res = await fetch("/api/checkout", { method: "POST" });
          if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            set({ status: "error" });
            return {
              success: false,
              error: body.error ?? "Checkout failed. Please try again.",
            };
          }
          set({ items: [], status: "idle" });
          return { success: true };
        } catch {
          set({ status: "error" });
          return { success: false, error: "Network error. Please try again." };
        }
      },

      totalCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      subtotal: () =>
        get().items.reduce(
          (sum, item) => sum + item.quantity * item.price,
          0
        ),

      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: getCartStorageKey(),
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
