import Link from "next/link";
import {
  Zap,
  Code,
  Bug,
  BookOpen,
  Rocket,
  Shield,
  Terminal,
  ArrowRight,
  ChevronRight,
  Star,
  GitBranch,
  Layers,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ─── Navigation ─────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-sm tracking-tight">RECOIL AI</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/signup">
                Get started free
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* ─── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6">
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Gradient orb */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] opacity-10 pointer-events-none bg-primary rounded-full blur-[120px]" />

        <div className="relative max-w-4xl mx-auto text-center">
          <Badge variant="secondary" className="mb-6 text-xs px-3 py-1">
            <Star className="h-3 w-3 mr-1.5 text-yellow-500" />
            Powered by OpenRouter · OpenAI · Anthropic · Google · DeepSeek
          </Badge>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
            The AI co-pilot built for{" "}
            <span className="relative">
              <span className="relative z-10 text-primary">
                Roblox developers
              </span>
              <span className="absolute -inset-1 bg-primary/10 rounded-lg -z-0" />
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            Generate Luau scripts, debug complex systems, learn best practices,
            and ship better Roblox games — faster than ever with RECOIL AI.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" asChild className="text-sm h-11">
              <Link href="/signup">
                <Zap className="mr-2 h-4 w-4" />
                Start building for free
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="text-sm h-11">
              <Link href="/login">
                Sign in to your account
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            Free tier: 20 messages per day · No credit card required
          </p>
        </div>
      </section>

      {/* ─── Features Grid ───────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              Everything a Roblox developer needs
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              RECOIL AI understands Roblox, Luau, client-server architecture,
              and every Roblox API — out of the box.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: Code,
                title: "Luau Code Generation",
                description:
                  "Generate complete, production-ready Luau scripts with proper typing, module structure, and Roblox best practices.",
              },
              {
                icon: Bug,
                title: "Intelligent Debugging",
                description:
                  "Paste your broken code and get root-cause analysis with fixed code and preventive recommendations.",
              },
              {
                icon: BookOpen,
                title: "Concept Explanations",
                description:
                  "Learn RemoteEvents, DataStores, raycasting, pathfinding, and more with clear explanations and examples.",
              },
              {
                icon: Rocket,
                title: "System Architecture",
                description:
                  "Design full game systems — currency, combat, inventory, progression — with proper client-server patterns.",
              },
              {
                icon: Shield,
                title: "Security Audits",
                description:
                  "Identify exploits, anti-cheat weaknesses, and insecure remote handling in your scripts.",
              },
              {
                icon: GitBranch,
                title: "Code Reviews",
                description:
                  "Get actionable feedback on code quality, performance, memory usage, and architectural concerns.",
              },
              {
                icon: Layers,
                title: "Multi-Model Access",
                description:
                  "Switch between GPT-4o, Claude, Gemini, and DeepSeek — all in one interface with per-model context.",
              },
              {
                icon: Bot,
                title: "Multiple Personas",
                description:
                  "Choose a Beginner, Advanced, Code Review, or Optimization mode to get perfectly calibrated help.",
              },
              {
                icon: Terminal,
                title: "Persistent Chat History",
                description:
                  "All conversations are saved. Revisit, continue, rename, and organize your AI sessions.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-5 rounded-xl border border-border bg-card hover:bg-muted/30 hover:border-primary/20 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-sm mb-2">{feature.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 bg-muted/20 border-y border-border">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              How RECOIL AI works
            </h2>
            <p className="text-muted-foreground">
              From question to working code in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Describe your problem",
                description:
                  'Tell RECOIL AI what you\'re trying to build, fix, or learn. Be as specific or as vague as you like — "make a health bar" or "optimize my pathfinding for 200 NPCs".',
              },
              {
                step: "02",
                title: "Get expert Luau code",
                description:
                  "RECOIL AI generates complete, commented, production-ready Luau scripts with proper Roblox API usage, client-server architecture, and type annotations.",
              },
              {
                step: "03",
                title: "Ship your game faster",
                description:
                  "Iterate with follow-up questions, ask for optimizations, request alternative approaches, or explore entirely new systems — all in one persistent chat.",
              },
            ].map((step, i) => (
              <div key={i} className="relative">
                <div className="text-4xl font-bold text-muted-foreground/20 mb-4 font-mono">
                  {step.step}
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
                {i < 2 && (
                  <div className="hidden sm:block absolute top-8 right-0 translate-x-1/2 text-muted-foreground/30">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing / CTA ───────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
            Start for free. No card required.
          </h2>
          <p className="text-muted-foreground mb-8">
            Get 20 AI messages per day on the free tier. Perfect for learning,
            debugging, and prototyping your Roblox projects.
          </p>

          <div className="inline-flex flex-col sm:flex-row gap-3">
            <Button size="lg" asChild className="text-sm h-11">
              <Link href="/signup">
                <Zap className="mr-2 h-4 w-4" />
                Create free account
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="text-sm h-11">
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xs tracking-tight">RECOIL AI</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Built for Roblox developers · Powered by multiple AI providers
          </p>
        </div>
      </footer>
    </div>
  );
}
