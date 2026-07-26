export type Variant = {
  id: string;
  name: string;
  price: number;
  salePrice?: number;
  stock: number;
  attributes?: Record<string, string>;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  categorySlug: string;
  shortDescription: string;
  description: string;
  basePrice: number;
  salePrice?: number;
  images: string[];
  variants?: Variant[];
  rating: number;
  reviewCount: number;
  stock: number;
  tags: string[];
  isFeatured?: boolean;
  isNew?: boolean;
  isNewProduct?: boolean;
  isBestSeller?: boolean;
};

export type Category = {
  slug: string;
  name: string;
  description: string;
  emoji: string;
  isFeatured?: boolean;
};

export type CartItem = {
  productId: string;
  variantId?: string;
  qty: number;
};

export type Address = {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
};

export type Order = {
  id: string;
  items: { productId: string; name: string; qty: number; price: number; variantName?: string }[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  address: Address;
  paymentMethod: "razorpay" | "cod";
  paymentStatus: "pending" | "paid" | "failed";
  orderStatus: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
  email: string;
};
