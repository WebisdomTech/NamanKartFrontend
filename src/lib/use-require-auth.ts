import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "./auth-store";

/** Redirects to /login (preserving where to return to) unless a user is logged in. */
export function useRequireAuth(redirectPath: string) {
  const user = useAuth((s) => s.user);
  const status = useAuth((s) => s.status);
  const hydrate = useAuth((s) => s.hydrate);
  const navigate = useNavigate();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (status === "ready" && !user) {
      navigate({ to: "/login", search: { redirect: redirectPath } });
    }
  }, [status, user, navigate, redirectPath]);

  return { user, ready: status === "ready" && !!user };
}
