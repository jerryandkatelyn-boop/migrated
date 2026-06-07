import "server-only";
import type {
  Chat,
  Message,
  UsageTracking,
  AdminStats,
  ProviderStats,
  DailyStats,
} from "@/types/database";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getTodayDateStr } from "@/lib/utils";

// ─── Chat Queries ──────────────────────────────────────────────────────────────

export async function findChatsByUser(userId: string): Promise<Chat[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("chats")
    .select("*")
    .eq("user_id", userId)
    .eq("is_archived", false)
    .order("is_pinned", { ascending: false })
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("[chats] findChatsByUser error:", error);
    return [];
  }
  return (data ?? []) as Chat[];
}

export async function findChatById(
  chatId: string,
  userId: string
): Promise<Chat | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("chats")
    .select("*")
    .eq("id", chatId)
    .eq("user_id", userId)
    .single();

  if (error || !data) return null;
  return data as Chat;
}

export async function createChat(data: {
  userId: string;
  title?: string;
  model?: string;
}): Promise<Chat | null> {
  const supabase = await createClient();
  const { data: chat, error } = await supabase
    .from("chats")
    .insert({
      user_id: data.userId,
      title: data.title || "New Chat",
      model: data.model || "openai/gpt-4o-mini",
      is_pinned: false,
      is_archived: false,
    })
    .select()
    .single();

  if (error) {
    console.error("[chats] createChat error:", error);
    return null;
  }
  return chat as Chat;
}

export async function updateChat(
  chatId: string,
  userId: string,
  data: Partial<{
    title: string;
    model: string;
    is_pinned: boolean;
    is_archived: boolean;
  }>
): Promise<Chat | null> {
  const supabase = await createClient();
  const { data: chat, error } = await supabase
    .from("chats")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", chatId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error("[chats] updateChat error:", error);
    return null;
  }
  return chat as Chat;
}

export async function deleteChat(
  chatId: string,
  userId: string
): Promise<{ success: boolean }> {
  const supabase = await createClient();

  // Messages are deleted via ON DELETE CASCADE in the DB
  const { error } = await supabase
    .from("chats")
    .delete()
    .eq("id", chatId)
    .eq("user_id", userId);

  if (error) {
    console.error("[chats] deleteChat error:", error);
    return { success: false };
  }
  return { success: true };
}

// ─── Message Queries ───────────────────────────────────────────────────────────

export async function findMessagesByChat(
  chatId: string,
  userId: string
): Promise<Message[]> {
  // Verify ownership first
  const chat = await findChatById(chatId, userId);
  if (!chat) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[chats] findMessagesByChat error:", error);
    return [];
  }
  return (data ?? []) as Message[];
}

export async function createMessage(data: {
  chatId: string;
  role: "user" | "assistant" | "system";
  content: string;
  model?: string;
  tokensUsed?: number;
  latencyMs?: number;
  costUsd?: number;
  provider?: string;
  metadata?: string;
}): Promise<Message | null> {
  const supabase = await createClient();
  const { data: message, error } = await supabase
    .from("messages")
    .insert({
      chat_id: data.chatId,
      role: data.role,
      content: data.content,
      model: data.model ?? null,
      tokens_used: data.tokensUsed ?? null,
      latency_ms: data.latencyMs ?? null,
      cost_usd: data.costUsd ?? null,
      provider: data.provider ?? null,
      metadata: data.metadata ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error("[chats] createMessage error:", error);
    return null;
  }
  return message as Message;
}

export async function updateChatTimestamp(chatId: string): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("chats")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", chatId);
}

// ─── Usage Tracking Queries ────────────────────────────────────────────────────

export async function getTodayUsage(
  userId: string,
  date: string
): Promise<UsageTracking | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("usage_tracking")
    .select("*")
    .eq("user_id", userId)
    .eq("date", date)
    .single();

  if (error || !data) return null;
  return data as UsageTracking;
}

