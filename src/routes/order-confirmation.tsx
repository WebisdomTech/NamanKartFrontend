import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { api } from "@/lib/api";
import { formatINR } from "@/lib/format";
import type { Order } from "@/lib/types";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/order-confirmation")({
  head: () => ({
    meta: [{ title: "Order Confirmed — NamanKart" }, { name: "robots", content: "noindex" }],
  }),
  validateSearch: zodValidator(z.object({ id: fallback(z.string(), "").default("") })),
  component: OrderConfirmed,
});

function OrderConfirmed() {
  const { id } = Route.useSearch();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (id) api.getOrder(id).then((o) => setOrder(o ?? null));
  }, [id]);

  return (
    <div className="container-page py-12 max-w-2xl">
      <div className="text-center">
        <CheckCircle2 className="h-16 w-16 text-saffron mx-auto" />
        <h1 className="font-display text-3xl text-maroon mt-4">Hari Bol! Order placed.</h1>
        <p className="text-muted-foreground mt-1">
          Thank you for your order. We've sent details to your email.
        </p>
      </div>
      {order && (
        <div className="mt-8 rounded-lg border border-border bg-card p-6">
          <div className="flex justify-between text-sm">
            <div>
              <p className="text-muted-foreground">Order ID</p>
              <p className="font-medium">{order.id}</p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground">Total</p>
              <p className="font-medium text-maroon">{formatINR(order.total)}</p>
            </div>
          </div>
          <div className="border-t border-border my-4" />
          <p className="text-sm font-medium mb-2">Items</p>
          <ul className="space-y-1 text-sm">
            {order.items.map((i, idx) => (
              <li key={idx} className="flex justify-between">
                <span>
                  {i.name}
                  {i.variantName ? ` (${i.variantName})` : ""} × {i.qty}
                </span>
                <span>{formatINR(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="border-t border-border my-4" />
          <p className="text-sm">
            <b>Shipping to:</b> {order.address.fullName}, {order.address.line1},{" "}
            {order.address.city}, {order.address.state} {order.address.pincode}
          </p>
          <p className="text-sm mt-1">
            <b>Payment:</b> {order.paymentMethod.toUpperCase()} · {order.paymentStatus}
          </p>
        </div>
      )}
      <div className="mt-8 flex flex-wrap gap-3 justify-center">
        <Link
          to="/track-order"
          className="bg-saffron text-saffron-foreground px-5 py-2.5 rounded-md font-medium"
        >
          Track Order
        </Link>
        <Link
          to="/shop"
          className="border border-border px-5 py-2.5 rounded-md font-medium hover:border-saffron"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
