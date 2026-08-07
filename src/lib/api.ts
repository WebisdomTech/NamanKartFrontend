/**
 * Production API client connecting NamanKart Frontend directly to Express + MongoDB Backend.
 */
import type { Address, AuthUser, Category, Order, Product } from "./types";

const RAW_API_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
  "https://namankartbackend.onrender.com";

/** Single Source of Truth for API version prefix */
export const API_BASE_URL = RAW_API_URL.replace(/\/+$/, "").endsWith("/api/v1")
  ? RAW_API_URL.replace(/\/+$/, "")
  : `${RAW_API_URL.replace(/\/+$/, "")}/api/v1`;

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;
  const token = typeof window !== "undefined" ? localStorage.getItem("nk_user_token") : null;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.message || `API error: ${res.status}`);
  }

  const json = await res.json();
  return json.data !== undefined ? json.data : json;
}

let categoriesCache: Category[] | null = null;

export const api = {
  listCategories: async (): Promise<Category[]> => {
    if (categoriesCache) return categoriesCache;
    const res = await fetchApi<Category[]>("/categories");
    categoriesCache = res;
    return res;
  },

  getCategory: async (slug: string): Promise<Category | undefined> => {
    try {
      return await fetchApi<Category>(`/categories/${slug}`);
    } catch {
      return undefined;
    }
  },

  // The backend paginates /products (default 10 per page). Nothing in this
  // app has page-through UI — every caller expects the full catalog — so
  // request a high limit by default; callers can still override it.
  listProducts: async (params?: Record<string, string>): Promise<Product[]> => {
    const query = new URLSearchParams({ limit: "100", ...params }).toString();
    return fetchApi<Product[]>(`/products?${query}`);
  },

  getProduct: async (slug: string): Promise<Product | undefined> => {
    try {
      return await fetchApi<Product>(`/products/${slug}`);
    } catch {
      return undefined;
    }
  },

  productsByCategory: async (slug: string): Promise<Product[]> => {
    return fetchApi<Product[]>(`/products?categorySlug=${slug}&limit=100`);
  },

  related: async (product: Product): Promise<Product[]> => {
    try {
      return await fetchApi<Product[]>(`/products/${product.slug}/related`);
    } catch {
      return [];
    }
  },

  search: async (q: string): Promise<Product[]> => {
    if (!q.trim()) return [];
    return fetchApi<Product[]>(`/products?q=${encodeURIComponent(q)}&limit=100`);
  },

  createOrder: async (input: {
    items: Order["items"];
    address: Address;
    email: string;
    paymentMethod: Order["paymentMethod"];
    couponCode?: string;
  }): Promise<Order> => {
    // Pricing (subtotal/shipping/discount/total) is always computed and
    // trusted server-side from live product prices and the coupon code —
    // the backend ignores anything else, so there's nothing to send here.
    return fetchApi<Order>("/orders", {
      method: "POST",
      body: JSON.stringify({
        items: input.items.map((it) => ({
          productId: it.productId,
          variantId: it.variantName ? it.productId + "-v1" : undefined,
          qty: it.qty,
        })),
        shippingAddress: input.address,
        email: input.email,
        paymentMethod: input.paymentMethod,
        couponCode: input.couponCode,
      }),
    });
  },

  // Non-owners are rejected server-side (403), so email must be supplied
  // for anyone who isn't looking up their own logged-in order.
  getOrder: async (id: string, email?: string): Promise<Order | undefined> => {
    try {
      const query = email ? `?email=${encodeURIComponent(email)}` : "";
      return await fetchApi<Order>(`/orders/${id}${query}`);
    } catch {
      return undefined;
    }
  },

  listMyOrders: async (): Promise<Order[]> => {
    try {
      return await fetchApi<Order[]>("/orders");
    } catch {
      return [];
    }
  },

  applyCoupon: async (
    code: string,
    orderAmount: number,
  ): Promise<{
    code: string;
    discount: number;
    type: string;
    value: number;
    finalAmount: number;
  }> => {
    return fetchApi("/coupons/apply", {
      method: "POST",
      body: JSON.stringify({ code, orderAmount }),
    });
  },

  register: async (input: {
    fullName: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<{ user: AuthUser; tokens: { accessToken: string; refreshToken: string } }> => {
    return fetchApi("/auth/register", { method: "POST", body: JSON.stringify(input) });
  },

  login: async (input: {
    email: string;
    password: string;
  }): Promise<{ user: AuthUser; accessToken: string; refreshToken: string }> => {
    return fetchApi("/auth/login", { method: "POST", body: JSON.stringify(input) });
  },

  getMe: async (): Promise<AuthUser> => {
    return fetchApi("/auth/me");
  },

  // Always resolves with the same generic message whether or not the address
  // is registered — the backend deliberately gives nothing away, so the UI
  // must not branch on the result either.
  forgotPassword: async (email: string): Promise<{ message: string }> => {
    return fetchApi("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  // `resetToken` comes from the ?token= query param on the emailed link.
  resetPassword: async (input: {
    resetToken: string;
    newPassword: string;
  }): Promise<{ message: string }> => {
    return fetchApi("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  // Asks the backend to create a real Razorpay order for an existing order.
  // The amount and key come from the server — never from the client.
  createRazorpayOrder: async (
    orderId: string,
    email: string,
  ): Promise<{
    razorpayOrderId: string;
    amount: number;
    currency: string;
    keyId: string;
    paymentId: string;
  }> => {
    return fetchApi("/payments/razorpay/create-order", {
      method: "POST",
      body: JSON.stringify({ orderId, email }),
    });
  },

  // Server-side HMAC signature verification. Only this call marks an order
  // paid and deducts inventory — a client can't fake it.
  verifyRazorpayPayment: async (input: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    email: string;
  }): Promise<{ order: Order }> => {
    return fetchApi("/payments/razorpay/verify", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
};

/**
 * RAZORPAY INTEGRATION POINT
 */
export const RAZORPAY_KEY_ID = (import.meta.env.VITE_RAZORPAY_KEY_ID as string | undefined) || "";

type RazorpaySuccess = {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

/**
 * Opens the Razorpay checkout for a server-created Razorpay order.
 *
 * Everything security-relevant (amount, currency, order id, key) comes from
 * the backend's /payments/razorpay/create-order response. The returned
 * signature fields must then be sent to /payments/razorpay/verify — the
 * payment is not trusted until the server verifies that HMAC.
 */
export async function startRazorpayPayment(
  rzpOrder: { razorpayOrderId: string; amount: number; currency: string; keyId: string },
  prefill?: { name?: string; email?: string; contact?: string },
): Promise<{
  paid: boolean;
  cancelled?: boolean;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
}> {
  const ok = await loadRazorpayScript();
  if (!ok || !window.Razorpay) {
    throw new Error("Could not load Razorpay. Check your internet connection.");
  }

  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay!({
      key: rzpOrder.keyId,
      order_id: rzpOrder.razorpayOrderId,
      amount: rzpOrder.amount, // already in paise, server-issued
      currency: rzpOrder.currency,
      name: "NamanKart",
      description: "Devotional products order",
      image: "/favicon.ico",
      prefill: {
        name: prefill?.name ?? "",
        email: prefill?.email ?? "",
        contact: prefill?.contact ?? "",
      },
      notes: { source: "namankart-web" },
      theme: { color: "#C8102E" },
      handler: (resp: RazorpaySuccess) => {
        resolve({
          paid: true,
          razorpayOrderId: resp.razorpay_order_id ?? rzpOrder.razorpayOrderId,
          razorpayPaymentId: resp.razorpay_payment_id,
          razorpaySignature: resp.razorpay_signature,
        });
      },
      modal: {
        ondismiss: () => resolve({ paid: false, cancelled: true }),
      },
    });
    try {
      rzp.open();
    } catch (e) {
      reject(e);
    }
  });
}
