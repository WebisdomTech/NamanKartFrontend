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
  _id?: string;
  slug: string;
  name: string;
  categorySlug: string;
  brand?: string;
  sku?: string;
  hsnCode?: string;
  gstRate?: number;
  basePrice: number;
  salePrice?: number;
  costPrice?: number;
  stock: number;
  lowStockThreshold?: number;
  weight?: string;
  dimensions?: string;
  images: string[];
  imageAlt?: string[];
  featuredImage?: string;
  thumbnail?: string;
  videoUrl?: string;
  shortDescription: string;
  description: string;
  overview?: string;
  benefits?: string;
  howToUse?: string;
  careInstructions?: string;
  spiritualSignificance?: string;
  packageContents?: string;
  specificationsTable?: any[];
  specifications?: Record<string, any>;
  shippingDescription?: string;
  shippingPoints?: string[];
  returnPolicy?: string;
  replacementPolicy?: string;
  damagedPolicy?: string;
  deliveryTimeline?: string;
  freeShipping?: boolean;
  reviewHeading?: string;
  reviewDescription?: string;
  reviewHighlights?: string[];
  rating: number;
  reviewCount: number;
  variants?: Variant[];
  tags: string[];
  isFeatured?: boolean;
  isNew?: boolean;
  isNewProduct?: boolean;
  isBestSeller?: boolean;
  isTrending?: boolean;
  isFestivalSpecial?: boolean;
  isHandcrafted?: boolean;
  isExclusive?: boolean;
  isActive?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  relatedProducts?: string[];
  frequentlyBoughtTogether?: string[];
  crossSellProducts?: string[];
  upsellProducts?: string[];
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

export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: "customer" | "admin" | "manager" | "super_admin";
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
