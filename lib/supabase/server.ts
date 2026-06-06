import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Server-side Supabase client for use in Server Components, API Routes, and tRPC.
// Reads/writes session cookies automatically.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // The `setAll` method is called from a Server Component.
            // Cookies can only be modified in Route Handlers and Server Actions.
          }
        },
      },
    }
  );
}

// Service-role client — bypasses RLS. Use only for admin operations server-side.
export async function createServiceClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Ignore cookie errors in Server Components
          }
        },
      },
    }
  );
}
