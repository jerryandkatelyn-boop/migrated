import { createRouter, publicProcedure } from "@/server/trpc";
import { authRouter } from "./auth";
import { chatRouter } from "./chat";
import { adminRouter } from "./admin";
import { getAvailableModels } from "@/server/services/ai-provider";

export const appRouter = createRouter({
  ping: publicProcedure.query(() => ({ ok: true, ts: Date.now() })),
  models: publicProcedure.query(() => getAvailableModels()),
  auth: authRouter,
  chat: chatRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
