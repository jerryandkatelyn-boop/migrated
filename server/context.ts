import "server-only";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { User } from "@/types/database";
import { createClient } from "@/lib/supabase/server";

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: User;
};

export async function createContext(
  opts: FetchCreateContextFnOptions
): Promise<TrpcContext> {
  const ctx: TrpcContext = {
    req: opts.req,
    resHeaders: opts.resHeaders,
  };

  try {
    const supabase = await createClient();

    // Get the authenticated user from Supabase
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (authUser) {
      // Fetch extended profile from public.users (includes role)
      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (profile) {
        ctx.user = profile as User;
      }
    }
  } catch {
    // Auth is optional at the context level — procedures enforce it
  }

  return ctx;
}
