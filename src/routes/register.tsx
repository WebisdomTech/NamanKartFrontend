import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useAuth } from "@/lib/auth-store";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [{ title: "Create Account — NamanKart" }, { name: "robots", content: "noindex" }],
  }),
  component: RegisterPage,
});

const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(100),
  email: z.string().trim().email("Enter a valid email"),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const input =
  "w-full border border-border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-saffron";

function RegisterPage() {
  const register = useAuth((s) => s.register);
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = registerSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      await register({
        fullName: parsed.data.fullName,
        email: parsed.data.email,
        password: parsed.data.password,
        phone: parsed.data.phone || undefined,
      });
      toast.success("Account created!");
      navigate({ to: "/account" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not create account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-page py-12 max-w-md">
      <h1 className="font-display text-3xl text-maroon mb-6">Create Account</h1>
      <form onSubmit={onSubmit} className="rounded-lg border border-border bg-card p-5 space-y-3">
        <input
          className={input}
          placeholder="Full name"
          autoComplete="name"
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
        />
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
          placeholder="Mobile number (optional)"
          autoComplete="tel"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <input
          className={input}
          type="password"
          placeholder="Password"
          autoComplete="new-password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button
          disabled={loading}
          className="w-full bg-saffron text-saffron-foreground font-medium py-3 rounded-md hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Creating account…" : "Create Account"}
        </button>
      </form>
      <p className="text-sm text-muted-foreground mt-4">
        Already have an account?{" "}
        <Link to="/login" className="text-saffron font-medium">
          Log in
        </Link>
      </p>
    </div>
  );
}
