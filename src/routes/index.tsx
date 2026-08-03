import { createFileRoute, Link } from "@tanstack/react-router";
import { ProductCard } from "@/components/ProductCard";
import { HeroCarousel } from "@/components/HeroCarousel";
import { api } from "@/lib/api";
import type { Category, Product } from "@/lib/types";
import bannerPujaItems from "@/assets/banners/home-banner-puja-items.jpeg";
import { ShieldCheck, Truck, RotateCcw, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [categories, products] = await Promise.all([api.listCategories(), api.listProducts()]);
    return { categories, products };
  },
  head: () => ({
    meta: [
      { title: "NamanKart — Authentic Devotional Products & Puja Essentials" },
      {
        name: "description",
        content:
          "Shop temple-sourced malas, idols, puja items, copper-brassware and prasad. Free shipping above ₹999.",
      },
      { property: "og:title", content: "NamanKart — Authentic Devotional Products" },
      {
        property: "og:description",
        content: "Temple-sourced malas, idols, puja items and prasad — delivered with devotion.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [
      { rel: "canonical", href: "/" },
      { rel: "preload", href: bannerPujaItems, as: "image", type: "image/jpeg" },
    ],
  }),
  component: Index,
});

function Index() {
  const { categories, products } = Route.useLoaderData() as {
    categories: Category[];
    products: Product[];
  };
  const featured = products.filter((p) => p.isFeatured).slice(0, 8);
  const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 4);
  const newArrivals = products.filter((p) => p.isNew || p.isNewProduct).slice(0, 4);

  return (
    <div>
      {/* HERO CAROUSEL */}
      <HeroCarousel />

      {/* CATEGORIES */}
      <section className="container-page py-14">
        <div className="om-divider mb-4">{/* <span>॥ ॐ ॥</span> */}</div>
        <h2 className="text-center font-display text-3xl font-bold text-gray-900">
          Shop by Category
        </h2>
        <p className="text-center text-sm text-gray-500 mt-1">
          14 curated categories of devotional essentials
        </p>
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-4">
          {categories.map((c, idx) => (
            <Link
              key={c.slug || (c as any)._id || c.name || idx}
              to="/category/$slug"
              params={{ slug: c.slug }}
              className="group rounded-xl bg-white border border-border p-4 text-center hover:border-saffron hover:shadow-md transition duration-200"
            >
              <div className="text-3xl group-hover:scale-110 transition duration-200">
                {c.emoji}
              </div>
              <div className="mt-2 text-xs font-semibold text-gray-800 leading-tight group-hover:text-saffron transition">
                {c.name}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="container-page py-10">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-gray-900">
              Featured Products
            </h2>
            <p className="text-sm text-gray-500">Most-loved picks this month</p>
          </div>
          <Link
            to="/shop"
            className="text-saffron text-sm font-semibold hover:text-saffron-hover hover:underline transition"
          >
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {featured.map((p, idx) => (
            <ProductCard key={p.id || (p as any)._id || p.slug || idx} product={p} />
          ))}
        </div>
      </section>

      {/* BEST SELLERS */}
      <section className="bg-[#FFF8F0] border-y border-border/60 py-14">
        <div className="container-page">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-gray-900 text-center">
            Best Sellers
          </h2>
          <div className="om-divider my-4">{/* <span className="text-xs">★</span> */}</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {bestSellers.map((p, idx) => (
              <ProductCard key={p.id || (p as any)._id || p.slug || idx} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section className="container-page py-14">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-gray-900">New Arrivals</h2>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {newArrivals.map((p, idx) => (
            <ProductCard key={p.id || (p as any)._id || p.slug || idx} product={p} />
          ))}
        </div>
      </section>

      {/* CROSS-PROMO */}
      <section className="container-page py-10">
        <div className="rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div>
            <p className="text-amber-100 text-xs font-bold tracking-widest uppercase">
              Sister Company
            </p>
            <h3 className="font-display text-2xl md:text-3xl font-bold mt-1">
              Book a Puja, Darshan or Yatra
            </h3>
            <p className="text-sm text-white/90 mt-1 leading-relaxed">
              Visit NamanDarshan.com for temple bookings, prasadam delivery & astrology services.
            </p>
          </div>
          <a
            href="https://namandarshan.com"
            target="_blank"
            rel="noreferrer"
            className="bg-white text-saffron px-7 py-3.5 rounded-full font-bold shadow-xs hover:bg-orange-50 hover:text-saffron-hover transition duration-200"
          >
            Visit NamanDarshan →
          </a>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="container-page py-14">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-gray-900 text-center">
          What Devotees Say
        </h2>
        <div className="om-divider my-4">
          <span>॥</span>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              n: "Anita S.",
              q: "The tulsi mala feels truly sacred — beautifully made and reached me in 3 days. Hari Bol!",
            },
            {
              n: "Ramesh P.",
              q: "Ordered the brass Ganesh idol for griha pravesh. Quality and packaging were top-notch.",
            },
            {
              n: "Lakshmi R.",
              q: "Their prasad box was as fresh as if I had picked it up from the temple myself.",
            },
          ].map((t) => (
            <div key={t.n} className="rounded-xl border border-border bg-white p-6 shadow-xs">
              <div className="text-amber-500 text-lg">★★★★★</div>
              <p className="mt-3 text-sm text-gray-700 italic leading-relaxed">"{t.q}"</p>
              <p className="mt-3 text-xs font-semibold text-gray-900">— {t.n}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
