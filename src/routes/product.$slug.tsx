import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, Minus, Plus, ShieldCheck, Star, Truck } from "lucide-react";
import { toast } from "sonner";
import { ProductCard } from "@/components/ProductCard";
import { getOptimizedImageUrl } from "@/lib/image";
import { useCart } from "@/lib/cart-store";
import { useAuth } from "@/lib/auth-store";
import { formatINR } from "@/lib/format";
import { api } from "@/lib/api";
import type { Product, Variant } from "@/lib/types";
import { hasContent } from "@/lib/cmsUtils";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ params }) => {
    const product = await api.getProduct(params.slug);
    if (!product) throw notFound();
    const related = await api.related(product);
    return { product, related };
  },

  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.product.name} — NamanKart` },
          { name: "description", content: loaderData.product.shortDescription },
          { property: "og:title", content: loaderData.product.name },
          { property: "og:description", content: loaderData.product.shortDescription },
          { property: "og:type", content: "product" },
          { property: "og:url", content: `/product/${loaderData.product.slug}` },
        ]
      : [],
    links: loaderData ? [{ rel: "canonical", href: `/product/${loaderData.product.slug}` }] : [],
    scripts: loaderData
      ? [
          {
            type: "application/ld+json",
            children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              name: loaderData.product.name,
              description: loaderData.product.shortDescription,
              offers: {
                "@type": "Offer",
                priceCurrency: "INR",
                price: loaderData.product.salePrice ?? loaderData.product.basePrice,
                availability: "https://schema.org/InStock",
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: loaderData.product.rating,
                reviewCount: loaderData.product.reviewCount,
              },
            }),
          },
        ]
      : [],
  }),
  errorComponent: ({ error }) => <div className="container-page py-12">{error.message}</div>,
  notFoundComponent: () => (
    <div className="container-page py-16 text-center">
      <h1 className="font-display text-3xl">Product not found</h1>
      <Link to="/shop" className="text-saffron mt-4 inline-block">
        ← Back to shop
      </Link>
    </div>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { product, related } = Route.useLoaderData() as { product: Product; related: Product[] };
  const [variantId, setVariantId] = useState(product.variants?.[0]?.id);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<"details" | "specs" | "shipping" | "reviews">("details");
  const [activeImg, setActiveImg] = useState(0);
  const add = useCart((s) => s.add);
  const toggleWish = useCart((s) => s.toggleWish);
  const wished = useCart((s) => s.wishlist.includes(product.id));
  const user = useAuth((s) => s.user);
  const navigate = useNavigate();

  function requireLogin(redirect: "/wishlist" | "/cart" | "/checkout") {
    toast.message("Please log in to continue");
    navigate({ to: "/login", search: { redirect } });
  }

  const variant = product.variants?.find((v: Variant) => v.id === variantId);
  const price = variant?.salePrice ?? variant?.price ?? product.salePrice ?? product.basePrice;
  const base = variant?.price ?? product.basePrice;
  const off = base > price ? Math.round(((base - price) / base) * 100) : 0;
  const catName =
    typeof (product as any).category === "object" && (product as any).category
      ? (product as any).category.name
      : product.categorySlug;

  function onAdd() {
    if (!user) return requireLogin("/cart");
    add(product.id, variantId, qty);
    toast.success(`${product.name} added to cart`);
  }
  function onBuyNow() {
    if (!user) return requireLogin("/checkout");
    add(product.id, variantId, qty);
    navigate({ to: "/checkout" });
  }
  function onToggleWish() {
    if (!user) return requireLogin("/wishlist");
    toggleWish(product.id);
  }

  return (
    <div className="container-page py-8">
      <div className="text-xs text-muted-foreground mb-4">
        <Link to="/" className="hover:text-saffron">
          Home
        </Link>{" "}
        /{" "}
        <Link
          to="/category/$slug"
          params={{ slug: product.categorySlug }}
          className="hover:text-saffron"
        >
          {catName}
        </Link>{" "}
        / {product.name}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Gallery */}
        <div>
          <div className="aspect-square rounded-2xl overflow-hidden border border-border bg-cream">
            <img
              src={getOptimizedImageUrl(product.images[activeImg] ?? product.images[0] ?? "", {
                width: 800,
              })}
              alt={(product as any).imageAlt?.[activeImg] || product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {product.images.slice(0, 4).map((src, i) => (
                <button
                  key={`${src}-${i}`}
                  onClick={() => setActiveImg(i)}
                  className={
                    "aspect-square rounded-md overflow-hidden border " +
                    (activeImg === i ? "border-saffron ring-2 ring-saffron/30" : "border-border")
                  }
                >
                  <img
                    src={getOptimizedImageUrl(src, { width: 200 })}
                    alt={(product as any).imageAlt?.[i] || `${product.name} ${i + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <h1 className="font-display text-3xl text-maroon">{product.name}</h1>
          <div className="mt-1 flex items-center gap-2 text-sm">
            <span className="flex items-center gap-1 text-gold">
              <Star className="h-4 w-4 fill-gold" /> {product.rating}
            </span>
            <span className="text-muted-foreground">· {product.reviewCount} reviews</span>
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-maroon">{formatINR(price)}</span>
            {off > 0 && (
              <span className="text-muted-foreground line-through">{formatINR(base)}</span>
            )}
            {off > 0 && <span className="text-saffron font-medium text-sm">{off}% off</span>}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Inclusive of all taxes. Free shipping above ₹999.
          </p>

          <p className="mt-5 text-sm">{product.shortDescription}</p>

          {product.variants && (
            <div className="mt-6">
              <p className="text-sm font-medium mb-2">Choose variant</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v: Variant, idx: number) => (
                  <button
                    key={v.id || v.name || idx}
                    onClick={() => setVariantId(v.id)}
                    className={
                      "px-4 py-2 rounded-md border text-sm " +
                      (variantId === v.id
                        ? "border-saffron bg-saffron/10 text-saffron font-medium"
                        : "border-border hover:border-saffron")
                    }
                  >
                    {v.name} · {formatINR(v.salePrice ?? v.price)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center gap-3">
            <div className="flex items-center border border-border rounded-md">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="p-2 hover:bg-cream"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center font-medium">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="p-2 hover:bg-cream">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <span className="text-xs text-muted-foreground">
              {(variant?.stock ?? product.stock) > 5
                ? "In stock"
                : `Only ${variant?.stock ?? product.stock} left`}
            </span>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={onAdd}
              className="flex-1 min-w-[140px] bg-saffron text-saffron-foreground font-medium py-3 rounded-md hover:opacity-90"
            >
              Add to Cart
            </button>
            <button
              onClick={onBuyNow}
              className="flex-1 min-w-[140px] bg-maroon text-maroon-foreground font-medium py-3 rounded-md hover:opacity-90"
            >
              Buy Now
            </button>
            <button
              onClick={onToggleWish}
              className="p-3 border border-border rounded-md hover:border-saffron"
            >
              <Heart className={"h-5 w-5 " + (wished ? "fill-saffron text-saffron" : "")} />
            </button>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 p-3 rounded-md bg-cream/60">
              <Truck className="h-4 w-4 text-saffron" /> Free shipping ₹999+
            </div>
            <div className="flex items-center gap-2 p-3 rounded-md bg-cream/60">
              <ShieldCheck className="h-4 w-4 text-saffron" /> Temple-sourced authenticity
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-12">
        <div className="border-b border-border flex flex-wrap gap-2">
          {(
            [
              ["details", "Details"],
              ["specs", "Specifications"],
              ["shipping", "Shipping & Returns"],
              ["reviews", `Reviews (${product.reviewCount})`],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={
                "px-4 py-2 text-sm -mb-px border-b-2 " +
                (tab === k
                  ? "border-saffron text-saffron font-medium"
                  : "border-transparent hover:text-saffron")
              }
            >
              {label}
            </button>
          ))}
        </div>
        <div className="py-6 text-sm leading-relaxed space-y-4">
          {tab === "details" && (
            <div className="space-y-4">
              <p className="whitespace-pre-line">{product.description || product.shortDescription}</p>

              {hasContent(product.overview) && (
                <div className="p-3 bg-cream/50 rounded-md border border-border/50">
                  <h4 className="font-semibold text-maroon mb-1 text-xs uppercase tracking-wide">Overview</h4>
                  <p className="text-xs text-muted-foreground whitespace-pre-line">{product.overview}</p>
                </div>
              )}

              {hasContent(product.benefits) && (
                <div className="p-3 bg-cream/50 rounded-md border border-border/50">
                  <h4 className="font-semibold text-maroon mb-1 text-xs uppercase tracking-wide">Key Benefits & Spiritual Virtues</h4>
                  <p className="text-xs text-muted-foreground whitespace-pre-line">{product.benefits}</p>
                </div>
              )}

              {hasContent(product.howToUse) && (
                <div className="p-3 bg-cream/50 rounded-md border border-border/50">
                  <h4 className="font-semibold text-maroon mb-1 text-xs uppercase tracking-wide">How To Use & Ritual Guidance</h4>
                  <p className="text-xs text-muted-foreground whitespace-pre-line">{product.howToUse}</p>
                </div>
              )}

              {hasContent(product.careInstructions) && (
                <div className="p-3 bg-cream/50 rounded-md border border-border/50">
                  <h4 className="font-semibold text-maroon mb-1 text-xs uppercase tracking-wide">Care Instructions</h4>
                  <p className="text-xs text-muted-foreground whitespace-pre-line">{product.careInstructions}</p>
                </div>
              )}

              {hasContent(product.spiritualSignificance) && (
                <div className="p-3 bg-cream/50 rounded-md border border-border/50">
                  <h4 className="font-semibold text-maroon mb-1 text-xs uppercase tracking-wide">Spiritual Significance</h4>
                  <p className="text-xs text-muted-foreground whitespace-pre-line">{product.spiritualSignificance}</p>
                </div>
              )}

              {hasContent(product.packageContents) && (
                <div className="p-3 bg-cream/50 rounded-md border border-border/50">
                  <h4 className="font-semibold text-maroon mb-1 text-xs uppercase tracking-wide">Package Contents</h4>
                  <p className="text-xs text-muted-foreground">{product.packageContents}</p>
                </div>
              )}
            </div>
          )}
          {tab === "specs" && (
            <div className="space-y-3">
              <ul className="space-y-1">
                <li>
                  <b>Category:</b> {catName}
                </li>
                {product.brand && (
                  <li>
                    <b>Brand:</b> {product.brand}
                  </li>
                )}
                {product.material && (
                  <li>
                    <b>Material:</b> {product.material}
                  </li>
                )}
                {product.beadCount && (
                  <li>
                    <b>Bead Count:</b> {product.beadCount}
                  </li>
                )}
                {product.finish && (
                  <li>
                    <b>Finish:</b> {product.finish}
                  </li>
                )}
                {product.craftsmanship && (
                  <li>
                    <b>Craftsmanship:</b> {product.craftsmanship}
                  </li>
                )}
                <li>
                  <b>Country of Origin:</b> {product.countryOfOrigin || "India"}
                </li>
              </ul>

              {Array.isArray(product.specificationsTable) &&
                product.specificationsTable.length > 0 && (
                  <div className="mt-4 border border-border rounded-lg overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-cream border-b border-border">
                        <tr>
                          <th className="p-2.5 font-bold text-maroon">Specification</th>
                          <th className="p-2.5 font-bold text-maroon">Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {product.specificationsTable.map((row: any, i: number) => (
                          <tr key={i} className="border-b border-border/50">
                            <td className="p-2.5 font-medium">
                              {row.key || row.attribute || `Spec ${i + 1}`}
                            </td>
                            <td className="p-2.5 text-muted-foreground">
                              {row.value || row.detail || String(row)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
            </div>
          )}
          {tab === "shipping" && (
            <div className="space-y-3">
              <p className="font-medium text-maroon">
                {product.shippingDescription || "Standard PAN India Shipping & Delivery Policy"}
              </p>
              {product.deliveryTimeline && (
                <div className="text-xs p-2.5 bg-cream/70 rounded-md border border-saffron/20 font-medium text-maroon">
                  🚚 Expected Timeline: {product.deliveryTimeline}
                </div>
              )}
              {Array.isArray(product.shippingPoints) && product.shippingPoints.length > 0 ? (
                <ul className="space-y-1 text-xs">
                  {product.shippingPoints.map((pt: string, i: number) => (
                    <li key={i}>• {pt}</li>
                  ))}
                </ul>
              ) : (
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>• Free shipping on orders above ₹999. Flat ₹79 below.</p>
                  <p>• Dispatch within 24-48 hours of order confirmation.</p>
                  <p>• 7-day easy returns for unopened items.</p>
                  <p>• COD available across India.</p>
                </div>
              )}
            </div>
          )}
          {tab === "reviews" && (
            <div className="space-y-4">
              <h4 className="font-semibold text-base text-maroon">
                {product.reviewHeading || "Devotee Verification & Rating"}
              </h4>
              <p className="text-xs text-muted-foreground">
                {product.reviewDescription || "Every item is temple-sourced and quality checked before dispatch."}
              </p>
              {Array.isArray(product.reviewHighlights) && product.reviewHighlights.length > 0 && (
                <div className="flex flex-wrap gap-2 my-2">
                  {product.reviewHighlights.map((hl: string, i: number) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-cream text-saffron font-medium text-xs rounded-full border border-saffron/20"
                    >
                      ✓ {hl}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Product FAQs */}
      {Array.isArray((product as any).faqs) && (product as any).faqs.length > 0 && (
        <section className="mt-12 bg-cream/30 p-6 md:p-8 rounded-2xl border border-border">
          <h2 className="font-display text-2xl text-maroon mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {(product as any).faqs.map((faq: { question: string; answer: string }, idx: number) => (
              <details key={idx} className="group border border-border/80 bg-background rounded-xl p-4 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between font-semibold text-sm text-foreground cursor-pointer">
                  <span>{faq.question}</span>
                  <span className="ml-2 transition-transform group-open:rotate-180 text-saffron">↓</span>
                </summary>
                <p className="mt-3 text-xs md:text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-2xl text-maroon mb-6">You may also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((p: Product, idx: number) => (
              <ProductCard key={p.id || (p as any)._id || p.slug || idx} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
