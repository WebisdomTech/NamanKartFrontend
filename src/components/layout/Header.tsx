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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-border shadow-xs">
      <CrossLinkStrip />
      <div className="container-page flex items-center gap-3 py-3">
        <button
          className="md:hidden p-2 -ml-2"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          <Menu className="h-5 w-5 text-gray-700" />
        </button>

        <Link to="/" className="flex items-center">
          <BrandLogo compact className="" />
        </Link>

        <form onSubmit={onSearch} className="hidden md:flex flex-1 mx-9 max-w-3xl">
          <div className="flex w-full rounded-full border-2 border-border bg-white overflow-hidden shadow-md focus-within:ring-4 focus-within:ring-saffron/30 transition-all">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search for Tulsi Mala, Rudraksha, Puja Items..."
              className="flex-1 bg-transparent px-3 py-3 text-sm outline-none text-gray-900"
            />
            <button className="bg-saffron text-white px-8 py-4 flex items-center gap-2 text-base font-semibold hover:bg-saffron-hover transition">
              <Search className="h-5 w-5" /> Search
            </button>
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 sm:gap-3">
          <Link
            to="/account"
            className="hidden sm:inline-flex items-center gap-1.5 p-2 hover:text-saffron text-sm font-medium text-gray-700"
          >
            <User className="h-5 w-5" /> <span className="hidden lg:inline">Account</span>
          </Link>
          <Link to="/wishlist" className="relative p-2 hover:text-saffron text-gray-700">
            <Heart className="h-5 w-5" />
            {wishCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-saffron text-saffron-foreground text-[10px] font-bold rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                {wishCount}
              </span>
            )}
          </Link>
          <Link to="/cart" className="relative p-2 hover:text-saffron text-gray-700">
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-saffron text-saffron-foreground text-[10px] font-bold rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      <form onSubmit={onSearch} className="md:hidden container-page pb-3">
        <div className="flex w-full rounded-full border border-border bg-white overflow-hidden shadow-xs">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products…"
            className="flex-1 bg-transparent px-5 py-3 text-base font-medium placeholder:text-base placeholder:text-gray-500 outline-none text-gray-900"
          />
          <button className="bg-saffron text-saffron-foreground px-4" aria-label="Search">
            <Search className="h-5 w-5" />
          </button>
        </div>
      </form>

      <nav className="hidden md:block bg-saffron text-saffron-foreground shadow-xs">
        <div className="container-page flex flex-wrap items-center gap-x-8 gap-y-2 py-4 text-base font-semibold">
          <Link to="/" className="hover:text-white/80 transition text-white font-semibold">
            Home
          </Link>
          <Link to="/shop" className="hover:text-white/80 transition text-white font-semibold">
            Shop All
          </Link>
          {categories
            .filter((c) => c.isFeatured)
            .map((c) => (
              <Link
                key={c.slug}
                to="/category/$slug"
                params={{ slug: c.slug }}
                className="hover:text-white/80 transition text-white/95"
              >
                {c.name}
              </Link>
            ))}
          <Link to="/track-order" className="hover:text-white/80 ml-auto text-white font-semibold transition">
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
