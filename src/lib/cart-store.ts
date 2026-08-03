import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "./types";

type Coupon = { code: string; discount: number };

type CartState = {
  items: CartItem[];
  wishlist: string[];
  coupon: Coupon | null;
  add: (productId: string, variantId?: string, qty?: number) => void;
  remove: (productId: string, variantId?: string) => void;
  setQty: (productId: string, variantId: string | undefined, qty: number) => void;
  clear: () => void;
  toggleWish: (productId: string) => void;
  count: () => number;
  applyCoupon: (coupon: Coupon) => void;
  clearCoupon: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      wishlist: [],
      coupon: null,
      add: (productId, variantId, qty = 1) =>
        set((s) => {
          const i = s.items.findIndex(
            (x) => x.productId === productId && x.variantId === variantId,
          );
          if (i >= 0) {
            const next = [...s.items];
            next[i] = { ...next[i], qty: next[i].qty + qty };
            return { items: next };
          }
          return { items: [...s.items, { productId, variantId, qty }] };
        }),
      remove: (productId, variantId) =>
        set((s) => ({
          items: s.items.filter((x) => !(x.productId === productId && x.variantId === variantId)),
        })),
      setQty: (productId, variantId, qty) =>
        set((s) => ({
          items: s.items
            .map((x) =>
              x.productId === productId && x.variantId === variantId ? { ...x, qty } : x,
            )
            .filter((x) => x.qty > 0),
        })),
      clear: () => set({ items: [], coupon: null }),
      toggleWish: (productId) =>
        set((s) => ({
          wishlist: s.wishlist.includes(productId)
            ? s.wishlist.filter((x) => x !== productId)
            : [...s.wishlist, productId],
        })),
      count: () => get().items.reduce((n, x) => n + x.qty, 0),
      applyCoupon: (coupon) => set({ coupon }),
      clearCoupon: () => set({ coupon: null }),
    }),
    { name: "nk-cart" },
  ),
);
