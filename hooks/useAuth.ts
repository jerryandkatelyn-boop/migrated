"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { trpc } from "@/components/providers/trpc-provider";

export function useAuth() {
  const router = useRouter();
  const supabase = createClient();

  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = trpc.auth.me.useQuery(undefined, {
    // Retry up to 3 times with a short delay — the first call can fail if the
    // session cookie hasn't been committed to the browser yet (race condition
    // immediately after an email-confirmation redirect).
    retry: 3,
    retryDelay: 800,
    staleTime: 60_000,
  });

  // Listen for Supabase auth state changes and sync with the tRPC query.
  // INITIAL_SESSION fires when the browser client finds an existing session on
  // mount (e.g. right after the email-confirmation callback redirect) — without
  // handling it, the tRPC query can resolve before the session is available and
  // never re-run, leaving the dashboard blank.
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (
        event === "INITIAL_SESSION" ||
        event === "SIGNED_IN" ||
        event === "TOKEN_REFRESHED"
      ) {
        refetch();
      }
      if (event === "SIGNED_OUT") {
        router.push("/login");
        router.refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, refetch, router]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }, [supabase, router]);

  return {
    user: user ?? null,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    error: error ?? null,
    logout,
    refetch,
  };
}
