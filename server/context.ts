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
      let { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single();

      // If no profile row exists yet (e.g. the on_auth_user_created trigger
      // misfired, or this is the very first request after email confirmation
      // before the trigger has committed), create it on the fly so the user
      // isn't stuck with a permanent black screen.
      if (!profile) {
        const { data: created } = await supabase
          .from("users")
          .upsert(
            {
              id: authUser.id,
              email: authUser.email ?? "",
              name:
                authUser.user_metadata?.full_name ??
                authUser.email?.split("@")[0] ??
                null,
              avatar: authUser.user_metadata?.avatar_url ?? null,
              last_sign_in_at: new Date().toISOString(),
            },
            { onConflict: "id" }
          )
          .select("*")
          .single();

        profile = created;
      }

      if (profile) {
        ctx.user = profile as User;
      }
    }
  } catch {
    // Auth is optional at the context level — procedures enforce it
  }

  return ctx;
}
