import Link from "next/link";
import { Zap } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden noise">
      {/* Animated mesh bg */}
      <div className="absolute inset-0 mesh-auth" />

      {/* Grid overlay */}
      <div className="absolute inset-0 grid-pattern opacity-25 [mask-image:radial-gradient(ellipse_70%_80%_at_50%_30%,black_20%,transparent_100%)]" />

      {/* Top glow orb */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-primary/8 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[150px] bg-primary/12 rounded-full blur-[50px] pointer-events-none" />

      {/* Side orbs */}
      <div className="absolute bottom-1/4 -left-32 w-[400px] h-[400px] bg-primary/4 rounded-full blur-[100px] pointer-events-none animate-orb" />
      <div className="absolute top-1/4 -right-32 w-[350px] h-[350px] bg-sky-500/3 rounded-full blur-[100px] pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 border-b border-border/30 bg-background/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-7 h-7">
              <div className="absolute inset-0 rounded-lg bg-primary opacity-50 animate-glow-pulse" />
              <div className="relative w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <span className="font-display text-sm font-bold tracking-widest uppercase">
              RECOIL AI
            </span>
          </Link>
        </div>
      </nav>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md animate-fade-in-up">
          {children}
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 border-t border-border/30 py-4 px-6 bg-background/30 backdrop-blur-md">
        <p className="text-center text-[11px] text-muted-foreground/60">
          © 2025 RECOIL AI · Roblox Development Intelligence Platform
        </p>
      </div>
    </div>
  );
}
