import { memo, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { Heart, Star } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart-store";
import { formatINR } from "@/lib/format";
import type { Product } from "@/lib/types";

import { getOptimizedImageUrl } from "@/lib/image";

export const ProductCard = memo(function ProductCard({ product }: { product: Product }) {
  const wished = useCart((s) => s.wishlist.includes(product.id));
  const toggleWish = useCart((s) => s.toggleWish);
  const add = useCart((s) => s.add);

  const price = useMemo(
    () => product.salePrice ?? product.basePrice,
    [product.salePrice, product.basePrice],
  );
  const off = useMemo(
    () =>
      product.salePrice
        ? Math.round(((product.basePrice - product.salePrice) / product.basePrice) * 100)
        : 0,
    [product.basePrice, product.salePrice],
  );
  const cover = useMemo(
    () => getOptimizedImageUrl(product.images?.[0] || "", { width: 400 }),
    [product.images]
  );

  return (
    <div className="group relative rounded-xl border border-border bg-card overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition">
      <Link to="/product/$slug" params={{ slug: product.slug }} className="block">
        <div className="aspect-square overflow-hidden bg-cream">
          <img
            src={cover}
            alt={product.name}
            loading="lazy"
            decoding="async"
            width={300}
            height={300}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        </div>
        {off > 0 && (
          <span className="absolute top-2 left-2 bg-saffron text-saffron-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full">
            {off}% OFF
          </span>
        )}
        {product.isNew && (
          <span className="absolute top-2 right-10 bg-gold text-gold-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full">
            NEW
          </span>
        )}
      </Link>
      <button
        onClick={() => toggleWish(product.id)}
        className="absolute top-2 right-2 p-1.5 rounded-full bg-background/90 border border-border hover:text-saffron"
        aria-label="Wishlist"
      >
        <Heart className={"h-4 w-4 " + (wished ? "fill-saffron text-saffron" : "")} />
      </button>

      <div className="p-3">
        <Link to="/product/$slug" params={{ slug: product.slug }} className="block">
          <h3 className="text-sm font-medium line-clamp-2 min-h-[2.5rem]">{product.name}</h3>
        </Link>
        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="h-3 w-3 fill-gold text-gold" />
          {product.rating} · {product.reviewCount} reviews
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-semibold text-maroon">{formatINR(price)}</span>
          {product.salePrice && (
            <span className="text-xs text-muted-foreground line-through">
              {formatINR(product.basePrice)}
            </span>
          )}
        </div>
        <button
          onClick={() => {
            add(product.id);
            toast.success(`${product.name} added to cart`);
          }}
          className="mt-3 w-full bg-saffron text-saffron-foreground text-sm font-medium py-2 rounded-md hover:opacity-90 transition"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
});
