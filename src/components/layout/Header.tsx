import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, Menu, Search, ShoppingCart, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "@/lib/cart-store";
import { useAuth } from "@/lib/auth-store";
import { api } from "@/lib/api";
import type { Category } from "@/lib/types";
import { TopUtilityBar } from "./TopUtilityBar";
import { BrandLogo } from "./BrandLogo";

export function Header() {
  const count = useCart((s) => s.items.reduce((n, x) => n + x.qty, 0));
  const wishCount = useCart((s) => s.wishlist.length);
  const user = useAuth((s) => s.user);
  const hydrateAuth = useAuth((s) => s.hydrate);
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

  useEffect(() => {
    hydrateAuth();
  }, [hydrateAuth]);

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    navigate({ to: "/search", search: { q } });
  }

  const activeLinkClass = "text-white underline underline-offset-4 decoration-2 decoration-white font-bold";

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-border shadow-sm">
      <TopUtilityBar />
      <div className="container-page flex items-center gap-3 py-2">
        <button
          className="md:hidden p-1.5 -ml-1.5"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          <Menu className="h-5 w-5 text-gray-700" />
        </button>

        <Link to="/" className="flex items-center shrink-0">
          <BrandLogo compact />
        </Link>

        <form onSubmit={onSearch} className="hidden md:flex flex-1 mx-6 lg:mx-8 max-w-4xl">
          <div className="flex w-full rounded-full border-2 border-border bg-white overflow-hidden shadow-xs focus-within:shadow-md focus-within:ring-2 focus-within:ring-saffron/40 focus-within:border-saffron transition-all">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search for Tulsi Mala, Rudraksha, Puja Items..."
              className="flex-1 bg-transparent px-4 py-2.5 text-sm outline-none text-gray-900 placeholder:text-gray-500"
            />
            <button className="bg-saffron text-white px-6 py-2.5 flex items-center gap-2 text-sm font-semibold hover:bg-saffron-hover transition shrink-0">
              <Search className="h-4.5 w-4.5" /> Search
            </button>
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 sm:gap-2.5 shrink-0">
          <Link
            to={user ? "/account" : "/login"}
            className="hidden sm:inline-flex items-center gap-1.5 p-1.5 hover:text-saffron text-sm font-medium text-gray-700 transition"
          >
            <User className="h-5 w-5" />{" "}
            <span className="hidden lg:inline">{user ? user.fullName.split(" ")[0] : "Login"}</span>
          </Link>
          {/* Wishlist and cart are account features — only surfaced once
              signed in, so signed-out visitors aren't shown entry points
              that would only bounce them to the login page. */}
          {user && (
            <>
              <Link
                to="/wishlist"
                aria-label={`Wishlist${wishCount > 0 ? ` (${wishCount} items)` : ""}`}
                className="relative p-1.5 hover:text-saffron text-gray-700 transition"
              >
                <Heart className="h-5 w-5" />
                {wishCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-saffron text-saffron-foreground text-[10px] font-bold rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                    {wishCount}
                  </span>
                )}
              </Link>
              <Link
                to="/cart"
                aria-label={`Cart${count > 0 ? ` (${count} items)` : ""}`}
                className="relative p-1.5 hover:text-saffron text-gray-700 transition"
              >
                <ShoppingCart className="h-5 w-5" />
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 bg-saffron text-saffron-foreground text-[10px] font-bold rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                    {count}
                  </span>
                )}
              </Link>
            </>
          )}
        </div>
      </div>

      <form onSubmit={onSearch} className="md:hidden container-page pb-2.5">
        <div className="flex w-full rounded-full border border-border bg-white overflow-hidden shadow-xs focus-within:ring-2 focus-within:ring-saffron/40">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products…"
            className="flex-1 bg-transparent px-4 py-2.5 text-sm font-medium placeholder:text-sm placeholder:text-gray-500 outline-none text-gray-900"
          />
          <button className="bg-saffron text-saffron-foreground px-4 py-2.5 flex items-center justify-center" aria-label="Search">
            <Search className="h-4.5 w-4.5" />
          </button>
        </div>
      </form>

      <nav className="hidden md:block bg-saffron text-saffron-foreground shadow-xs">
        <div className="container-page flex items-center gap-3">
          {/* Phantom BrandLogo spacer matching top row Logo width */}
          <div
            className="flex items-center shrink-0 pointer-events-none opacity-0 select-none"
            aria-hidden="true"
          >
            <BrandLogo compact />
          </div>

          {/* Navigation container matching exact search bar left offset, width, and container alignment */}
          <div className="flex-1 mx-6 lg:mx-8 max-w-4xl flex flex-wrap items-center gap-x-7 gap-y-1.5 py-2.5 text-[15px] font-semibold">
            <Link
              to="/"
              activeOptions={{ exact: true }}
              activeProps={{ className: activeLinkClass }}
              className="hover:text-white/80 transition text-white/95 font-semibold"
            >
              Home
            </Link>
            <Link
              to="/shop"
              activeProps={{ className: activeLinkClass }}
              className="hover:text-white/80 transition text-white/95 font-semibold"
            >
              Shop All
            </Link>
            <Link
              to="/category/$slug"
              params={{ slug: "prasad" }}
              activeProps={{ className: activeLinkClass }}
              className="hover:text-white/80 transition text-white/95 font-semibold"
            >
              Prasad
            </Link>
            <Link
              to="/category/$slug"
              params={{ slug: "copper-brass" }}
              activeProps={{ className: activeLinkClass }}
              className="hover:text-white/80 transition text-white/95 font-semibold"
            >
              Copper & Brass
            </Link>
            <Link
              to="/category/$slug"
              params={{ slug: "puja-items" }}
              activeProps={{ className: activeLinkClass }}
              className="hover:text-white/80 transition text-white/95 font-semibold"
            >
              Puja Items
            </Link>
            <Link
              to="/category/$slug"
              params={{ slug: "lockets" }}
              activeProps={{ className: activeLinkClass }}
              className="hover:text-white/80 transition text-white/95 font-semibold"
            >
              Lockets & Pendants
            </Link>
          </div>
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
            <Link to={user ? "/account" : "/login"} onClick={() => setOpen(false)}>
              {user ? `My Account (${user.fullName.split(" ")[0]})` : "Login / Sign Up"}
            </Link>
            {user && (
              <>
                <Link to="/wishlist" onClick={() => setOpen(false)}>
                  Wishlist{wishCount > 0 ? ` (${wishCount})` : ""}
                </Link>
                <Link to="/cart" onClick={() => setOpen(false)}>
                  Cart{count > 0 ? ` (${count})` : ""}
                </Link>
              </>
            )}
            <Link to="/track-order" onClick={() => setOpen(false)}>
              Track Order
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
