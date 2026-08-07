import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { api } from "@/lib/api";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [{ title: "Reset Password — NamanKart" }, { name: "robots", content: "noindex" }],
  }),
  // The token arrives on the link sent by email: /reset-password?token=…
  validateSearch: zodValidator(z.object({ token: fallback(z.string(), "").default("") })),
  component: ResetPasswordPage,
});

const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const input =
  "w-full border border-border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-saffron";

function ResetPasswordPage() {
  const { token } = Route.useSearch();
  const navigate = useNavigate();
  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = resetPasswordSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      await api.resetPassword({ resetToken: token, newPassword: parsed.data.newPassword });
      // The reset invalidates every existing session for this account, so the
      // only way forward is a fresh login.
      toast.success("Password updated. Please log in.");
      navigate({ to: "/login", search: { redirect: "" } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not reset password");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="container-page py-12 max-w-md">
        <h1 className="font-display text-3xl text-maroon mb-6">Reset link invalid</h1>
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-sm leading-relaxed">
            This page needs a reset link from your email. The link may have been truncated by your
            mail client, or it has already been used.
          </p>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          <Link to="/forgot-password" className="text-saffron font-medium">
            Request a new reset link
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="container-page py-12 max-w-md">
      <h1 className="font-display text-3xl text-maroon mb-6">Set a New Password</h1>
      <form onSubmit={onSubmit} className="rounded-lg border border-border bg-card p-5 space-y-3">
        <input
          className={input}
          type="password"
          placeholder="New password"
          autoComplete="new-password"
          value={form.newPassword}
          onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
        />
        <input
          className={input}
          type="password"
          placeholder="Confirm new password"
          autoComplete="new-password"
          value={form.confirmPassword}
          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
        />
        <button
          disabled={loading}
          className="w-full bg-saffron text-saffron-foreground font-medium py-3 rounded-md hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Updating…" : "Update password"}
        </button>
      </form>
      <p className="text-sm text-muted-foreground mt-4">
        Link expired?{" "}
        <Link to="/forgot-password" className="text-saffron font-medium">
          Request a new one
        </Link>
      </p>
    </div>
  );
}
