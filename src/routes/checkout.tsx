import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { api, startRazorpayPayment } from "@/lib/api";
import { useCart } from "@/lib/cart-store";
import { computeShipping, formatINR } from "@/lib/format";
import type { Product } from "@/lib/types";

export const Route = createFileRoute("/checkout")({
  loader: async () => {
    const products = await api.listProducts();
    return { products };
  },
  head: () => ({
    meta: [{ title: "Checkout — NamanKart" }, { name: "robots", content: "noindex" }],
  }),
  component: CheckoutPage,
});

const addressSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(80),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile"),
  line1: z.string().trim().min(5, "Enter your address").max(120),
  line2: z.string().trim().max(120).optional().or(z.literal("")),
  city: z.string().trim().min(2).max(60),
  state: z.string().trim().min(2).max(60),
  pincode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter a valid 6-digit PIN"),
  country: z.literal("India"),
  email: z.string().trim().email(),
});

function CheckoutPage() {
  const { products } = Route.useLoaderData() as { products: Product[] };
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const coupon = useCart((s) => s.coupon);
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India" as const,
  });

  const detailed = items
    .map((it) => {
      const p = products.find((x) => x.id === it.productId || (x as any)._id === it.productId);
      const v = p?.variants?.find((x) => x.id === it.variantId);
      const price = v?.salePrice ?? v?.price ?? p?.salePrice ?? p?.basePrice ?? 0;
      return { p, v, qty: it.qty, price };
    })
    .filter((x) => x.p);

  const subtotal = detailed.reduce((n, x) => n + x.price * x.qty, 0);
  const shipping = computeShipping(subtotal);
  const discount = coupon?.discount ?? 0;
  const total = subtotal + shipping - discount;

  if (detailed.length === 0) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="font-display text-2xl">Your cart is empty.</h1>
        <Link to="/shop" className="text-saffron mt-3 inline-block">
          Continue shopping →
        </Link>
      </div>
    );
  }

  async function placeOrder() {
    const parsed = addressSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      if (paymentMethod === "razorpay") {
        const res = await startRazorpayPayment(total, {
          name: parsed.data.fullName,
          email: parsed.data.email,
          contact: parsed.data.phone,
        });
        if (res.cancelled) {
          toast.message("Payment cancelled");
          setLoading(false);
          return;
        }
        if (!res.paid) throw new Error("Payment failed");
      }
      const order = await api.createOrder({
        items: detailed.map((x) => ({
          productId: x.p!.id,
          name: x.p!.name,
          qty: x.qty,
          price: x.price,
          variantName: x.v?.name,
        })),
        address: { ...parsed.data, line2: parsed.data.line2 || undefined },
        email: parsed.data.email,
        paymentMethod,
        couponCode: coupon?.code,
      });
      clear();
      navigate({ to: "/order-confirmation", search: { id: order.id, email: parsed.data.email } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not place order");
    } finally {
      setLoading(false);
    }
  }

  const input =
    "w-full border border-border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-saffron";

  return (
    <div className="container-page py-8">
      <h1 className="font-display text-3xl text-maroon mb-6">Checkout</h1>
      <div className="grid md:grid-cols-[1fr_380px] gap-8">
        <div className="space-y-6">
          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="font-semibold mb-4">Shipping Address</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <input
                className={input}
                placeholder="Full name"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
              <input
                className={input}
                placeholder="Mobile number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <input
                className={input + " sm:col-span-2"}
                placeholder="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <input
                className={input + " sm:col-span-2"}
                placeholder="Address line 1"
                value={form.line1}
                onChange={(e) => setForm({ ...form, line1: e.target.value })}
              />
              <input
                className={input + " sm:col-span-2"}
                placeholder="Address line 2 (optional)"
                value={form.line2}
                onChange={(e) => setForm({ ...form, line2: e.target.value })}
              />
              <input
                className={input}
                placeholder="City"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
              <input
                className={input}
                placeholder="State"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
              />
              <input
                className={input}
                placeholder="PIN code"
                value={form.pincode}
                onChange={(e) => setForm({ ...form, pincode: e.target.value })}
              />
              <input className={input + " bg-muted"} value="India" readOnly />
            </div>
          </section>

          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="font-semibold mb-4">Payment Method</h2>
            <div className="space-y-2">
              <label
                className={
                  "flex items-start gap-3 p-3 border rounded-md cursor-pointer " +
                  (paymentMethod === "razorpay" ? "border-saffron bg-saffron/5" : "border-border")
                }
              >
                <input
                  type="radio"
                  checked={paymentMethod === "razorpay"}
                  onChange={() => setPaymentMethod("razorpay")}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium text-sm">Razorpay — UPI / Cards / Net Banking</p>
                  <p className="text-xs text-muted-foreground">
                    Secure online payment via Razorpay. Currently in TEST mode — use a Razorpay test
                    card or UPI ID at checkout.
                  </p>
                </div>
              </label>
              <label
                className={
                  "flex items-start gap-3 p-3 border rounded-md cursor-pointer " +
                  (paymentMethod === "cod" ? "border-saffron bg-saffron/5" : "border-border")
                }
              >
                <input
                  type="radio"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium text-sm">Cash on Delivery</p>
                  <p className="text-xs text-muted-foreground">
                    Pay in cash when your order arrives.
                  </p>
                </div>
              </label>
            </div>
          </section>
        </div>

        <aside className="rounded-lg border border-border bg-card p-5 h-fit sticky top-32">
          <h2 className="font-semibold mb-4">Order Summary</h2>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {detailed.map((x) => (
              <div key={x.p!.id + (x.v?.id ?? "")} className="flex justify-between text-sm">
                <span className="truncate pr-2">
                  {x.p!.name}
                  {x.v ? ` (${x.v.name})` : ""} × {x.qty}
                </span>
                <span>{formatINR(x.price * x.qty)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-border my-3" />
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatINR(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{shipping === 0 ? "FREE" : formatINR(shipping)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-saffron">
                <span>Discount {coupon ? `(${coupon.code})` : ""}</span>
                <span>−{formatINR(discount)}</span>
              </div>
            )}
          </div>
          <div className="border-t border-border my-3" />
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span className="text-maroon">{formatINR(total)}</span>
          </div>
          <button
            disabled={loading}
            onClick={placeOrder}
            className="mt-4 w-full bg-saffron text-saffron-foreground font-medium py-3 rounded-md hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Placing order…" : `Place Order · ${formatINR(total)}`}
          </button>
          <p className="text-[10px] text-muted-foreground mt-2 text-center">
            By placing your order you agree to our Terms & Privacy Policy.
          </p>
        </aside>
      </div>
    </div>
  );
}
