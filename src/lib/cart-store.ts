import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "./types";

type Coupon = { code: string; discount: number };

type CartState = {
  items: CartItem[];
  wishlist: string[];
  coupon: Coupon | null;
  /** Account this basket belongs to, so it is never handed to a different user. */
  ownerEmail: string | null;
  add: (productId: string, variantId?: string, qty?: number) => void;
  remove: (productId: string, variantId?: string) => void;
  setQty: (productId: string, variantId: string | undefined, qty: number) => void;
  clear: () => void;
  toggleWish: (productId: string) => void;
  count: () => number;
  applyCoupon: (coupon: Coupon) => void;
  clearCoupon: () => void;
  /** Called after a confirmed purchase: empties the cart and drops the
   *  purchased products from the wishlist (you don't need reminding to buy
   *  something you now own). */
  completePurchase: (purchasedProductIds: string[]) => void;
  /** Wipes all basket state. Must run on logout — this store is persisted to
   *  localStorage per browser, not per account, so without this the next
   *  person to sign in on the same device inherits the previous user's
   *  cart and wishlist. */
  resetForNewSession: () => void;
  /** Binds the basket to an account. If it currently belongs to someone else
   *  (e.g. the previous user closed the browser without logging out) it is
   *  cleared rather than inherited. */
  claimForUser: (email: string) => void;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      wishlist: [],
      coupon: null,
      ownerEmail: null,
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
      completePurchase: (purchasedProductIds) =>
        set((s) => ({
          items: [],
          coupon: null,
          wishlist: s.wishlist.filter((id) => !purchasedProductIds.includes(id)),
        })),
      resetForNewSession: () => set({ items: [], wishlist: [], coupon: null, ownerEmail: null }),
      claimForUser: (email) =>
        set((s) => {
          const normalized = email.toLowerCase();
          if (s.ownerEmail && s.ownerEmail !== normalized) {
            return { items: [], wishlist: [], coupon: null, ownerEmail: normalized };
          }
          return { ownerEmail: normalized };
        }),
    }),
    { name: "nk-cart" },
  ),
);
