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
    <footer className="mt-20 bg-white border-t border-border text-gray-800">
      <div className="container-page py-14 grid gap-10 md:grid-cols-4">
        <div>
          <BrandLogo className="mb-3" />
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
            Authentic, temple-sourced devotional products — delivered with love across India.
          </p>
          <p className="mt-4 text-xs text-gray-500">
            Sister site of{" "}
            <a
              href="https://namandarshan.com"
              className="underline text-saffron font-semibold hover:text-saffron-hover transition"
              target="_blank"
              rel="noreferrer"
            >
              NamanDarshan.com
            </a>{" "}
            for puja, darshan & yatra bookings.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-saffron">Shop</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>
              <Link to="/shop" className="hover:text-saffron transition">
                All Products
              </Link>
            </li>
            {categories.slice(0, 6).map((c) => (
              <li key={c.slug}>
                <Link
                  to="/category/$slug"
                  params={{ slug: c.slug }}
                  className="hover:text-saffron transition"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-saffron">Help</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>
              <Link to="/track-order" className="hover:text-saffron transition">
                Track Order
              </Link>
            </li>
            <li>
              <Link to="/account" className="hover:text-saffron transition">
                My Account
              </Link>
            </li>
            <li>
              <a className="hover:text-saffron transition" href="mailto:care@namankart.com">
                care@namankart.com
              </a>
            </li>
            <li>
              <a className="hover:text-saffron transition" href="tel:+91 87969 73199">
                +91 87969 73199
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-saffron">Trust & Safety</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>✓ Temple-sourced authenticity</li>
            <li>✓ Free shipping above ₹999</li>
            <li>✓ 7-day easy returns</li>
            <li>✓ Secure payments • COD available</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border bg-[#FFF8F0]">
        <div className="container-page py-4 text-xs text-gray-500 flex flex-wrap gap-3 justify-between">
          <span>© {new Date().getFullYear()} NamanKart. All rights reserved.</span>
          <span className="font-medium text-gray-600">Made with devotion in Bharat 🇮🇳</span>
        </div>
      </div>
    </footer>
  );
}
