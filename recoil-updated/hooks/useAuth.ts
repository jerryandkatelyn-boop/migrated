"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { trpc } from "@/components/providers/trpc-provider";

export function useAuth() {
  const router = useRouter();
  const supabase = createClient();

  // Track client-side Supabase session independently of the tRPC profile query.
  // null  = not yet checked (still loading)
  // true  = session confirmed
  // false = definitely no session
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  const {
    data: user,
    isLoading: trpcLoading,
    error,
    refetch,
  } = trpc.auth.me.useQuery(undefined, {
    retry: 3,
    retryDelay: 800,
    staleTime: 60_000,
  });

  useEffect(() => {
    // Resolve the initial session immediately so we can unblock the loading
    // state without waiting for the tRPC round-trip.
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(!!session);
    });

    // Keep the session flag in sync with auth state changes.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setHasSession(!!session);

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

  // Stay in loading state until both the Supabase session check and the
  // tRPC query have resolved. This prevents a flicker where hasSession is
  // already true but the user object hasn't arrived yet.
  const isLoading = hasSession === null || trpcLoading;

  // A user is authenticated when EITHER the tRPC profile exists OR the
  // client-side Supabase session is confirmed. This prevents the redirect
  // loop where auth.me returns null due to a profile lookup failure even
  // though the Supabase session is still valid.
  const isAuthenticated = !!user || hasSession === true;

  return {
    user: user ?? null,
    isLoading,
    isAuthenticated,
    isAdmin: user?.role === "admin",
    error: error ?? null,
    logout,
    refetch,
  };
}
