import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ProductCard } from "@/components/ProductCard";
import { SectionRenderer } from "@/components/SectionRenderer";
import { api } from "@/lib/api";
import type { Category, Product } from "@/lib/types";
import { hasContent } from "@/lib/cmsUtils";

export const Route = createFileRoute("/category/$slug")({
  loader: async ({ params }) => {
    const cat = await api.getCategory(params.slug);
    if (!cat) throw notFound();
    const items = await api.productsByCategory(params.slug);
    return { cat, items };
  },

  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.cat.name} — NamanKart` },
          { name: "description", content: loaderData.cat.description },
          { property: "og:title", content: `${loaderData.cat.name} — NamanKart` },
          { property: "og:description", content: loaderData.cat.description },
          { property: "og:url", content: `/category/${loaderData.cat.slug}` },
        ]
      : [],
    links: loaderData ? [{ rel: "canonical", href: `/category/${loaderData.cat.slug}` }] : [],
  }),
  errorComponent: ({ error }) => <div className="container-page py-12">{error.message}</div>,
  notFoundComponent: () => (
    <div className="container-page py-16 text-center">
      <h1 className="font-display text-3xl">Category not found</h1>
      <Link to="/shop" className="text-saffron mt-4 inline-block">
        ← Back to shop
      </Link>
    </div>
  ),
  component: CategoryPage,
});

function CategoryPage() {
  const { cat, items } = Route.useLoaderData() as { cat: any; items: Product[] };

  const whyChooseList = (cat.whyChooseNamankart || []).filter((item: any) => hasContent(item));
  const buyingGuideList = (cat.buyingGuide || []).filter((step: any) => hasContent(step?.title || step?.step) || hasContent(step?.text || step?.description));
  const careInstructionsList = (cat.careInstructions || []).filter((care: any) => hasContent(care));
  const categoryFaqsList = (cat.faqs || []).filter((faq: any) => hasContent(faq?.question) && hasContent(faq?.answer));

  return (
    <div className="container-page py-8 space-y-10">
      <div className="text-xs text-muted-foreground">
        <Link to="/" className="hover:text-saffron">
          Home
        </Link>{" "}
        /{" "}
        <Link to="/shop" className="hover:text-saffron">
          Shop
        </Link>{" "}
        / {cat.name}
      </div>

      {/* Category Hero Header */}
      <div className="bg-gradient-to-r from-cream via-cream/80 to-amber-50/50 p-6 md:p-10 rounded-2xl border border-border space-y-4 shadow-xs">
        <div className="flex items-center gap-4">
          <span className="text-5xl">{cat.emoji || "📿"}</span>
          <div>
            <h1 className="font-display text-3xl md:text-4xl text-maroon font-bold">
              {hasContent(cat.h1) ? cat.h1 : cat.name}
            </h1>
            {hasContent(cat.heroSubtitle || cat.description) && (
              <p className="text-sm md:text-base text-muted-foreground mt-1 max-w-3xl">
                {cat.heroSubtitle || cat.description}
              </p>
            )}
          </div>
        </div>

        {/* Why Choose Pill Strip */}
        {hasContent(whyChooseList) && (
          <div className="flex flex-wrap gap-2 pt-2">
            {whyChooseList.map((item: string, idx: number) => (
              <span key={idx} className="px-3 py-1 bg-background text-maroon font-medium text-xs rounded-full border border-saffron/30 shadow-2xs">
                ✓ {item}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Product Grid */}
      <div>
        <h2 className="font-display text-xl text-maroon mb-4">
          Explore {cat.name} ({items.length})
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((p, idx) => (
            <ProductCard key={p.id || (p as any)._id || p.slug || idx} product={p} />
          ))}
        </div>
        {items.length === 0 && (
          <p className="text-center text-muted-foreground py-12">No products in this category yet.</p>
        )}
      </div>

      {/* About Category Section (200-250w) */}
      {hasContent(cat.aboutSection) && (
        <section className="bg-background p-6 md:p-8 rounded-2xl border border-border space-y-3 shadow-xs">
          <h2 className="font-display text-2xl text-maroon">About {cat.name}</h2>
          <div className="text-sm text-foreground/90 leading-relaxed space-y-3" dangerouslySetInnerHTML={{ __html: cat.aboutSection }} />
        </section>
      )}

      {/* Buying Guide */}
      {hasContent(buyingGuideList) && (
        <section className="bg-cream/40 p-6 md:p-8 rounded-2xl border border-border space-y-4">
          <h2 className="font-display text-2xl text-maroon">Buying Guide: How to Choose {cat.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {buyingGuideList.map((step: any, idx: number) => (
              <div key={idx} className="bg-background p-4 rounded-xl border border-border shadow-2xs flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-saffron text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  {idx + 1}
                </span>
                <div>
                  {hasContent(step.title || step.step) && <h4 className="font-bold text-sm text-foreground">{step.title || step.step}</h4>}
                  {hasContent(step.text || step.description) && (
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{step.text || step.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Category Care Instructions */}
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
              <details key={idx} className="group border border-border bg-background rounded-xl p-4 [&_summary::-webkit-details-marker]:hidden">
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

      {/* Dynamic Section Blocks */}
      {hasContent(cat.sections) && <SectionRenderer sections={cat.sections} />}
    </div>
  );
}
