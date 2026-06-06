-- ============================================================
-- RECOIL AI — Supabase Initial Schema
-- Migration: 001_initial_schema.sql
-- Run via: Supabase Dashboard > SQL Editor, or supabase db push
-- ============================================================

-- ── Extensions ────────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for fuzzy text search

-- ── Users ─────────────────────────────────────────────────────────────────────
-- Extends Supabase auth.users with custom profile fields.
-- Populated automatically via trigger on auth.users insert.

CREATE TABLE IF NOT EXISTS public.users (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT NOT NULL,
  name            TEXT,
  avatar          TEXT,
  role            TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  roblox_username TEXT,
  roblox_user_id  TEXT,
  experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  preferred_topics TEXT,
  last_sign_in_at  TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    email  = EXCLUDED.email,
    name   = COALESCE(EXCLUDED.name, public.users.name),
    avatar = COALESCE(EXCLUDED.avatar, public.users.avatar),
    updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-promote first admin by email
CREATE OR REPLACE FUNCTION public.promote_admin_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  admin_email TEXT;
BEGIN
  SELECT current_setting('app.admin_email', true) INTO admin_email;
  IF admin_email IS NOT NULL AND NEW.email = admin_email THEN
    UPDATE public.users SET role = 'admin' WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

-- ── Chats ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.chats (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL DEFAULT 'New Chat',
  model       TEXT NOT NULL DEFAULT 'openai/gpt-4o-mini',
  is_pinned   BOOLEAN NOT NULL DEFAULT FALSE,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  metadata    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chats_user_id    ON public.chats(user_id);
CREATE INDEX IF NOT EXISTS idx_chats_updated_at ON public.chats(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chats_archived   ON public.chats(user_id, is_archived);

-- ── Messages ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id     UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  role        TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content     TEXT NOT NULL,
  model       TEXT,
  tokens_used INTEGER,
  latency_ms  INTEGER,
  cost_usd    NUMERIC(12, 8),
  provider    TEXT,
  metadata    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_chat_id   ON public.messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_created   ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_provider  ON public.messages(provider);

-- ── Usage Tracking ────────────────────────────────────────────────────────────
-- One row per user per day. Upserted on each message.

CREATE TABLE IF NOT EXISTS public.usage_tracking (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date          DATE NOT NULL,
  message_count INTEGER NOT NULL DEFAULT 0,
  token_count   INTEGER NOT NULL DEFAULT 0,
  cost_usd      NUMERIC(12, 8) NOT NULL DEFAULT 0,
  model         TEXT,
  provider      TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_usage_user_date ON public.usage_tracking(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_usage_date      ON public.usage_tracking(date DESC);

-- ── Feature Flags ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.feature_flags (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key           TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  description   TEXT,
  enabled       BOOLEAN NOT NULL DEFAULT FALSE,
  allowed_roles TEXT NOT NULL DEFAULT 'user,admin',
  metadata      TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default feature flags
INSERT INTO public.feature_flags (key, name, description, enabled) VALUES
  ('rag_search',          'RAG Document Search',    'Enable vector search over knowledge base',   FALSE),
  ('file_attachments',    'File Attachments',        'Allow users to upload files in chat',         FALSE),
  ('roblox_asset_lookup', 'Roblox Asset Lookup',    'Allow AI to look up Roblox assets by ID',    FALSE),
  ('code_execution',      'Code Execution (Sandbox)','Run Luau code in a sandboxed environment',   FALSE),
  ('advanced_models',     'Advanced Models',         'Allow access to GPT-4o, Claude Opus, etc.',  TRUE)
ON CONFLICT (key) DO NOTHING;

-- ── Admin Settings ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.admin_settings (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key         TEXT UNIQUE NOT NULL,
  value       TEXT NOT NULL,
  category    TEXT NOT NULL DEFAULT 'general',
  description TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.admin_settings (key, value, category, description) VALUES
  ('daily_message_limit', '20',    'limits',  'Free tier daily message limit per user'),
  ('max_output_tokens',   '4096',  'ai',      'Maximum tokens in AI response'),
  ('default_temperature', '0.7',   'ai',      'Default AI temperature (0.0 - 2.0)'),
  ('default_provider',    'openrouter', 'ai', 'Default AI provider slug'),
  ('default_model',       'openai/gpt-4o-mini', 'ai', 'Default AI model string'),
  ('maintenance_mode',    'false', 'general', 'Put app in read-only maintenance mode')
ON CONFLICT (key) DO NOTHING;

-- ── System Prompts ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.system_prompts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  prompt      TEXT NOT NULL,
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  is_default  BOOLEAN NOT NULL DEFAULT FALSE,
  metadata    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Default Roblox system prompt
INSERT INTO public.system_prompts (name, slug, description, is_active, is_default, prompt) VALUES
  (
    'RECOIL AI — Roblox Expert',
    'recoil-roblox-expert',
    'Expert Roblox Luau developer persona',
    TRUE,
    TRUE,
    'You are RECOIL AI, an expert Roblox game development assistant specializing in Luau scripting, Roblox Studio, and game design. You have deep knowledge of all Roblox APIs, services, best practices, and the Roblox developer ecosystem.

Your expertise includes:
- Luau scripting (typed and untyped)
- Client-server architecture (LocalScripts, Scripts, ModuleScripts)
- Roblox services: DataStoreService, Players, ReplicatedStorage, RunService, TweenService, etc.
- RemoteEvents and RemoteFunctions for client-server communication
- GUI and UI development
- Physics, animations, and character control
- Security best practices and anti-exploit techniques
- Performance optimization
- Game systems: currencies, inventories, combat, progression

Always write clean, typed, well-commented Luau code. Follow modern Roblox best practices. When debugging, provide root-cause analysis. When building systems, consider both client and server architecture.'
  )
ON CONFLICT (slug) DO NOTHING;

-- ── AI Providers ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.ai_providers (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                TEXT NOT NULL,
  slug                TEXT UNIQUE NOT NULL,
  base_url            TEXT,
  default_model       TEXT NOT NULL,
  models              TEXT, -- JSON array of model strings
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  is_default          BOOLEAN NOT NULL DEFAULT FALSE,
  cost_per_1k_input   NUMERIC(10, 8) NOT NULL DEFAULT 0,
  cost_per_1k_output  NUMERIC(10, 8) NOT NULL DEFAULT 0,
  priority            INTEGER NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.ai_providers (name, slug, base_url, default_model, models, is_active, is_default, cost_per_1k_input, cost_per_1k_output, priority) VALUES
  ('OpenRouter',  'openrouter', 'https://openrouter.ai/api/v1', 'openai/gpt-4o-mini',
   '["openai/gpt-4o","openai/gpt-4o-mini","anthropic/claude-sonnet-4","anthropic/claude-opus-4","google/gemini-2.5-flash","deepseek/deepseek-chat"]',
   TRUE, TRUE, 0.00015, 0.0006, 100),
  ('OpenAI',      'openai',     NULL, 'gpt-4o-mini',
   '["gpt-4o","gpt-4o-mini","gpt-4-turbo","o1-mini"]',
   TRUE, FALSE, 0.00015, 0.0006, 80),
  ('Anthropic',   'anthropic',  NULL, 'claude-sonnet-4-20250514',
   '["claude-opus-4-20250514","claude-sonnet-4-20250514","claude-haiku-4-20250514"]',
   TRUE, FALSE, 0.003, 0.015, 70),
  ('Google',      'google',     NULL, 'gemini-2.5-flash',
   '["gemini-2.5-pro","gemini-2.5-flash","gemini-2.0-flash"]',
   TRUE, FALSE, 0.00015, 0.0006, 60),
  ('DeepSeek',    'deepseek',   NULL, 'deepseek-chat',
   '["deepseek-chat","deepseek-reasoner"]',
   TRUE, FALSE, 0.00014, 0.00028, 50)
ON CONFLICT (slug) DO NOTHING;

-- ── Audit Log ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  entity_type TEXT,
  entity_id   TEXT,
  details     TEXT,
  ip_address  TEXT,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_user_id   ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created   ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_action    ON public.audit_logs(action);

-- ── Updated-At Trigger ────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_users_updated_at         BEFORE UPDATE ON public.users         FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_chats_updated_at         BEFORE UPDATE ON public.chats         FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_usage_updated_at         BEFORE UPDATE ON public.usage_tracking FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_feature_flags_updated_at BEFORE UPDATE ON public.feature_flags  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_admin_settings_updated_at BEFORE UPDATE ON public.admin_settings FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_system_prompts_updated_at BEFORE UPDATE ON public.system_prompts FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_ai_providers_updated_at  BEFORE UPDATE ON public.ai_providers   FOR EACH ROW EXECUTE FUNCTION set_updated_at();
