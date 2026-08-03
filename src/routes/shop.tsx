import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { ProductCard } from "@/components/ProductCard";
import { api } from "@/lib/api";
import type { Category, Product } from "@/lib/types";
import { useMemo } from "react";

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

  return (
    <div className="container-page py-8">
      <h1 className="font-display text-3xl font-bold text-gray-900">Shop All Products</h1>
      <p className="text-sm text-gray-500">{filtered.length} products</p>

      <div className="mt-6 grid md:grid-cols-[240px_1fr] gap-6">
        {/* Filters */}
        <aside className="space-y-6 bg-white p-5 rounded-xl border border-border shadow-xs">
          <div>
            <h3 className="font-semibold text-sm mb-3 text-gray-900 border-b border-border pb-2">
              Category
            </h3>
            <ul className="space-y-1.5 text-sm">
              <li>
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
              {categories.map((c) => (
                <li key={c.slug}>
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
    </div>
  );
}
