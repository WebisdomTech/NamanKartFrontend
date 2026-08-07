import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { useAuth } from "@/lib/auth-store";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "Login — NamanKart" }, { name: "robots", content: "noindex" }],
  }),
  validateSearch: zodValidator(z.object({ redirect: fallback(z.string(), "").default("") })),
  component: LoginPage,
});

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

const input =
  "w-full border border-border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-saffron";

function LoginPage() {
  const login = useAuth((s) => s.login);
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = loginSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      await login(parsed.data.email, parsed.data.password);
      toast.success("Welcome back!");
      navigate({ to: redirect || "/account" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not log in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-page py-12 max-w-md">
      <h1 className="font-display text-3xl text-maroon mb-6">Login</h1>
      <form onSubmit={onSubmit} className="rounded-lg border border-border bg-card p-5 space-y-3">
        <input
          className={input}
          type="email"
          placeholder="Email"
          autoComplete="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          className={input}
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button
          disabled={loading}
          className="w-full bg-saffron text-saffron-foreground font-medium py-3 rounded-md hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Logging in…" : "Login"}
        </button>
      </form>
      <p className="text-sm text-muted-foreground mt-4">
        <Link to="/forgot-password" className="text-saffron font-medium">
          Forgot your password?
        </Link>
      </p>
      <p className="text-sm text-muted-foreground mt-2">
        New to NamanKart?{" "}
        <Link to="/register" search={{ redirect }} className="text-saffron font-medium">
          Create an account
        </Link>
      </p>
    </div>
  );
}
