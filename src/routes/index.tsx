import { createFileRoute, Link } from "@tanstack/react-router";
import { ProductCard } from "@/components/ProductCard";
import { api } from "@/lib/api";
import type { Category, Product } from "@/lib/types";
import heroImg from "@/assets/hero-devotional.webp";
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
      { rel: "preload", href: heroImg, as: "image", type: "image/webp" },
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
      {/* HERO */}
      <section className="relative overflow-hidden max-h-[500px] flex items-center">
        <div className="absolute inset-0">
          <img
            src={heroImg}
            alt="Authentic Devotional Products"
            className="w-full h-full object-cover object-center"
            width={1600}
            height={900}
            fetchPriority="high"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-maroon/90 via-maroon/75 to-maroon/35" />
        </div>
        <div className="container-page relative py-10 sm:py-14 md:py-16 text-maroon-foreground">
          <p className="text-gold tracking-[0.3em] text-xs md:text-sm mb-3">॥ श्री ॥</p>
          <h1 className="font-display text-4xl md:text-6xl max-w-2xl leading-tight">
            Authentic devotion,
            <br />
            delivered to your door.
          </h1>
          <p className="mt-4 max-w-xl text-sm md:text-base opacity-90">
            Temple-sourced malas, idols, puja essentials, copper-brass items and prasad — handpicked
            by devotees, for devotees.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/shop"
              className="bg-saffron text-saffron-foreground px-6 py-3 rounded-full font-medium hover:opacity-90"
            >
              Shop All Products
            </Link>
            <Link
              to="/category/$slug"
              params={{ slug: "tulsi-malas" }}
              className="bg-card/15 border border-gold/40 text-maroon-foreground px-6 py-3 rounded-full font-medium hover:bg-card/25"
            >
              Explore Tulsi Malas
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-xs md:text-sm opacity-90">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-4 w-4 text-gold" /> Temple sourced
            </span>
            <span className="flex items-center gap-1">
              <Truck className="h-4 w-4 text-gold" /> Free shipping ₹999+
            </span>
            <span className="flex items-center gap-1">
              <RotateCcw className="h-4 w-4 text-gold" /> 7-day returns
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="h-4 w-4 text-gold" /> COD available
            </span>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container-page py-14">
        <div className="om-divider mb-4">
          <span>॥ ॐ ॥</span>
        </div>
        <h2 className="text-center font-display text-3xl text-maroon">Shop by Category</h2>
        <p className="text-center text-sm text-muted-foreground mt-1">
          14 curated categories of devotional essentials
        </p>
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-4">
          {categories.map((c, idx) => (
            <Link
              key={c.slug || (c as any)._id || c.name || idx}
              to="/category/$slug"
              params={{ slug: c.slug }}
              className="group rounded-xl bg-card border border-border p-4 text-center hover:border-saffron hover:shadow-md transition"
            >
              <div className="text-3xl group-hover:scale-110 transition">{c.emoji}</div>
              <div className="mt-2 text-xs font-medium leading-tight">{c.name}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="container-page py-10">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl md:text-3xl text-maroon">Featured Products</h2>
            <p className="text-sm text-muted-foreground">Most-loved picks this month</p>
          </div>
          <Link to="/shop" className="text-saffron text-sm font-medium hover:underline">
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
      <section className="bg-cream/60 py-14">
        <div className="container-page">
          <h2 className="font-display text-2xl md:text-3xl text-maroon text-center">
            Best Sellers
          </h2>
          <div className="om-divider my-4">
            <span className="text-xs">★</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {bestSellers.map((p, idx) => (
              <ProductCard key={p.id || (p as any)._id || p.slug || idx} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section className="container-page py-14">
        <h2 className="font-display text-2xl md:text-3xl text-maroon">New Arrivals</h2>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {newArrivals.map((p, idx) => (
            <ProductCard key={p.id || (p as any)._id || p.slug || idx} product={p} />
          ))}
        </div>
      </section>

      {/* CROSS-PROMO */}
      <section className="container-page py-10">
        <div className="rounded-2xl bg-gradient-to-r from-maroon to-saffron text-maroon-foreground p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-gold text-xs tracking-widest">SISTER COMPANY</p>
            <h3 className="font-display text-2xl md:text-3xl mt-1">
              Book a Puja, Darshan or Yatra
            </h3>
            <p className="text-sm opacity-90 mt-1">
              Visit NamanDarshan.com for temple bookings, prasadam delivery & astrology services.
            </p>
          </div>
          <a
            href="https://namandarshan.com"
            target="_blank"
            rel="noreferrer"
            className="bg-gold text-gold-foreground px-6 py-3 rounded-full font-medium hover:opacity-90"
          >
            Visit NamanDarshan →
          </a>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="container-page py-14">
        <h2 className="font-display text-2xl md:text-3xl text-maroon text-center">
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
            <div key={t.n} className="rounded-xl border border-border bg-card p-6">
              <div className="text-gold text-lg">★★★★★</div>
              <p className="mt-3 text-sm italic">"{t.q}"</p>
              <p className="mt-3 text-xs font-medium text-maroon">— {t.n}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
