import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, Menu, Search, ShoppingBag, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "@/lib/cart-store";
import { api } from "@/lib/api";
import type { Category } from "@/lib/types";
import { CrossLinkStrip } from "./CrossLinkStrip";
import { BrandLogo } from "./BrandLogo";

export function Header() {
  const count = useCart((s) => s.items.reduce((n, x) => n + x.qty, 0));
  const wishCount = useCart((s) => s.wishlist.length);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .listCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    navigate({ to: "/search", search: { q } });
  }

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
      <CrossLinkStrip />
      <div className="container-page flex items-center gap-3 py-3">
        <button
          className="md:hidden p-2 -ml-2"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link to="/" className="flex items-center">
          <BrandLogo compact className="" />
        </Link>

        <form onSubmit={onSearch} className="hidden md:flex flex-1 mx-6 max-w-xl">
          <div className="flex w-full rounded-full border border-border bg-card overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-saffron">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search malas, idols, puja items…"
              className="flex-1 bg-transparent px-4 py-2 text-sm outline-none"
            />
            <button className="bg-saffron text-saffron-foreground px-4 flex items-center gap-1 text-sm font-medium hover:opacity-90">
              <Search className="h-4 w-4" /> Search
            </button>
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 sm:gap-3">
          <Link
            to="/account"
            className="hidden sm:inline-flex items-center gap-1 p-2 hover:text-saffron text-sm"
          >
            <User className="h-5 w-5" /> <span className="hidden lg:inline">Account</span>
          </Link>
          <Link to="/wishlist" className="relative p-2 hover:text-saffron">
            <Heart className="h-5 w-5" />
            {wishCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-saffron text-saffron-foreground text-[10px] rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                {wishCount}
              </span>
            )}
          </Link>
          <Link to="/cart" className="relative p-2 hover:text-saffron">
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-saffron text-saffron-foreground text-[10px] rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      <form onSubmit={onSearch} className="md:hidden container-page pb-3">
        <div className="flex w-full rounded-full border border-border bg-card overflow-hidden">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products…"
            className="flex-1 bg-transparent px-4 py-2 text-sm outline-none"
          />
          <button className="bg-saffron text-saffron-foreground px-3" aria-label="Search">
            <Search className="h-4 w-4" />
          </button>
        </div>
      </form>

      <nav className="hidden md:block border-t border-border bg-cream/50">
        <div className="container-page flex flex-wrap gap-x-5 gap-y-1 py-2 text-sm">
          <Link to="/" className="hover:text-saffron font-medium">
            Home
          </Link>
          <Link to="/shop" className="hover:text-saffron font-medium">
            Shop All
          </Link>
          {categories
            .filter((c) => c.isFeatured)
            .map((c) => (
              <Link
                key={c.slug}
                to="/category/$slug"
                params={{ slug: c.slug }}
                className="hover:text-saffron"
              >
                {c.name}
              </Link>
            ))}
          <Link to="/track-order" className="hover:text-saffron ml-auto text-maroon font-medium">
            Track Order
          </Link>
        </div>
      </nav>

      {open && (
        <div className="md:hidden border-t border-border bg-card">
          <div className="container-page py-3 flex flex-col gap-2 text-sm">
            <Link to="/" onClick={() => setOpen(false)}>
              Home
            </Link>
            <Link to="/shop" onClick={() => setOpen(false)}>
              Shop All
            </Link>
            {categories.map((c) => (
              <Link
                key={c.slug}
                to="/category/$slug"
                params={{ slug: c.slug }}
                onClick={() => setOpen(false)}
              >
                {c.emoji} {c.name}
              </Link>
            ))}
            <Link to="/account" onClick={() => setOpen(false)}>
              My Account
            </Link>
            <Link to="/track-order" onClick={() => setOpen(false)}>
              Track Order
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
