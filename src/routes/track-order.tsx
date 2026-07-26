import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { api } from "@/lib/api";
import { formatINR } from "@/lib/format";
import type { Order } from "@/lib/types";
import { toast } from "sonner";

export const Route = createFileRoute("/track-order")({
  head: () => ({
    meta: [
      { title: "Track Your Order — NamanKart" },
      { name: "description", content: "Track your NamanKart order with Order ID and email." },
      { property: "og:url", content: "/track-order" },
    ],
    links: [{ rel: "canonical", href: "/track-order" }],
  }),
  component: Track,
});

const STAGES: Order["orderStatus"][] = ["pending", "confirmed", "shipped", "delivered"];

function Track() {
  const [id, setId] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<Order | null>(null);

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    const o = await api.getOrder(id.trim(), email.trim() || undefined);
    if (!o) {
      toast.error("Order not found. Check your Order ID and email.");
      setOrder(null);
      return;
    }
    setOrder(o);
  }

  const stageIdx = order ? STAGES.indexOf(order.orderStatus) : -1;

  return (
    <div className="container-page py-12 max-w-2xl">
      <h1 className="font-display text-3xl text-maroon">Track Your Order</h1>
      <p className="text-sm text-muted-foreground mt-1">Enter your Order ID to see its status.</p>

      <form onSubmit={lookup} className="mt-6 grid sm:grid-cols-[1fr_1fr_auto] gap-2">
        <input
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="Order ID (e.g. NK…)"
          className="border border-border rounded-md px-3 py-2 text-sm bg-background"
          required
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email (optional)"
          className="border border-border rounded-md px-3 py-2 text-sm bg-background"
        />
        <button className="bg-saffron text-saffron-foreground px-4 py-2 rounded-md font-medium">
          Track
        </button>
      </form>

      {order && (
        <div className="mt-8 rounded-lg border border-border bg-card p-6">
          <div className="flex justify-between flex-wrap gap-2">
            <div>
              <p className="text-xs text-muted-foreground">Order</p>
              <p className="font-medium">{order.id}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="font-medium text-maroon">{formatINR(order.total)}</p>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center">
              {STAGES.map((s, i) => (
                <div key={s} className="flex-1 flex items-center">
                  <div
                    className={
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium " +
                      (i <= stageIdx
                        ? "bg-saffron text-saffron-foreground"
                        : "bg-muted text-muted-foreground")
                    }
                  >
                    {i + 1}
                  </div>
                  {i < STAGES.length - 1 && (
                    <div className={"flex-1 h-0.5 " + (i < stageIdx ? "bg-saffron" : "bg-muted")} />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[11px] text-muted-foreground capitalize">
              {STAGES.map((s) => (
                <span key={s}>{s}</span>
              ))}
            </div>
          </div>

          <p className="mt-6 text-sm">
            Estimated delivery: <b>3–5 business days</b>
          </p>
        </div>
      )}
    </div>
  );
}
