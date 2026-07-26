import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ProductCard } from "@/components/ProductCard";
import { api } from "@/lib/api";
import type { Category, Product } from "@/lib/types";

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
  const { cat, items } = Route.useLoaderData() as { cat: Category; items: Product[] };
  return (
    <div className="container-page py-8">
      <div className="text-xs text-muted-foreground mb-2">
        <Link to="/" className="hover:text-saffron">
          Home
        </Link>{" "}
        /{" "}
        <Link to="/shop" className="hover:text-saffron">
          Shop
        </Link>{" "}
        / {cat.name}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-4xl">{cat.emoji}</span>
        <div>
          <h1 className="font-display text-3xl text-maroon">{cat.name}</h1>
          <p className="text-sm text-muted-foreground">{cat.description}</p>
        </div>
      </div>
      <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((p, idx) => (
          <ProductCard key={p.id || (p as any)._id || p.slug || idx} product={p} />
        ))}
      </div>
      {items.length === 0 && (
        <p className="text-center text-muted-foreground py-12">No products in this category yet.</p>
      )}
    </div>
  );
}
