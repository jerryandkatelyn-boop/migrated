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
    retry: false,
    staleTime: 60_000,
  });

  // Listen for Supabase auth state changes and sync
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
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
