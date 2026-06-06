-- ============================================================
-- RECOIL AI — Row Level Security (RLS) Policies
-- Migration: 003_rls_policies.sql
-- ============================================================

-- ── Enable RLS on All Tables ──────────────────────────────────────────────────

ALTER TABLE public.users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_providers   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents      ENABLE ROW LEVEL SECURITY;

-- ── Helper: is_admin() ────────────────────────────────────────────────────────
-- Returns TRUE if the authenticated user has the admin role.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- ── Users Policies ────────────────────────────────────────────────────────────

-- Users can read their own profile
CREATE POLICY "users_select_own"
  ON public.users FOR SELECT
  USING (id = auth.uid());

-- Users can update their own profile (but NOT role)
CREATE POLICY "users_update_own"
  ON public.users FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    -- Prevent self-promotion to admin
    AND role = (SELECT role FROM public.users WHERE id = auth.uid())
  );

-- Admins can read all user profiles
CREATE POLICY "admin_users_select_all"
  ON public.users FOR SELECT
  USING (is_admin());

-- Admins can update any user (including role)
CREATE POLICY "admin_users_update_all"
  ON public.users FOR UPDATE
  USING (is_admin());

-- Trigger-based inserts allowed (SECURITY DEFINER function)
CREATE POLICY "users_insert_via_trigger"
  ON public.users FOR INSERT
  WITH CHECK (id = auth.uid());

-- ── Chats Policies ────────────────────────────────────────────────────────────

-- Users can only see their own chats
CREATE POLICY "chats_select_own"
  ON public.chats FOR SELECT
  USING (user_id = auth.uid());

-- Users can create chats for themselves only
CREATE POLICY "chats_insert_own"
  ON public.chats FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own chats
CREATE POLICY "chats_update_own"
  ON public.chats FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own chats
CREATE POLICY "chats_delete_own"
  ON public.chats FOR DELETE
  USING (user_id = auth.uid());

-- Admins can see all chats (for analytics)
CREATE POLICY "admin_chats_select_all"
  ON public.chats FOR SELECT
  USING (is_admin());

-- ── Messages Policies ─────────────────────────────────────────────────────────

-- Users can see messages in their own chats
CREATE POLICY "messages_select_own_chats"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chats
      WHERE id = messages.chat_id AND user_id = auth.uid()
    )
  );

-- Users can insert messages into their own chats
CREATE POLICY "messages_insert_own_chats"
  ON public.messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chats
      WHERE id = messages.chat_id AND user_id = auth.uid()
    )
  );

-- Users cannot update or delete messages (immutable history)
-- (No UPDATE or DELETE policies — effectively blocked)

-- Admins can see all messages
CREATE POLICY "admin_messages_select_all"
  ON public.messages FOR SELECT
  USING (is_admin());

-- ── Usage Tracking Policies ───────────────────────────────────────────────────

-- Users can see their own usage
CREATE POLICY "usage_select_own"
  ON public.usage_tracking FOR SELECT
  USING (user_id = auth.uid());

-- Users can insert/update their own usage
CREATE POLICY "usage_insert_own"
  ON public.usage_tracking FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "usage_update_own"
  ON public.usage_tracking FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admins can see all usage
CREATE POLICY "admin_usage_select_all"
  ON public.usage_tracking FOR SELECT
  USING (is_admin());

-- ── Feature Flags Policies ────────────────────────────────────────────────────

-- All authenticated users can read feature flags (to check if feature is enabled)
CREATE POLICY "feature_flags_select_authenticated"
  ON public.feature_flags FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only admins can modify feature flags
CREATE POLICY "admin_feature_flags_all"
  ON public.feature_flags FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ── Admin Settings Policies ───────────────────────────────────────────────────

-- Only admins can read/write admin settings
CREATE POLICY "admin_settings_all"
  ON public.admin_settings FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ── System Prompts Policies ───────────────────────────────────────────────────

-- All authenticated users can read active prompts
CREATE POLICY "system_prompts_select_active"
  ON public.system_prompts FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_active = TRUE);

-- Admins can manage all system prompts
CREATE POLICY "admin_system_prompts_all"
  ON public.system_prompts FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ── AI Providers Policies ─────────────────────────────────────────────────────

-- All authenticated users can read active providers
CREATE POLICY "ai_providers_select_active"
  ON public.ai_providers FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_active = TRUE);

-- Only admins can manage providers
CREATE POLICY "admin_ai_providers_all"
  ON public.ai_providers FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ── Audit Log Policies ────────────────────────────────────────────────────────

-- Users can see their own audit log entries
CREATE POLICY "audit_select_own"
  ON public.audit_logs FOR SELECT
  USING (user_id = auth.uid());

-- System can insert audit entries (via service role)
-- No direct user insert policy — inserts done via service client only

-- Admins can see all audit logs
CREATE POLICY "admin_audit_select_all"
  ON public.audit_logs FOR SELECT
  USING (is_admin());

-- ── Documents Policies ────────────────────────────────────────────────────────

-- All authenticated users can read documents (for RAG context)
CREATE POLICY "documents_select_authenticated"
  ON public.documents FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only admins can create/update/delete documents
CREATE POLICY "admin_documents_all"
  ON public.documents FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ── Service Role Bypass ───────────────────────────────────────────────────────
-- The service role (used in server-side code) bypasses ALL RLS policies.
-- This is Supabase's built-in behavior — no additional setup needed.
-- NEVER expose the service role key to the browser/client.
