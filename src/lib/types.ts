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
  reviewHeading?: string;
  reviewDescription?: string;
  reviewHighlights?: string[];
  material?: string;
  beadCount?: string | number;
  availableSizes?: string;
  finish?: string;
  craftsmanship?: string;
  color?: string;
  usage?: string;
  suitableFor?: string;
  occasion?: string;
  reusable?: string;
  countryOfOrigin?: string;
  authenticity?: string;
  specificationsTable?: any[];
  specifications?: Record<string, any>;
  shippingDescription?: string;
  shippingPoints?: string[];
  returnPolicy?: string;
  replacementPolicy?: string;
  damagedPolicy?: string;
  deliveryTimeline?: string;
  freeShipping?: boolean;
  reviewSection?: Record<string, any>;
  h1?: string;
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  primaryKeywords?: string[];
  secondaryKeywords?: string[];
  searchIntent?: string;
  canonical?: string;
  robots?: string;
  openGraph?: Record<string, any>;
  twitterCard?: Record<string, any>;
  seo?: Record<string, any>;
  whyChoose?: string[];
  trustContent?: string;
  qualityContent?: string;
  authorityContent?: string;
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
