import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { ProductCard } from "@/components/ProductCard";
import { api } from "@/lib/api";
import type { Category, Product } from "@/lib/types";
import { useMemo } from "react";
import { hasContent } from "@/lib/cmsUtils";

type ShopSearch = { cat?: string; sort: "popular" | "low" | "high" | "new"; max?: number };

const searchSchema = z.object({
  cat: fallback(z.string().optional(), undefined),
  sort: fallback(z.enum(["popular", "low", "high", "new"]), "popular").default("popular"),
  max: fallback(z.number().optional(), undefined),
});

export const Route = createFileRoute("/shop")({
  loader: async () => {
    const [categories, products] = await Promise.all([api.listCategories(), api.listProducts()]);
    return { categories, products };
  },
  head: () => ({
    meta: [
      { title: "Shop All — NamanKart" },
      {
        name: "description",
        content:
          "Browse the full NamanKart catalog — malas, idols, puja items, copper-brass, attars and more.",
      },
      { property: "og:title", content: "Shop All — NamanKart" },
      { property: "og:url", content: "/shop" },
    ],
    links: [{ rel: "canonical", href: "/shop" }],
  }),
  validateSearch: zodValidator(searchSchema),
  component: ShopPage,
});

function ShopPage() {
  const { categories, products } = Route.useLoaderData() as {
    categories: Category[];
    products: Product[];
  };
  const { cat, sort, max } = Route.useSearch();
  const navigate = useNavigate({ from: "/shop" });

  const filtered = useMemo(() => {
    let list = [...products];

    if (cat) list = list.filter((p) => p.categorySlug === cat);
    if (max) list = list.filter((p) => (p.salePrice ?? p.basePrice) <= max);
    if (sort === "low")
      list.sort((a, b) => (a.salePrice ?? a.basePrice) - (b.salePrice ?? b.basePrice));
    if (sort === "high")
      list.sort((a, b) => (b.salePrice ?? b.basePrice) - (a.salePrice ?? a.basePrice));
    if (sort === "new") list.sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew));
    if (sort === "popular") list.sort((a, b) => b.reviewCount - a.reviewCount);
    return list;
  }, [products, cat, sort, max]);

  const selectedCategory = useMemo(() => {
    if (!cat) return null;
    return (categories as any[]).find((c) => c.slug === cat) || null;
  }, [cat, categories]);

  // Check if selected category has CMS content
  const hasCategoryCMS = useMemo(() => {
    if (!selectedCategory) return false;
    return (
      hasContent(selectedCategory.h1) ||
      hasContent(selectedCategory.heroSubtitle) ||
      hasContent(selectedCategory.aboutSection) ||
      hasContent(selectedCategory.whyChooseNamankart) ||
      hasContent(selectedCategory.buyingGuide) ||
      hasContent(selectedCategory.careInstructions) ||
      hasContent(selectedCategory.faqs) ||
      hasContent(selectedCategory.sections)
    );
  }, [selectedCategory]);

  const whyChooseList = useMemo(() => {
    if (!selectedCategory?.whyChooseNamankart) return [];
    return selectedCategory.whyChooseNamankart.filter((item: any) => hasContent(item));
  }, [selectedCategory]);

  const buyingGuideList = useMemo(() => {
    if (!selectedCategory?.buyingGuide) return [];
    return selectedCategory.buyingGuide.filter(
      (step: any) =>
        hasContent(step?.title || step?.step) || hasContent(step?.text || step?.description),
    );
  }, [selectedCategory]);

  const careInstructionsList = useMemo(() => {
    if (!selectedCategory?.careInstructions) return [];
    return selectedCategory.careInstructions.filter((care: any) => hasContent(care));
  }, [selectedCategory]);

  const categoryFaqsList = useMemo(() => {
    if (!selectedCategory?.faqs) return [];
    return selectedCategory.faqs.filter(
      (faq: any) => hasContent(faq?.question) && hasContent(faq?.answer),
    );
  }, [selectedCategory]);

  return (
    <div className="container-page py-8 space-y-6">
      {/* Top CMS Content: Selected Category CMS (if available) or Default Shop Landing Page CMS */}
      {hasCategoryCMS && selectedCategory ? (
        <div className="bg-gradient-to-r from-cream via-cream/80 to-amber-50/50 p-6 md:p-8 rounded-2xl border border-border space-y-4 shadow-xs">
          <div className="flex items-center gap-4">
            <span className="text-5xl">{selectedCategory.emoji || "📿"}</span>
            <div>
              <h1 className="font-display text-3xl md:text-4xl text-maroon font-bold">
                {selectedCategory.h1 || selectedCategory.name}
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground mt-1 max-w-4xl leading-relaxed">
                {selectedCategory.heroSubtitle || selectedCategory.description}
              </p>
            </div>
          </div>

          {/* Why Choose Pill Strip */}
          {Array.isArray(selectedCategory.whyChooseNamankart) &&
            selectedCategory.whyChooseNamankart.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {selectedCategory.whyChooseNamankart.map((item: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-background text-maroon font-medium text-xs rounded-full border border-saffron/30 shadow-2xs"
                  >
                    ✓ {item}
                  </span>
                ))}
              </div>
            )}
        </div>
      ) : (
        <>
          {/* Shop All Hero Intro */}
          <div className="bg-gradient-to-r from-cream via-cream/80 to-amber-50/50 p-6 md:p-8 rounded-2xl border border-border space-y-3 shadow-xs">
            <h1 className="font-display text-3xl font-bold text-maroon">
              {cat && selectedCategory
                ? selectedCategory.name
                : "Shop Authentic Puja Items, Malas & Idols Online"}
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed max-w-4xl">
              {cat && selectedCategory
                ? selectedCategory.description ||
                  `Browse our authentic collection of ${selectedCategory.name}.`
                : "NamanKart brings temple traditions to your doorstep. Every mala, idol, and puja item is sourced directly from craftsmen and temple towns across India, the same sacred places our sister site NamanDarshan sends pilgrims. Real materials, honest photos, and transparent pricing."}
            </p>
          </div>

          {/* Trust Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-amber-50/40 p-4 rounded-xl border border-border text-xs">
            <div className="flex items-center gap-2">
              <span className="text-xl">📿</span>
              <div>
                <h4 className="font-semibold text-foreground">100% Genuine Wood</h4>
                <p className="text-[10px] text-muted-foreground">Sourced from Vrindavan & Nepal</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🛕</span>
              <div>
                <h4 className="font-semibold text-foreground">Temple Sanctified</h4>
                <p className="text-[10px] text-muted-foreground">Purified with Vedic rituals</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🚚</span>
              <div>
                <h4 className="font-semibold text-foreground">Free Shipping &gt; ₹999</h4>
                <p className="text-[10px] text-muted-foreground">COD & 7-Day Returns</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">💎</span>
              <div>
                <h4 className="font-semibold text-foreground">Artisan Craftsmanship</h4>
                <p className="text-[10px] text-muted-foreground">Hand-turned by brass smiths</p>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="mt-6 grid md:grid-cols-[240px_1fr] gap-6">
        {/* Filters */}
        <aside className="space-y-6 bg-white p-5 rounded-xl border border-border shadow-xs">
          <div>
            <h3 className="font-semibold text-sm mb-3 text-gray-900 border-b border-border pb-2">
              Category
            </h3>
            <ul className="space-y-1.5 text-sm">
              <li key="all">
                <button
                  onClick={() =>
                    navigate({ search: (p: ShopSearch) => ({ ...p, cat: undefined }) })
                  }
                  className={
                    "hover:text-saffron transition " +
                    (!cat ? "text-saffron font-semibold" : "text-gray-700")
                  }
                >
                  All categories
                </button>
              </li>
              {categories.map((c, idx) => (
                <li key={c.slug || c.name || `cat-${idx}`}>
                  <button
                    onClick={() => navigate({ search: (p: ShopSearch) => ({ ...p, cat: c.slug }) })}
                    className={
                      "hover:text-saffron transition " +
                      (cat === c.slug ? "text-saffron font-semibold" : "text-gray-700")
                    }
                  >
                    {c.emoji} {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-3 text-gray-900 border-b border-border pb-2">
              Max Price
            </h3>
            <div className="flex flex-wrap gap-2 text-xs">
              {[500, 1000, 2000, 5000].map((m) => (
                <button
                  key={m}
                  onClick={() =>
                    navigate({
                      search: (p: ShopSearch) => ({ ...p, max: max === m ? undefined : m }),
                    })
                  }
                  className={
                    "px-3.5 py-1.5 rounded-full border transition font-medium " +
                    (max === m
                      ? "bg-saffron text-white border-saffron shadow-xs"
                      : "border-border bg-white text-gray-700 hover:border-saffron hover:text-saffron")
                  }
                >
                  Under ₹{m}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div>
          <div className="flex justify-end mb-4">
            <select
              value={sort}
              onChange={(e) =>
                navigate({
                  search: (p: ShopSearch) => ({ ...p, sort: e.target.value as ShopSearch["sort"] }),
                })
              }
              className="text-sm border border-border rounded-md px-3.5 py-2 bg-white text-gray-800 font-medium focus:ring-2 focus:ring-saffron outline-none shadow-xs"
            >
              <option value="popular">Most Popular</option>
              <option value="new">Newest</option>
              <option value="low">Price: Low to High</option>
              <option value="high">Price: High to Low</option>
            </select>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((p, idx) => (
              <ProductCard key={p.id || (p as any)._id || p.slug || idx} product={p} />
            ))}
          </div>
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-12">
              No products match these filters.
            </p>
          )}
        </div>
      </div>

      {/* Selected Category CMS Content Blocks (About, Buying Guide, Care, FAQs) */}
      {hasCategoryCMS && selectedCategory && (
        <div className="space-y-8 pt-6 border-t border-border">
          {/* About Category */}
          {hasContent(selectedCategory.aboutSection) && (
            <section className="bg-background p-6 md:p-8 rounded-2xl border border-border space-y-3 shadow-xs">
              <h2 className="font-display text-2xl text-maroon">About {selectedCategory.name}</h2>
              <div
                className="text-sm text-foreground/90 leading-relaxed space-y-3"
                dangerouslySetInnerHTML={{ __html: selectedCategory.aboutSection }}
              />
            </section>
          )}

          {/* Buying Guide */}
          {hasContent(buyingGuideList) && (
            <section className="bg-cream/40 p-6 md:p-8 rounded-2xl border border-border space-y-4">
              <h2 className="font-display text-2xl text-maroon">
                Buying Guide: How to Choose {selectedCategory.name}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {buyingGuideList.map((step: any, idx: number) => (
                  <div
                    key={idx}
                    className="bg-background p-4 rounded-xl border border-border shadow-2xs flex items-start gap-3"
                  >
                    <span className="w-7 h-7 rounded-full bg-saffron text-white font-bold flex items-center justify-center shrink-0 text-xs">
                      {idx + 1}
                    </span>
                    <div>
                      {hasContent(step.title || step.step) && (
                        <h4 className="font-bold text-sm text-foreground">
                          {step.title || step.step}
                        </h4>
                      )}
                      {hasContent(step.text || step.description) && (
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          {step.text || step.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Care Instructions */}
          {hasContent(careInstructionsList) && (
            <section className="bg-background p-6 md:p-8 rounded-2xl border border-border space-y-3">
              <h2 className="font-display text-xl text-maroon">Care Instructions</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs md:text-sm text-muted-foreground">
                {careInstructionsList.map((care: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-2 p-2 bg-cream/30 rounded-lg">
                    <span className="text-saffron font-bold">•</span> {care}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Category FAQs */}
          {hasContent(categoryFaqsList) && (
            <section className="bg-cream/30 p-6 md:p-8 rounded-2xl border border-border space-y-4">
              <h2 className="font-display text-2xl text-maroon">Category FAQs</h2>
              <div className="space-y-3">
                {categoryFaqsList.map((faq: { question: string; answer: string }, idx: number) => (
                  <details
                    key={idx}
                    className="group border border-border bg-background rounded-xl p-4 [&_summary::-webkit-details-marker]:hidden"
                  >
                    <summary className="flex items-center justify-between font-semibold text-sm text-foreground cursor-pointer">
                      <span>{faq.question}</span>
                      <span className="ml-2 transition-transform group-open:rotate-180 text-saffron">
                        ↓
                      </span>
                    </summary>
                    <p className="mt-3 text-xs md:text-sm text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
