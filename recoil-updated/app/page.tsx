import DashboardClient from "@/components/dashboard/DashboardClient";

// No landing page — the AI chat IS the home page (ChatGPT-style)
export const dynamic = "force-dynamic";

export default function Home() {
  return <DashboardClient />;
}
