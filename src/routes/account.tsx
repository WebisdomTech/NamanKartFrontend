import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";
import { formatINR } from "@/lib/format";
import type { Order } from "@/lib/types";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [{ title: "My Account — NamanKart" }, { name: "robots", content: "noindex" }],
  }),
  component: Account,
});

function Account() {
  const { user, status, logout, hydrate } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (status === "ready" && !user) {
      navigate({ to: "/login" });
    }
  }, [status, user, navigate]);

  useEffect(() => {
    if (user) api.listMyOrders().then(setOrders);
  }, [user]);

  if (status !== "ready" || !user) {
    return <div className="container-page py-20 text-center text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="container-page py-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl text-maroon">My Account</h1>
          <p className="text-sm text-muted-foreground">
            {user.fullName} · {user.email}
          </p>
        </div>
        <button
          onClick={() => {
            logout();
            navigate({ to: "/" });
          }}
          className="text-sm font-medium border border-border rounded-md px-4 py-2 hover:bg-muted"
        >
          Log out
        </button>
      </div>

      <h2 className="font-semibold mt-8 mb-3">Recent Orders</h2>
      {orders.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">No orders yet.</p>
          <Link to="/shop" className="mt-3 inline-block text-saffron">
            Start shopping →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div
              key={o.id}
              className="rounded-lg border border-border bg-card p-4 flex flex-wrap justify-between gap-2"
            >
              <div>
                <p className="font-medium">{o.id}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(o.createdAt).toLocaleString()}
                </p>
                <p className="text-xs">
                  {o.items.length} item(s) · {o.paymentMethod.toUpperCase()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-maroon">{formatINR(o.total)}</p>
                <p className="text-xs capitalize text-saffron">{o.orderStatus}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
