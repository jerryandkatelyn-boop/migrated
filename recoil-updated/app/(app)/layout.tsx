// Prevent static prerendering for all (app) routes.
// These pages depend on Supabase auth at runtime; prerendering them at
// build time would fail because env vars / cookies aren't available then.
export const dynamic = "force-dynamic";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
