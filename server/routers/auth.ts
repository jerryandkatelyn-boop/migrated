import { createRouter, authedProcedure, publicProcedure } from "@/server/trpc";
import { createClient } from "@/lib/supabase/server";
import { updateUserLastSignIn } from "@/server/queries/users";

export const authRouter = createRouter({
  // Return the currently authenticated user profile
  me: authedProcedure.query(({ ctx }) => {
    return ctx.user;
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
