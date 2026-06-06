import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        // Add Zod validation errors to the response
        zodError:
          error.cause instanceof Error ? error.cause.message : undefined,
      },
    };
  },
});

export const createRouter = t.router;
export const publicProcedure = t.procedure;

// ─── Auth Middleware ───────────────────────────────────────────────────────────

const requireAuth = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

const requireAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });
  }
  if (ctx.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

export const authedProcedure = t.procedure.use(requireAuth);
export const adminProcedure = authedProcedure.use(requireAdmin);
