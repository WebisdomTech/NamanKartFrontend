import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "./api";
import { useCart } from "./cart-store";
import type { AuthUser } from "./types";

const TOKEN_KEY = "nk_user_token";

type AuthState = {
  user: AuthUser | null;
  status: "idle" | "loading" | "ready";
  login: (email: string, password: string) => Promise<void>;
  register: (input: {
    fullName: string;
    email: string;
    password: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => void;
  hydrate: () => Promise<void>;
};

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      status: "idle",

      login: async (email, password) => {
        const { user, accessToken } = await api.login({ email, password });
        localStorage.setItem(TOKEN_KEY, accessToken);
        useCart.getState().claimForUser(user.email);
        set({ user, status: "ready" });
      },

      register: async (input) => {
        const { user, tokens } = await api.register(input);
        localStorage.setItem(TOKEN_KEY, tokens.accessToken);
        useCart.getState().claimForUser(user.email);
        set({ user, status: "ready" });
      },

      logout: () => {
        localStorage.removeItem(TOKEN_KEY);
        // Basket state is persisted per browser, not per account — clear it
        // so the next person signing in on this device doesn't inherit the
        // previous user's cart and wishlist.
        useCart.getState().resetForNewSession();
        set({ user: null, status: "ready" });
      },

      // Confirms the stored token is still valid and refreshes the cached
      // profile — call once on app load.
      hydrate: async () => {
        if (get().status !== "idle") return;
        if (typeof window === "undefined" || !localStorage.getItem(TOKEN_KEY)) {
          set({ status: "ready" });
          return;
        }
        try {
          const user = await api.getMe();
          useCart.getState().claimForUser(user.email);
          set({ user, status: "ready" });
        } catch {
          localStorage.removeItem(TOKEN_KEY);
          set({ user: null, status: "ready" });
        }
      },
    }),
    { name: "nk-auth", partialize: (s) => ({ user: s.user }) },
  ),
);
