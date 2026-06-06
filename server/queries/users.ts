import "server-only";
import type { User } from "@/types/database";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function findUserById(id: string): Promise<User | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as User;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (error || !data) return null;
  return data as User;
}

export async function updateUserProfile(
  userId: string,
  data: Partial<Pick<User, "name" | "avatar" | "roblox_username" | "roblox_user_id" | "experience_level" | "preferred_topics">>
): Promise<User | null> {
  const supabase = await createClient();
  const { data: updated, error } = await supabase
    .from("users")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select()
    .single();

  if (error || !updated) return null;
  return updated as User;
}

export async function updateUserLastSignIn(userId: string): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("users")
    .update({ last_sign_in_at: new Date().toISOString() })
    .eq("id", userId);
}

// Admin operations — use service role to bypass RLS

export async function getAllUsers(limit = 100): Promise<User[]> {
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data as User[];
}

export async function updateUserRole(
  userId: string,
  role: "user" | "admin"
): Promise<void> {
  const supabase = await createServiceClient();
  await supabase
    .from("users")
    .update({ role, updated_at: new Date().toISOString() })
    .eq("id", userId);
}

export async function getUserCount(): Promise<number> {
  const supabase = await createServiceClient();
  const { count } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true });
  return count ?? 0;
}