export async function incrementUsage(
  userId: string,
  date: string,
  tokens: number,
  costUsd: number,
  model?: string,
  provider?: string
): Promise<void> {
  const supabase = await createClient();

  const existing = await getTodayUsage(userId, date);

  if (existing) {
    await supabase
      .from("usage_tracking")
      .update({
        message_count: existing.message_count + 1,
        token_count: existing.token_count + tokens,
        cost_usd: existing.cost_usd + costUsd,
        model: model ?? existing.model,
        provider: provider ?? existing.provider,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
  } else {
    await supabase.from("usage_tracking").insert({
      user_id: userId,
      date,
      message_count: 1,
      token_count: tokens,
      cost_usd: costUsd,
      model: model ?? null,
      provider: provider ?? null,
    });
  }
}

export async function getUsageStats(
  userId: string,
  days = 30
): Promise<UsageTracking[]> {
  const supabase = await createClient();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const dateStr = startDate.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("usage_tracking")
    .select("*")
    .eq("user_id", userId)
    .gte("date", dateStr)
    .order("date", { ascending: true });

  if (error) return [];
  return (data ?? []) as UsageTracking[];
}

export async function checkUsageLimit(
  userId: string,
  limit: number
): Promise<{ used: number; remaining: number; hasReachedLimit: boolean }> {
  const today = getTodayDateStr();
  const usage = await getTodayUsage(userId, today);
  const used = usage?.message_count ?? 0;
  return {
    used,
    remaining: Math.max(0, limit - used),
    hasReachedLimit: used >= limit,
  };
}

// ─── Admin Analytics Queries ───────────────────────────────────────────────────

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = await createServiceClient();
  const today = getTodayDateStr();

  const [
    { count: totalUsers },
    { count: totalChats },
    { count: totalMessages },
    { count: dailyActiveUsers },
    { count: messagesToday },
    { data: tokenData },
    { data: costTodayData },
  ] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("chats").select("*", { count: "exact", head: true }),
    supabase.from("messages").select("*", { count: "exact", head: true }),
    supabase
      .from("usage_tracking")
      .select("user_id", { count: "exact", head: true })
      .eq("date", today),
    supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .gte("created_at", `${today}T00:00:00.000Z`),
    supabase
      .from("usage_tracking")
      .select("token_count, cost_usd"),
    supabase
      .from("usage_tracking")
      .select("cost_usd")
      .eq("date", today),
  ]);

  const totalTokens = tokenData?.reduce((sum, row) => sum + (row.token_count ?? 0), 0) ?? 0;
  const totalCostUsd = tokenData?.reduce((sum, row) => sum + (row.cost_usd ?? 0), 0) ?? 0;
  const costToday = costTodayData?.reduce((sum, row) => sum + (row.cost_usd ?? 0), 0) ?? 0;

  return {
    total_users: totalUsers ?? 0,
    total_chats: totalChats ?? 0,
    total_messages: totalMessages ?? 0,
    daily_active_users: dailyActiveUsers ?? 0,
    messages_today: messagesToday ?? 0,
    total_tokens: totalTokens,
    total_cost_usd: totalCostUsd,
    cost_today: costToday,
  };
}

export async function getProviderStats(): Promise<ProviderStats[]> {
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("usage_tracking")
    .select("provider, message_count, token_count, cost_usd");

  if (error || !data) return [];

  const aggregated: Record<string, ProviderStats> = {};
  for (const row of data) {
    const key = row.provider ?? "unknown";
    if (!aggregated[key]) {
      aggregated[key] = { provider: key, message_count: 0, token_count: 0, cost_usd: 0 };
    }
    aggregated[key].message_count += row.message_count ?? 0;
    aggregated[key].token_count += row.token_count ?? 0;
    aggregated[key].cost_usd += row.cost_usd ?? 0;
  }

  return Object.values(aggregated).sort((a, b) => b.message_count - a.message_count);
}

export async function getDailyStats(days = 30): Promise<DailyStats[]> {
  const supabase = await createServiceClient();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const dateStr = startDate.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("usage_tracking")
    .select("date, message_count, token_count, cost_usd, user_id")
    .gte("date", dateStr)
    .order("date", { ascending: true });

  if (error || !data) return [];

  const byDate: Record<string, DailyStats> = {};
  for (const row of data) {
    if (!byDate[row.date]) {
      byDate[row.date] = {
        date: row.date,
        message_count: 0,
        token_count: 0,
        cost_usd: 0,
        unique_users: 0,
      };
    }
    byDate[row.date].message_count += row.message_count ?? 0;
    byDate[row.date].token_count += row.token_count ?? 0;
    byDate[row.date].cost_usd += row.cost_usd ?? 0;
    byDate[row.date].unique_users += 1;
  }

  return Object.values(byDate);
}

export async function getRecentChats(limit = 50): Promise<Chat[]> {
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("chats")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data ?? []) as Chat[];
}

export async function getRecentMessages(limit = 100): Promise<Message[]> {
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data ?? []) as Message[];
}
