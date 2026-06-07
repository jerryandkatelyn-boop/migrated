import { createRouter, publicProcedure } from "@/server/trpc";
import { authRouter } from "./auth";
import { chatRouter } from "./chat";
import { adminRouter } from "./admin";
import { getAvailableModels, getBrandedModels } from "@/server/services/ai-provider";

export const appRouter = createRouter({
  ping: publicProcedure.query(() => ({ ok: true, ts: Date.now() })),
  models: publicProcedure.query(() => getAvailableModels()),
  brandedModels: publicProcedure.query(() => getBrandedModels()),
  auth: authRouter,
  chat: chatRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
