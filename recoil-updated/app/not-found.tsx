import Link from "next/link";
import { Zap } from "lucide-react";

// Prevent static prerendering — this page's layout includes client-only
// providers (next-themes) that React 19 enforces as client-only references.
export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="text-center space-y-6 px-4">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold tracking-tight">RECOIL AI</span>
        </div>
        <div>
          <h1 className="text-6xl font-bold text-muted-foreground/30 mb-2">404</h1>
          <h2 className="text-xl font-semibold mb-2">Page not found</h2>
          <p className="text-sm text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
