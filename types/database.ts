// ─── Core Database Types ───────────────────────────────────────────────────────
// These replace the Drizzle ORM schema types.
// All IDs are UUIDs (strings) — Supabase PostgreSQL convention.

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: "user" | "admin";
  roblox_username: string | null;
  roblox_user_id: string | null;
  experience_level: "beginner" | "intermediate" | "advanced" | "expert" | null;
  preferred_topics: string | null;
  created_at: string;
  updated_at: string;
  last_sign_in_at: string | null;
}

export interface Chat {
  id: string;
  user_id: string;
  title: string;
  model: string;
  is_pinned: boolean;
  is_archived: boolean;
  metadata: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  chat_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  model: string | null;
  tokens_used: number | null;
  latency_ms: number | null;
  cost_usd: number | null;
  provider: string | null;
  metadata: string | null;
  created_at: string;
}

export interface UsageTracking {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  message_count: number;
  token_count: number;
  cost_usd: number;
  model: string | null;
  provider: string | null;
  created_at: string;
  updated_at: string;
}

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string | null;
  enabled: boolean;
  allowed_roles: string;
  metadata: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminSetting {
  id: string;
  key: string;
  value: string;
  category: string;
  description: string | null;
  updated_at: string;
}

export interface SystemPrompt {
  id: string;
  name: string;
  slug: string;
  prompt: string;
  description: string | null;
  is_active: boolean;
  is_default: boolean;
  metadata: string | null;
  created_at: string;
  updated_at: string;
}

export interface AiProvider {
  id: string;
  name: string;
  slug: string;
  api_key: string | null;
  base_url: string | null;
  default_model: string;
  models: string | null; // JSON array
  is_active: boolean;
  is_default: boolean;
  cost_per_1k_input: string;
  cost_per_1k_output: string;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  source: string | null;
  category: string | null;
  metadata: string | null;
  embedding: number[] | null; // vector(1536)
  created_at: string;
  updated_at: string;
}

// ─── Insert Types (omit auto-generated fields) ────────────────────────────────

export type InsertUser = Omit<User, "id" | "created_at" | "updated_at">;
export type InsertChat = Omit<Chat, "id" | "created_at" | "updated_at">;
export type InsertMessage = Omit<Message, "id" | "created_at">;
export type InsertDocument = Omit<Document, "id" | "created_at" | "updated_at">;

// ─── Chat Message (for AI SDK) ────────────────────────────────────────────────

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

// ─── Admin Analytics ──────────────────────────────────────────────────────────

export interface AdminStats {
  total_users: number;
  total_chats: number;
  total_messages: number;
  daily_active_users: number;
  messages_today: number;
  total_tokens: number;
  total_cost_usd: number;
  cost_today: number;
}

export interface ProviderStats {
  provider: string;
  message_count: number;
  token_count: number;
  cost_usd: number;
}

export interface DailyStats {
  date: string;
  message_count: number;
  token_count: number;
  cost_usd: number;
  unique_users: number;
}
