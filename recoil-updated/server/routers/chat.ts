import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, authedProcedure } from "@/server/trpc";
import {
  findChatsByUser,
  findChatById,
  createChat,
  updateChat,
  deleteChat,
  findMessagesByChat,
  createMessage,
  incrementUsage,
  getTodayUsage,
  getUsageStats,
  checkUsageLimit,
} from "@/server/queries/chats";
import { getTodayDateStr } from "@/lib/utils";

const FREE_TIER_DAILY_LIMIT = 20;

export const chatRouter = createRouter({
  // ─── Chat CRUD ─────────────────────────────────────────────────────────────

  list: authedProcedure.query(({ ctx }) =>
    findChatsByUser(ctx.user.id)
  ),

  get: authedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => findChatById(input.id, ctx.user.id)),

  create: authedProcedure
    .input(
      z.object({
        title: z.string().max(255).optional(),
        model: z.string().optional(),
      })
    )
    .mutation(({ ctx, input }) =>
      createChat({
        userId: ctx.user.id,
        title: input.title,
        model: input.model,
      })
    ),

  update: authedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().max(255).optional(),
        model: z.string().optional(),
        is_pinned: z.boolean().optional(),
        is_archived: z.boolean().optional(),
      })
    )
    .mutation(({ ctx, input }) => {
      const { id, ...data } = input;
      return updateChat(id, ctx.user.id, data);
    }),

  delete: authedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => deleteChat(input.id, ctx.user.id)),

  // ─── Messages ──────────────────────────────────────────────────────────────

  messages: authedProcedure
    .input(z.object({ chatId: z.string() }))
    .query(({ ctx, input }) =>
      findMessagesByChat(input.chatId, ctx.user.id)
    ),

  sendMessage: authedProcedure
    .input(
      z.object({
        chatId: z.string(),
        content: z.string().min(1).max(10000),
        model: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check daily usage limit
      const today = getTodayDateStr();
      const usage = await getTodayUsage(ctx.user.id, today);
      const messageCount = usage?.message_count ?? 0;

      if (messageCount >= FREE_TIER_DAILY_LIMIT) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: `Daily message limit reached (${FREE_TIER_DAILY_LIMIT}/${FREE_TIER_DAILY_LIMIT}). Upgrade to continue.`,
        });
      }

      // Verify chat ownership
      const chat = await findChatById(input.chatId, ctx.user.id);
      if (!chat) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Chat not found",
        });
      }

      // Create user message
      const userMessage = await createMessage({
        chatId: input.chatId,
        role: "user",
        content: input.content,
        model: input.model ?? chat.model,
      });

      // Track usage (0 tokens for non-streamed messages)
      await incrementUsage(ctx.user.id, today, 0, 0, input.model);

      return {
        userMessage,
        remainingMessages: Math.max(0, FREE_TIER_DAILY_LIMIT - messageCount - 1),
      };
    }),

  // ─── Usage ─────────────────────────────────────────────────────────────────

  usage: authedProcedure.query(({ ctx }) =>
    getTodayUsage(ctx.user.id, getTodayDateStr())
  ),

  usageStats: authedProcedure
    .input(z.object({ days: z.number().min(1).max(365).optional() }))
    .query(({ ctx, input }) =>
      getUsageStats(ctx.user.id, input?.days ?? 30)
    ),

  checkLimit: authedProcedure.query(async ({ ctx }) => {
    return checkUsageLimit(ctx.user.id, FREE_TIER_DAILY_LIMIT).then(
      (result) => ({ ...result, limit: FREE_TIER_DAILY_LIMIT })
    );
  }),
});
