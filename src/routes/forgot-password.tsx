import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { api } from "@/lib/api";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [{ title: "Forgot Password — NamanKart" }, { name: "robots", content: "noindex" }],
  }),
  component: ForgotPasswordPage,
});

const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
});

const input =
  "w-full border border-border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-saffron";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      await api.forgotPassword(parsed.data.email);
      // Shown regardless of whether the address exists, so this screen can't
      // be used to test which emails have accounts.
      setSent(true);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not send reset instructions");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="container-page py-12 max-w-md">
        <h1 className="font-display text-3xl text-maroon mb-6">Check your email</h1>
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-sm leading-relaxed">
            If an account exists for <strong>{email}</strong>, we've sent a link to reset your
            password. The link expires in 15 minutes.
          </p>
          <p className="text-sm text-muted-foreground mt-3">
            Didn't get it? Check your spam folder, or{" "}
            <button
              type="button"
              onClick={() => setSent(false)}
              className="text-saffron font-medium underline-offset-2 hover:underline"
            >
              try another email address
            </button>
            .
          </p>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          <Link to="/login" search={{ redirect: "" }} className="text-saffron font-medium">
            Back to login
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="container-page py-12 max-w-md">
      <h1 className="font-display text-3xl text-maroon mb-6">Forgot Password</h1>
      <form onSubmit={onSubmit} className="rounded-lg border border-border bg-card p-5 space-y-3">
        <p className="text-sm text-muted-foreground">
          Enter the email on your account and we'll send you a link to set a new password.
        </p>
        <input
          className={input}
          type="email"
          placeholder="Email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          disabled={loading}
          className="w-full bg-saffron text-saffron-foreground font-medium py-3 rounded-md hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Sending…" : "Send reset link"}
        </button>
      </form>
      <p className="text-sm text-muted-foreground mt-4">
        Remembered it?{" "}
        <Link to="/login" search={{ redirect: "" }} className="text-saffron font-medium">
          Log in
        </Link>
      </p>
    </div>
  );
}
