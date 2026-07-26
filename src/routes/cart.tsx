import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart-store";
import { computeShipping, formatINR, FREE_SHIPPING_THRESHOLD } from "@/lib/format";
import { api } from "@/lib/api";
import type { Product } from "@/lib/types";

export const Route = createFileRoute("/cart")({
  loader: async () => {
    const products = await api.listProducts();
    return { products };
  },
  head: () => ({ meta: [{ title: "Your Cart — NamanKart" }] }),
  component: CartPage,
});

function CartPage() {
  const { products } = Route.useLoaderData() as { products: Product[] };
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);

  const detailed = items
    .map((it) => {
      const p = products.find((x) => x.id === it.productId || (x as any)._id === it.productId);
      const v = p?.variants?.find((x) => x.id === it.variantId);
      const price = v?.salePrice ?? v?.price ?? p?.salePrice ?? p?.basePrice ?? 0;
      return { ...it, p, v, price };
    })
    .filter((x) => x.p);

  const subtotal = detailed.reduce((n, x) => n + x.price * x.qty, 0);
  const shipping = computeShipping(subtotal);
  const total = subtotal + shipping - discount;

  function applyCoupon() {
    if (coupon.toUpperCase() === "BHAKTI10") {
      setDiscount(Math.round(subtotal * 0.1));
      toast.success("Coupon applied: 10% off");
    } else {
      toast.error("Invalid or expired coupon");
    }
  }

  if (detailed.length === 0) {
    return (
      <div className="container-page py-20 text-center">
        <div className="text-6xl">🛒</div>
        <h1 className="font-display text-3xl text-maroon mt-4">Your cart is empty</h1>
        <p className="text-muted-foreground mt-2">Add some sacred essentials to get started.</p>
        <Link
          to="/shop"
          className="inline-block mt-6 bg-saffron text-saffron-foreground px-6 py-3 rounded-full font-medium"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <h1 className="font-display text-3xl text-maroon mb-6">Your Cart ({detailed.length})</h1>
      <div className="grid md:grid-cols-[1fr_360px] gap-8">
        <div className="space-y-3">
          {detailed.map((it) => {
            return (
              <div
                key={it.productId + (it.variantId ?? "")}
                className="flex gap-4 border border-border rounded-lg bg-card p-3"
              >
                <div className="w-24 h-24 rounded-md overflow-hidden bg-cream shrink-0">
                  <img
                    src={it.p!.images[0]}
                    alt={it.p!.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    to="/product/$slug"
                    params={{ slug: it.p!.slug }}
                    className="font-medium hover:text-saffron line-clamp-2"
                  >
                    {it.p!.name}
                  </Link>
                  {it.v && <p className="text-xs text-muted-foreground">{it.v.name}</p>}
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex items-center border border-border rounded-md">
                      <button
                        onClick={() => setQty(it.productId, it.variantId, it.qty - 1)}
                        className="p-1.5 hover:bg-cream"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-sm">{it.qty}</span>
                      <button
                        onClick={() => setQty(it.productId, it.variantId, it.qty + 1)}
                        className="p-1.5 hover:bg-cream"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => remove(it.productId, it.variantId)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-maroon">{formatINR(it.price * it.qty)}</p>
                  <p className="text-xs text-muted-foreground">{formatINR(it.price)} each</p>
                </div>
              </div>
            );
          })}
        </div>

        <aside className="rounded-lg border border-border bg-card p-5 h-fit sticky top-32">
          <h2 className="font-semibold mb-4">Order Summary</h2>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatINR(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{shipping === 0 ? "FREE" : formatINR(shipping)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-saffron">
                <span>Discount</span>
                <span>−{formatINR(discount)}</span>
              </div>
            )}
          </div>
          {subtotal < FREE_SHIPPING_THRESHOLD && (
            <p className="text-xs text-muted-foreground mt-2">
              Add {formatINR(FREE_SHIPPING_THRESHOLD - subtotal)} more for free shipping.
            </p>
          )}
          <div className="mt-3 flex gap-2">
            <input
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              placeholder="Coupon code"
              className="flex-1 border border-border rounded-md px-3 py-2 text-sm bg-background"
            />
            <button
              onClick={applyCoupon}
              className="px-3 py-2 text-sm border border-saffron text-saffron rounded-md hover:bg-saffron hover:text-saffron-foreground"
            >
              Apply
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            Try <b>BHAKTI10</b> for 10% off
          </p>
          <div className="border-t border-border my-4" />
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span className="text-maroon">{formatINR(total)}</span>
          </div>
          <Link
            to="/checkout"
            className="mt-4 block text-center bg-saffron text-saffron-foreground font-medium py-3 rounded-md hover:opacity-90"
          >
            Proceed to Checkout
          </Link>
          <Link
            to="/shop"
            className="mt-2 block text-center text-sm text-muted-foreground hover:text-saffron"
          >
            ← Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
