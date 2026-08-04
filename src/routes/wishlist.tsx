import { createFileRoute, Link } from "@tanstack/react-router";
import { ProductCard } from "@/components/ProductCard";
import { useCart } from "@/lib/cart-store";
import { useRequireAuth } from "@/lib/use-require-auth";
import { api } from "@/lib/api";
import type { Product } from "@/lib/types";

export const Route = createFileRoute("/wishlist")({
  loader: async () => {
    const products = await api.listProducts();
    return { products };
  },
  head: () => ({
    meta: [{ title: "Wishlist — NamanKart" }, { name: "robots", content: "noindex" }],
  }),
  component: Wishlist,
});

function Wishlist() {
  const { products } = Route.useLoaderData() as { products: Product[] };
  const ids = useCart((s) => s.wishlist);
  const items = products.filter((p) => ids.includes(p.id) || ids.includes((p as any)._id));
  const { ready } = useRequireAuth("/wishlist");

  if (!ready) {
    return <div className="container-page py-20 text-center text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="container-page py-8">
      <h1 className="font-display text-3xl text-maroon">Your Wishlist</h1>
      {items.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl">💝</div>
          <p className="text-muted-foreground mt-4">No items saved yet.</p>
          <Link to="/shop" className="text-saffron mt-2 inline-block">
            Browse products →
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((p, idx) => (
            <ProductCard key={p.id || (p as any)._id || p.slug || idx} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
