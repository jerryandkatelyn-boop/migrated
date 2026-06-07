import { createRouter, authedProcedure, publicProcedure } from "@/server/trpc";
import { createClient } from "@/lib/supabase/server";
import { updateUserLastSignIn } from "@/server/queries/users";

export const authRouter = createRouter({
  // Return the currently authenticated user profile, or null if not signed in.
  // Intentionally publicProcedure — using authedProcedure here throws UNAUTHORIZED
  // on the very first request after an email-confirmation redirect (before the
  // session cookie has been read by the server), and with retry:false that leaves
  // the dashboard permanently blank. Returning null lets the client retry cleanly.
  me: publicProcedure.query(({ ctx }) => {
    return ctx.user ?? null;
  }),

  // Update the last sign-in timestamp
  touch: authedProcedure.mutation(async ({ ctx }) => {
    if (ctx.user) {
      await updateUserLastSignIn(ctx.user.id);
    }
    return { success: true };
  }),

  // Check if the current session is valid
  check: publicProcedure.query(async () => {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return { authenticated: !!user };
    } catch {
      return { authenticated: false };
    }
  }),
});
