import { z } from "zod";
import { createRouter, adminProcedure } from "@/server/trpc";
import {
  getAdminStats,
  getProviderStats,
  getDailyStats,
  getRecentChats,
  getRecentMessages,
} from "@/server/queries/chats";
import { getAllUsers, updateUserRole, getUserCount } from "@/server/queries/users";
import { createServiceClient } from "@/lib/supabase/server";

export const adminRouter = createRouter({
  // ─── Analytics ─────────────────────────────────────────────────────────────

  stats: adminProcedure.query(() => getAdminStats()),

  providerStats: adminProcedure.query(() => getProviderStats()),

  dailyStats: adminProcedure
    .input(z.object({ days: z.number().min(1).max(90).optional() }))
    .query(({ input }) => getDailyStats(input?.days ?? 30)),

  recentChats: adminProcedure
    .input(z.object({ limit: z.number().min(1).max(200).optional() }))
    .query(({ input }) => getRecentChats(input?.limit ?? 50)),

  recentMessages: adminProcedure
    .input(z.object({ limit: z.number().min(1).max(500).optional() }))
    .query(({ input }) => getRecentMessages(input?.limit ?? 100)),

  // ─── User Management ───────────────────────────────────────────────────────

  users: adminProcedure
    .input(z.object({ limit: z.number().min(1).max(500).optional() }))
    .query(({ input }) => getAllUsers(input?.limit ?? 100)),

  userCount: adminProcedure.query(() => getUserCount()),

  updateUserRole: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        role: z.enum(["user", "admin"]),
      })
    )
    .mutation(async ({ input }) => {
      await updateUserRole(input.userId, input.role);
      return { success: true };
    }),

  // ─── Feature Flags ─────────────────────────────────────────────────────────

  getFeatureFlags: adminProcedure.query(async () => {
    const supabase = await createServiceClient();
    const { data, error } = await supabase
      .from("feature_flags")
      .select("*")
      .order("key");
    if (error) return [];
    return data ?? [];
  }),

  updateFeatureFlag: adminProcedure
    .input(
      z.object({
        id: z.string(),
        enabled: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      const supabase = await createServiceClient();
      await supabase
        .from("feature_flags")
        .update({
          enabled: input.enabled,
          updated_at: new Date().toISOString(),
        })
        .eq("id", input.id);
      return { success: true };
    }),

  // ─── Admin Settings ─────────────────────────────────────────────────────────

  getSettings: adminProcedure.query(async () => {
    const supabase = await createServiceClient();
    const { data, error } = await supabase
      .from("admin_settings")
      .select("*")
      .order("category")
      .order("key");
    if (error) return [];
    return data ?? [];
  }),

  updateSetting: adminProcedure
    .input(z.object({ key: z.string(), value: z.string() }))
    .mutation(async ({ input }) => {
      const supabase = await createServiceClient();
      await supabase
        .from("admin_settings")
        .update({ value: input.value, updated_at: new Date().toISOString() })
        .eq("key", input.key);
      return { success: true };
    }),

  // ─── System Prompts ─────────────────────────────────────────────────────────

  getPrompts: adminProcedure.query(async () => {
    const supabase = await createServiceClient();
    const { data, error } = await supabase
      .from("system_prompts")
      .select("*")
      .order("is_default", { ascending: false })
      .order("name");
    if (error) return [];
    return data ?? [];
  }),

  updatePrompt: adminProcedure
    .input(
      z.object({
        id: z.string(),
        prompt: z.string().optional(),
        is_active: z.boolean().optional(),
        is_default: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const supabase = await createServiceClient();
      const { id, ...data } = input;
      await supabase
        .from("system_prompts")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id);
      return { success: true };
    }),

  // ─── AI Providers ──────────────────────────────────────────────────────────

  getProviders: adminProcedure.query(async () => {
    const supabase = await createServiceClient();
    const { data, error } = await supabase
      .from("ai_providers")
      .select("id, name, slug, base_url, default_model, models, is_active, is_default, cost_per_1k_input, cost_per_1k_output, priority, created_at, updated_at")
      .order("priority", { ascending: false });
    if (error) return [];
    return data ?? [];
  }),

  updateProvider: adminProcedure
    .input(
      z.object({
        id: z.string(),
        is_active: z.boolean().optional(),
        is_default: z.boolean().optional(),
        default_model: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const supabase = await createServiceClient();
      const { id, ...data } = input;
      await supabase
        .from("ai_providers")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id);
      return { success: true };
    }),
});
