import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { Category } from "@/lib/types";
import { BrandLogo } from "./BrandLogo";

export function Footer() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    api
      .listCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  return (
    <footer className="mt-20 bg-maroon text-maroon-foreground">
      <div className="container-page py-12 grid gap-10 md:grid-cols-4">
        <div>
          <BrandLogo className="mb-3" />
          <p className="mt-3 text-sm opacity-80">
            Authentic, temple-sourced devotional products — delivered with love across India.
          </p>
          <p className="mt-4 text-xs opacity-70">
            Sister site of{" "}
            <a
              href="https://namandarshan.com"
              className="underline text-gold"
              target="_blank"
              rel="noreferrer"
            >
              NamanDarshan.com
            </a>{" "}
            for puja, darshan & yatra bookings.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-gold">Shop</h4>
          <ul className="space-y-1.5 text-sm opacity-90">
            <li>
              <Link to="/shop" className="hover:text-gold">
                All Products
              </Link>
            </li>
            {categories.slice(0, 6).map((c) => (
              <li key={c.slug}>
                <Link to="/category/$slug" params={{ slug: c.slug }} className="hover:text-gold">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-gold">Help</h4>
          <ul className="space-y-1.5 text-sm opacity-90">
            <li>
              <Link to="/track-order" className="hover:text-gold">
                Track Order
              </Link>
            </li>
            <li>
              <Link to="/account" className="hover:text-gold">
                My Account
              </Link>
            </li>
            <li>
              <a className="hover:text-gold" href="mailto:care@namankart.com">
                care@namankart.com
              </a>
            </li>
            <li>
              <a className="hover:text-gold" href="tel:+919000000000">
                +91 90000 00000
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-gold">Trust & Safety</h4>
          <ul className="space-y-1.5 text-sm opacity-90">
            <li>✓ Temple-sourced authenticity</li>
            <li>✓ Free shipping above ₹999</li>
            <li>✓ 7-day easy returns</li>
            <li>✓ Secure payments • COD available</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page py-4 text-xs opacity-70 flex flex-wrap gap-3 justify-between">
          <span>© {new Date().getFullYear()} NamanKart. All rights reserved.</span>
          <span>Made with devotion in Bharat 🇮🇳</span>
        </div>
      </div>
    </footer>
  );
}
