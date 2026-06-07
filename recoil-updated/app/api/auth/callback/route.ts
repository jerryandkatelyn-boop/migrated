import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";

  const origin = requestUrl.origin;

  if (error) {
    console.error("[auth/callback] Error:", error, errorDescription);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorDescription || error)}`
    );
  }

  if (code) {
    const supabase = await createClient();

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error("[auth/callback] Code exchange error:", exchangeError);
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(exchangeError.message)}`
      );
    }

    // Ensure the user has a profile row
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // Upsert user profile (trigger should have created it, but just in case)
      await supabase.from("users").upsert(
        {
          id: user.id,
          email: user.email ?? "",
          name: user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? null,
          avatar: user.user_metadata?.avatar_url ?? null,
          last_sign_in_at: new Date().toISOString(),
        },
        {
          onConflict: "id",
          ignoreDuplicates: false,
        }
      );
    }

    return NextResponse.redirect(`${origin}${next}`);
  }

  // If no code and no error, redirect to login
  return NextResponse.redirect(`${origin}/login`);
}
