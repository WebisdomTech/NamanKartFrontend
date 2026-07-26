import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { ProductCard } from "@/components/ProductCard";
import { api } from "@/lib/api";
import type { Product } from "@/lib/types";

export const Route = createFileRoute("/search")({
  loaderDeps: ({ search: { q } }) => ({ q }),
  loader: async ({ deps: { q } }) => {
    const results = await api.search(q);
    return { results };
  },
  head: () => ({
    meta: [{ title: "Search — NamanKart" }, { name: "robots", content: "noindex" }],
  }),
  validateSearch: zodValidator(z.object({ q: fallback(z.string(), "").default("") })),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const { results } = Route.useLoaderData() as { results: Product[] };

  return (
    <div className="container-page py-8">
      <h1 className="font-display text-2xl text-maroon">
        Search results for "<span className="text-saffron">{q}</span>"
      </h1>
      <p className="text-sm text-muted-foreground">{results.length} products found</p>
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {results.map((p, idx) => (
          <ProductCard key={p.id || (p as any)._id || p.slug || idx} product={p} />
        ))}
      </div>
      {results.length === 0 && q && (
        <p className="text-center text-muted-foreground py-12">
          Try a different keyword like "mala", "diya", or "prasad".
        </p>
      )}
    </div>
  );
}
