import { startLogin } from "@/const";
import { useCallback, useEffect, useState } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

type AuthUser = { name?: string | null; email?: string | null; [key: string]: unknown };

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath } = options ?? {};
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/me", { credentials: "include", headers: { Accept: "application/json" } });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error || `Authentication request failed (${response.status})`);
      setUser(payload as AuthUser | null);
      setError(null);
      try { localStorage.setItem("manus-runtime-user-info", JSON.stringify(payload)); } catch {}
    } catch (requestError) {
      setUser(null);
      setError(requestError instanceof Error ? requestError : new Error("Authentication request failed"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const logout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch("/api/auth/logout", { method: "POST", credentials: "include", headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error(`Logout failed (${response.status})`);
    } finally {
      try { sessionStorage.removeItem("manus-cookie"); } catch {}
      setUser(null);
      setIsLoggingOut(false);
    }
  }, []);

  useEffect(() => {
    if (!redirectOnUnauthenticated || loading || isLoggingOut || user) return;
    if (typeof window === "undefined") return;
    if (redirectPath && window.location.pathname === redirectPath) return;
    if (redirectPath) window.location.href = redirectPath;
    else startLogin();
  }, [redirectOnUnauthenticated, redirectPath, loading, isLoggingOut, user]);

  return { user, loading: loading || isLoggingOut, error, isAuthenticated: Boolean(user), refresh, logout };
}
