/**
 * Production API client connecting NamanKart Frontend directly to Express + MongoDB Backend.
 */
import type { Address, Category, Order, Product } from "./types";

const RAW_API_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) || "https://namankartbackend.onrender.com";

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

  listProducts: async (params?: Record<string, string>): Promise<Product[]> => {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return fetchApi<Product[]>(`/products${query}`);
  },

  getProduct: async (slug: string): Promise<Product | undefined> => {
    try {
      return await fetchApi<Product>(`/products/${slug}`);
    } catch {
      return undefined;
    }
  },

  productsByCategory: async (slug: string): Promise<Product[]> => {
    return fetchApi<Product[]>(`/products?categorySlug=${slug}`);
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
    return fetchApi<Product[]>(`/products?q=${encodeURIComponent(q)}`);
  },

  createOrder: async (input: {
    items: Order["items"];
    address: Address;
    email: string;
    paymentMethod: Order["paymentMethod"];
    subtotal: number;
    shipping: number;
    discount: number;
    total: number;
  }): Promise<Order> => {
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
      }),
    });
  },

  getOrder: async (id: string, email?: string): Promise<Order | undefined> => {
    try {
      const order = await fetchApi<Order>(`/orders/${id}`);
      if (email && order.email?.toLowerCase() !== email.toLowerCase()) {
        return undefined;
      }
      return order;
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
};

/**
 * RAZORPAY INTEGRATION POINT
 */
export const RAZORPAY_KEY_ID =
  (import.meta.env.VITE_RAZORPAY_KEY_ID as string | undefined) 

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

export async function startRazorpayPayment(
  orderTotal: number,
  prefill?: { name?: string; email?: string; contact?: string },
): Promise<{ paid: boolean; ref?: string; cancelled?: boolean }> {
  const ok = await loadRazorpayScript();
  if (!ok || !window.Razorpay) {
    throw new Error("Could not load Razorpay. Check your internet connection.");
  }

  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay!({
      key: RAZORPAY_KEY_ID,
      amount: Math.round(orderTotal * 100), // paise
      currency: "INR",
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
        resolve({ paid: true, ref: resp.razorpay_payment_id });
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
