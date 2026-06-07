import Link from "next/link";
import {
  Zap, Code, Bug, BookOpen, Rocket, Shield,
  Terminal, ArrowRight, Star, GitBranch, Layers,
  Bot, ChevronRight, Check, Cpu, Globe, Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* ─── Data ──────────────────────────────────────────────────────────── */

const features = [
  {
    icon: Code,
    label: "Luau Code Generation",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    description:
      "Generate complete, production-ready Luau scripts with proper typing, module structure, and Roblox best practices.",
  },
  {
    icon: Bug,
    label: "Intelligent Debugging",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    description:
      "Paste your broken code and get root-cause analysis with fixed code and targeted recommendations.",
  },
  {
    icon: BookOpen,
    label: "Concept Explanations",
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/20",
    description:
      "Learn RemoteEvents, DataStores, raycasting, and pathfinding with clear explanations and real examples.",
  },
  {
    icon: Rocket,
    label: "System Architecture",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    description:
      "Design full game systems — currency, combat, inventory, progression — with proper client-server patterns.",
  },
  {
    icon: Shield,
    label: "Security Audits",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    description:
      "Identify exploits, anti-cheat weaknesses, and insecure remote handling in your scripts.",
  },
  {
    icon: GitBranch,
    label: "Code Reviews",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    description:
      "Get actionable feedback on code quality, performance, memory usage, and architectural concerns.",
  },
  {
    icon: Layers,
    label: "Multi-Model Access",
    color: "text-pink-400",
    bg: "bg-pink-500/10",
    border: "border-pink-500/20",
    description:
      "Switch between GPT-4o, Claude, Gemini, and DeepSeek — all in one interface with per-model context.",
  },
  {
    icon: Bot,
    label: "Multiple Personas",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    description:
      "Choose Beginner, Advanced, Code Review, or Optimization mode to get perfectly calibrated help.",
  },
  {
    icon: Terminal,
    label: "Persistent History",
    color: "text-lime-400",
    bg: "bg-lime-500/10",
    border: "border-lime-500/20",
    description:
      "All conversations saved. Revisit, continue, rename, and organize your AI sessions effortlessly.",
  },
];

const steps = [
  {
    num: "01",
    title: "Describe your problem",
    body: "Tell RECOIL AI what you're trying to build, fix, or learn. Be as specific or as vague as you like — it understands Roblox context natively.",
  },
  {
    num: "02",
    title: "Get expert Luau code",
    body: "RECOIL AI generates complete, commented, production-ready Luau with proper API usage, client-server architecture, and type annotations.",
  },
  {
    num: "03",
    title: "Ship faster",
    body: "Iterate with follow-up questions, ask for optimizations, request alternative approaches — all in one persistent, searchable chat.",
  },
];

const providers = [
  { name: "OpenAI", tag: "GPT-4o" },
  { name: "Anthropic", tag: "Claude" },
  { name: "Google", tag: "Gemini" },
  { name: "DeepSeek", tag: "DeepSeek" },
  { name: "OpenRouter", tag: "Gateway" },
];

const luauCode = `-- RECOIL AI · Health System with DataStore
local Players    = game:GetService("Players")
local DataStore  = game:GetService("DataStoreService")
local RunService = game:GetService("RunService")

local HealthStore = DataStore:GetDataStore("PlayerHealth_v2")
local REGEN_RATE  = 2    -- HP per second
local REGEN_DELAY = 5    -- seconds post-damage

local function applyRegen(humanoid: Humanoid, lastDmgTime: number)
    RunService.Heartbeat:Connect(function(dt)
        if tick() - lastDmgTime < REGEN_DELAY then return end
        if humanoid.Health < humanoid.MaxHealth then
            humanoid.Health = math.min(
                humanoid.Health + REGEN_RATE * dt,
                humanoid.MaxHealth
            )
        end
    end)
end

Players.PlayerAdded:Connect(function(player)
    player.CharacterAdded:Connect(function(char)
        local hum = char:WaitForChild("Humanoid")
        local lastDmg = 0

        hum.HealthChanged:Connect(function(hp)
            if hp < hum.MaxHealth then lastDmg = tick() end
        end)

        applyRegen(hum, lastDmg)
    end)
end)`;

/* ─── Component ─────────────────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* ── NAV ───────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-border/40 bg-background/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 rounded-lg bg-primary animate-glow-pulse opacity-60" />
              <div className="relative w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <span className="font-display text-sm font-bold tracking-widest uppercase text-foreground">
              RECOIL AI
            </span>
          </Link>

          {/* Nav links + CTAs */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground text-sm">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button size="sm" asChild className="text-sm h-9 px-5 bg-primary hover:bg-primary/90 text-white shine-btn glow-orange">
              <Link href="/signup">
                Get started free
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-16 pb-24 px-4 overflow-hidden noise">
        {/* Mesh background */}
        <div className="absolute inset-0 mesh-hero" />

        {/* Grid overlay */}
        <div className="absolute inset-0 grid-pattern opacity-30 [mask-image:radial-gradient(ellipse_80%_70%_at_50%_50%,black_30%,transparent_100%)]" />

        {/* Orange glow orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] w-[900px] h-[500px] bg-primary/6 rounded-full blur-[120px] pointer-events-none animate-orb" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] w-[400px] h-[200px] bg-primary/10 rounded-full blur-[60px] pointer-events-none" />

        <div className="relative z-10 text-center max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/8 mb-8 animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-primary animate-pulse-ring opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            <span className="text-xs font-medium text-primary font-display tracking-wide">
              Powered by Claude · GPT-4o · Gemini · DeepSeek
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-[5.25rem] font-bold leading-[0.92] tracking-tight mb-6 animate-fade-in-up delay-100">
            <span className="text-gradient-white">The AI built for</span>
            <br />
            <span className="text-gradient-orange">Roblox developers</span>
          </h1>

          {/* Sub */}
          <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up delay-200">
            Generate Luau scripts, debug complex systems, learn best practices,
            and ship better Roblox games — faster than ever.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-14 animate-fade-in-up delay-300">
            <Button size="lg" asChild className="h-12 px-8 text-sm font-semibold bg-primary hover:bg-primary/90 text-white shine-btn glow-orange">
              <Link href="/signup">
                <Zap className="mr-2 h-4 w-4" />
                Start building free
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="h-12 px-8 text-sm border-border/60 hover:border-primary/40 hover:bg-primary/5">
              <Link href="/login">
                Sign in to account
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap justify-center gap-8 text-sm animate-fade-in-up delay-400">
            {[
              { val: "Free", label: "to start" },
              { val: "20", label: "messages/day" },
              { val: "5+", label: "AI providers" },
              { val: "0", label: "credit card needed" },
            ].map((s, i) => (
              <div key={i} className="flex items-baseline gap-1.5">
                <span className="font-display text-xl font-bold text-gradient-orange">{s.val}</span>
                <span className="text-muted-foreground text-xs">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Floating terminal */}
        <div className="relative z-10 mt-20 w-full max-w-3xl mx-auto animate-float">
          <div className="glass-orange rounded-2xl overflow-hidden shadow-card-dark">
            {/* Terminal header */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border/50 bg-card/60">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-amber-500/70" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
              </div>
              <div className="flex-1 flex justify-center">
                <span className="font-mono text-[11px] text-muted-foreground/70">
                  recoil-ai — health-system.lua
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-primary/10 border border-primary/20">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="text-[10px] font-medium text-primary font-display">RECOIL AI</span>
              </div>
            </div>
            {/* Code */}
            <div className="p-5 overflow-x-auto scrollbar-hide">
              <pre className="font-mono text-[12.5px] leading-relaxed text-foreground/85 whitespace-pre">
                <span className="text-muted-foreground/50">{"-- RECOIL AI · Health System with DataStore\n"}</span>
                <span className="text-sky-400">{"local "}</span>
                <span className="text-foreground">{"Players    = game:GetService("}</span>
                <span className="text-orange-400">{'"Players"'}</span>
                <span className="text-foreground">{")\n"}</span>
                <span className="text-sky-400">{"local "}</span>
                <span className="text-foreground">{"DataStore  = game:GetService("}</span>
                <span className="text-orange-400">{'"DataStoreService"'}</span>
                <span className="text-foreground">{")\n"}</span>
                <span className="text-sky-400">{"local "}</span>
                <span className="text-foreground">{"RunService = game:GetService("}</span>
                <span className="text-orange-400">{'"RunService"'}</span>
                <span className="text-foreground">{")\n\n"}</span>
                <span className="text-sky-400">{"local "}</span>
                <span className="text-foreground">{"REGEN_RATE  = "}</span>
                <span className="text-emerald-400">{"2"}</span>
                <span className="text-muted-foreground/60">{"    -- HP per second\n"}</span>
                <span className="text-sky-400">{"local "}</span>
                <span className="text-foreground">{"REGEN_DELAY = "}</span>
                <span className="text-emerald-400">{"5"}</span>
                <span className="text-muted-foreground/60">{"    -- seconds post-damage\n\n"}</span>
                <span className="text-violet-400">{"local function "}</span>
                <span className="text-amber-300">{"applyRegen"}</span>
                <span className="text-foreground">{"(humanoid, lastDmgTime)\n"}</span>
                <span className="text-foreground">{"    RunService.Heartbeat:Connect("}</span>
                <span className="text-violet-400">{"function"}</span>
                <span className="text-foreground">{"(dt)\n"}</span>
                <span className="text-muted-foreground/60">{"        -- regen after delay...\n"}</span>
                <span className="text-foreground">{"    end)\n"}</span>
                <span className="text-violet-400">{"end"}</span>
                <span className="text-foreground animate-blink">{"█"}</span>
              </pre>
            </div>
          </div>
          {/* Glow beneath terminal */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-3/4 h-12 bg-primary/15 blur-2xl rounded-full" />
        </div>
      </section>

      {/* ── PROVIDERS STRIP ───────────────────────────────────────────── */}
      <section className="border-y border-border/50 bg-card/30 py-5 overflow-hidden">
        <p className="text-center text-[11px] font-display font-semibold uppercase tracking-widest text-muted-foreground/60 mb-4">
          Powered by the world's best AI
        </p>
        <div className="flex overflow-hidden">
          <div className="flex gap-6 animate-marquee whitespace-nowrap">
            {[...providers, ...providers, ...providers, ...providers].map((p, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-5 py-2 rounded-full border border-border/60 bg-card/50 shrink-0"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="text-xs font-medium text-foreground/80">{p.name}</span>
                <span className="text-[10px] text-muted-foreground font-mono">{p.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────── */}
      <section className="py-28 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block text-[11px] font-display font-semibold uppercase tracking-widest text-primary mb-3">
              Capabilities
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              <span className="text-gradient-white">Everything a Roblox</span>
              <br />
              <span className="text-gradient-orange">developer needs</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-sm sm:text-base">
              RECOIL AI understands Roblox, Luau, client-server architecture, and every Roblox API — out of the box.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div
                key={i}
                className="feature-card group"
              >
                <div className={`w-10 h-10 rounded-xl ${f.bg} border ${f.border} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}>
                  <f.icon className={`h-5 w-5 ${f.color}`} />
                </div>
                <h3 className="font-display text-sm font-semibold mb-2">{f.label}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────── */}
      <section className="py-28 px-4 sm:px-6 relative overflow-hidden">
        {/* BG */}
        <div className="absolute inset-0 bg-card/20 border-y border-border/40" />
        <div className="absolute inset-0 grid-pattern-sm opacity-20 [mask-image:radial-gradient(ellipse_70%_100%_at_50%_50%,black,transparent)]" />

        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block text-[11px] font-display font-semibold uppercase tracking-widest text-primary mb-3">
              Workflow
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-3">
              <span className="text-gradient-white">From question to working code</span>
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">In seconds, not hours.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 relative">
            {/* connector line */}
            <div className="hidden sm:block absolute top-8 left-[calc(16.66%+1rem)] right-[calc(16.66%+1rem)] h-px">
              <div className="h-full bg-gradient-to-r from-primary/40 via-primary/20 to-primary/40" />
            </div>

            {steps.map((step, i) => (
              <div key={i} className="relative flex flex-col items-center sm:items-start text-center sm:text-left">
                {/* Step number circle */}
                <div className="relative mb-6 shrink-0">
                  <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center">
                    <span className="font-display text-2xl font-bold text-gradient-orange">{step.num}</span>
                  </div>
                  {i < 2 && (
                    <ArrowRight className="hidden sm:block absolute -right-12 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40" />
                  )}
                </div>
                <h3 className="font-display text-base font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CODE SHOWCASE ─────────────────────────────────────────────── */}
      <section className="py-28 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: copy */}
          <div>
            <span className="inline-block text-[11px] font-display font-semibold uppercase tracking-widest text-primary mb-3">
              Luau-native
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-5">
              <span className="text-gradient-white">Writes the code.</span>
              <br />
              <span className="text-gradient-orange">You ship the game.</span>
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed text-sm sm:text-base">
              RECOIL AI doesn't just generate generic code. It understands RemoteEvents, DataStores, Humanoids, RunService — every Roblox API — and writes production-ready scripts with proper architecture.
            </p>
            <div className="space-y-3">
              {[
                "Proper client-server separation",
                "Type annotations for Studio intellisense",
                "Error handling and edge cases",
                "Performance-aware patterns",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: code block */}
          <div className="glass-orange rounded-2xl overflow-hidden shadow-card-dark">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-card/60">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
              </div>
              <span className="ml-2 font-mono text-[10px] text-muted-foreground/60">health-system.luau</span>
            </div>
            <div className="p-5 overflow-auto max-h-80 scrollbar-hide">
              <pre className="font-mono text-[11.5px] leading-relaxed whitespace-pre text-foreground/80">
                <span className="text-muted-foreground/50">{"-- ✨ Generated by RECOIL AI\n"}</span>
                <span className="text-sky-400">{"local "}</span><span className="text-foreground">{"Players = game:GetService("}</span><span className="text-orange-400">{'"Players"'}</span><span className="text-foreground">{")\n"}</span>
                <span className="text-sky-400">{"local "}</span><span className="text-foreground">{"DataStore = game:GetService("}</span><span className="text-orange-400">{'"DataStoreService"'}</span><span className="text-foreground">{")\n"}</span>
                <span className="text-sky-400">{"local "}</span><span className="text-foreground">{"HealthStore = DataStore:GetDataStore("}</span><span className="text-orange-400">{'"Health"'}</span><span className="text-foreground">{")\n\n"}</span>
                <span className="text-violet-400">{"local function "}</span><span className="text-amber-300">{"saveHealth"}</span><span className="text-foreground">{"(player: Player, hp: number)\n"}</span>
                <span className="text-foreground">{"    local success, err = pcall("}</span><span className="text-violet-400">{"function"}</span><span className="text-foreground">{"()\n"}</span>
                <span className="text-foreground">{"        HealthStore:SetAsync(player.UserId, hp)\n"}</span>
                <span className="text-foreground">{"    end)\n"}</span>
                <span className="text-sky-400">{"    if "}</span><span className="text-foreground">{"not success "}</span><span className="text-sky-400">{"then\n"}</span>
                <span className="text-foreground">{"        warn("}</span><span className="text-orange-400">{'"Save failed: "'}</span><span className="text-foreground">{" .. err)\n"}</span>
                <span className="text-sky-400">{"    end\n"}</span>
                <span className="text-violet-400">{"end"}</span><span className="text-foreground">{"\n\n"}</span>
                <span className="text-foreground">{"Players.PlayerAdded:Connect("}</span><span className="text-violet-400">{"function"}</span><span className="text-foreground">{"(player)\n"}</span>
                <span className="text-foreground">{"    player.CharacterAdded:Connect("}</span><span className="text-violet-400">{"function"}</span><span className="text-foreground">{"(char)\n"}</span>
                <span className="text-foreground">{"        local hum = char:WaitForChild("}</span><span className="text-orange-400">{'"Humanoid"'}</span><span className="text-foreground">{")\n"}</span>
                <span className="text-foreground">{"        local saved = HealthStore:GetAsync(player.UserId)\n"}</span>
                <span className="text-sky-400">{"        if "}</span><span className="text-foreground">{"saved "}</span><span className="text-sky-400">{"then "}</span><span className="text-foreground">{"hum.Health = saved "}</span><span className="text-sky-400">{"end\n"}</span>
                <span className="text-foreground">{"    end)\n"}</span>
                <span className="text-foreground">{"end)\n"}</span>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING / CTA ─────────────────────────────────────────────── */}
      <section className="py-28 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-card/20 border-y border-border/40" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-primary/6 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative max-w-3xl mx-auto">
          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16">
            {/* Free */}
            <div className="glass rounded-2xl p-6 border border-border">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-muted border border-border flex items-center justify-center">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className="font-display text-sm font-semibold">Free</span>
              </div>
              <div className="mb-4">
                <span className="font-display text-4xl font-bold">$0</span>
                <span className="text-muted-foreground text-sm ml-1">/month</span>
              </div>
              <ul className="space-y-2.5 mb-6">
                {["20 messages per day", "All AI models", "Persistent chat history", "Luau code generation"].map((item, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button variant="outline" asChild className="w-full h-10 text-sm border-border/60">
                <Link href="/signup">Get started free</Link>
              </Button>
            </div>

            {/* Pro - teaser */}
            <div className="border-gradient-orange rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-primary/15 border border-primary/30">
                <span className="text-[10px] font-display font-semibold text-primary uppercase tracking-wider">Coming soon</span>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
                  <Star className="h-4 w-4 text-primary" />
                </div>
                <span className="font-display text-sm font-semibold">Pro</span>
              </div>
              <div className="mb-4">
                <span className="font-display text-4xl font-bold text-gradient-orange">$9</span>
                <span className="text-muted-foreground text-sm ml-1">/month</span>
              </div>
              <ul className="space-y-2.5 mb-6">
                {["Unlimited messages", "Priority AI access", "Advanced code review", "Private chat history", "Early access to features"].map((item, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button disabled className="w-full h-10 text-sm bg-primary/20 text-primary border border-primary/30 cursor-not-allowed">
                Notify me
              </Button>
            </div>
          </div>

          {/* Main CTA */}
          <div className="text-center">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-3">
              <span className="text-gradient-white">Ready to build faster?</span>
            </h2>
            <p className="text-muted-foreground mb-8 text-sm sm:text-base">
              Join thousands of Roblox developers using AI to build better games.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" asChild className="h-12 px-10 text-sm font-semibold bg-primary hover:bg-primary/90 text-white shine-btn glow-orange">
                <Link href="/signup">
                  <Zap className="mr-2 h-4 w-4" />
                  Create free account
                </Link>
              </Button>
              <Button variant="ghost" size="lg" asChild className="h-12 px-8 text-sm hover:bg-accent">
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground mt-4">
              No credit card required · 20 messages per day · Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────── */}
      <footer className="border-t border-border/40 py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-display text-xs font-bold tracking-widest uppercase text-foreground">RECOIL AI</span>
          </Link>
          <div className="flex flex-wrap justify-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><Globe className="h-3 w-3" /> Built for Roblox developers</span>
            <span className="flex items-center gap-1.5"><Cpu className="h-3 w-3" /> Powered by OpenRouter</span>
            <span className="flex items-center gap-1.5"><Lock className="h-3 w-3" /> Secure by Supabase</span>
          </div>
          <p className="text-[11px] text-muted-foreground/50">© 2025 RECOIL AI</p>
        </div>
      </footer>
    </div>
  );
}
