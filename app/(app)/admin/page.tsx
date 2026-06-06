"use client";

export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/components/providers/trpc-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  MessageSquare,
  Activity,
  DollarSign,
  ArrowLeft,
  Shield,
  Terminal,
  Cpu,
  TrendingUp,
  Flag,
  Database,
} from "lucide-react";
import { formatCost, formatTokens, formatDate } from "@/lib/utils";

function StatCard({
  title,
  value,
  icon: Icon,
  sub,
  color = "text-primary",
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  sub?: string;
  color?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value.toLocaleString()}</p>
            {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
          </div>
          <div className={`w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center ${color}`}>
            <Icon className="h-4.5 w-4.5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user?.role !== "admin") {
      router.push("/dashboard");

  const isAdmin = user?.role === "admin";

  const { data: stats } = trpc.admin.stats.useQuery(undefined, { enabled: isAdmin });
  const { data: dailyStats } = trpc.admin.dailyStats.useQuery({ days: 30 }, { enabled: isAdmin });
  const { data: providerStats } = trpc.admin.providerStats.useQuery(undefined, { enabled: isAdmin });
  const { data: users } = trpc.admin.users.useQuery({ limit: 200 }, { enabled: isAdmin });
  const { data: recentChats } = trpc.admin.recentChats.useQuery({ limit: 50 }, { enabled: isAdmin });
  const { data: featureFlags } = trpc.admin.getFeatureFlags.useQuery(undefined, { enabled: isAdmin });
  const { data: prompts } = trpc.admin.getPrompts.useQuery(undefined, { enabled: isAdmin });

  const updateFlagMutation = trpc.admin.updateFeatureFlag.useMutation();
  const updateRoleMutation = trpc.admin.updateUserRole.useMutation();
  const updatePromptMutation = trpc.admin.updatePrompt.useMutation();

  const utils = trpc.useUtils();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-background/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <h1 className="font-semibold text-sm">Admin Panel</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <span className="text-xs text-muted-foreground">{user?.name}</span>
        </div>
      </header>

      <div className="p-6 max-w-7xl mx-auto">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="flex-wrap gap-1 h-auto">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="users" className="text-xs">Users</TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs">Analytics</TabsTrigger>
            <TabsTrigger value="ai" className="text-xs">AI Providers</TabsTrigger>
            <TabsTrigger value="flags" className="text-xs">Feature Flags</TabsTrigger>
            <TabsTrigger value="prompts" className="text-xs">System Prompts</TabsTrigger>
          </TabsList>

          {/* ── Overview ─────────────────────────────────────────────────────── */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Total Users" value={stats?.total_users ?? 0} icon={Users} />
              <StatCard title="Total Chats" value={stats?.total_chats ?? 0} icon={MessageSquare} />
              <StatCard title="Total Messages" value={stats?.total_messages ?? 0} icon={Terminal} />
              <StatCard title="DAU" value={stats?.daily_active_users ?? 0} icon={Activity} sub="Today" />
              <StatCard title="Messages Today" value={stats?.messages_today ?? 0} icon={TrendingUp} sub="24h" />
              <StatCard title="Total Tokens" value={formatTokens(stats?.total_tokens ?? 0)} icon={Cpu} />
              <StatCard title="Total Cost" value={formatCost(stats?.total_cost_usd ?? 0)} icon={DollarSign} />
              <StatCard title="Cost Today" value={formatCost(stats?.cost_today ?? 0)} icon={DollarSign} sub="24h" />
            </div>

            {/* Daily Messages Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Daily Messages (30 days)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={dailyStats ?? []}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 6, fontSize: 11 }}
                    />
                    <Line type="monotone" dataKey="message_count" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Messages" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Provider Stats */}
            {providerStats && providerStats.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Usage by Provider</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={providerStats}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="provider" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 6, fontSize: 11 }}
                      />
                      <Bar dataKey="message_count" fill="hsl(var(--primary))" name="Messages" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Recent Chats */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Recent Chats</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-64">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Title</TableHead>
                        <TableHead className="text-xs">Model</TableHead>
                        <TableHead className="text-xs">Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(recentChats ?? []).map((chat) => (
                        <TableRow key={chat.id}>
                          <TableCell className="text-xs max-w-[200px] truncate">{chat.title}</TableCell>
                          <TableCell className="text-xs font-mono">{chat.model}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{formatDate(chat.created_at)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Users ────────────────────────────────────────────────────────── */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Name</TableHead>
                        <TableHead className="text-xs">Email</TableHead>
                        <TableHead className="text-xs">Role</TableHead>
                        <TableHead className="text-xs">Joined</TableHead>
                        <TableHead className="text-xs">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(users ?? []).map((u) => (
                        <TableRow key={u.id}>
                          <TableCell className="text-xs font-medium">{u.name || "—"}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{u.email}</TableCell>
                          <TableCell>
                            <Badge variant={u.role === "admin" ? "default" : "secondary"} className="text-[10px] px-1.5">
                              {u.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{formatDate(u.created_at)}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 text-[10px] px-2"
                              disabled={u.id === user?.id}
                              onClick={async () => {
                                const newRole = u.role === "admin" ? "user" : "admin";
                                await updateRoleMutation.mutateAsync({ userId: u.id, role: newRole });
                                utils.admin.users.invalidate();
                              }}
                            >
                              {u.role === "admin" ? "Demote" : "Make Admin"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Analytics ────────────────────────────────────────────────────── */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Daily Cost (USD)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={dailyStats ?? []}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `$${v.toFixed(3)}`} />
                      <Tooltip
                        formatter={(v: number) => [`$${v.toFixed(5)}`, "Cost"]}
                        contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 6, fontSize: 11 }}
                      />
                      <Line type="monotone" dataKey="cost_usd" stroke="#10b981" strokeWidth={2} dot={false} name="Cost" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Daily Tokens Used</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={dailyStats ?? []}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => formatTokens(v)} />
                      <Tooltip
                        formatter={(v: number) => [formatTokens(v), "Tokens"]}
                        contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 6, fontSize: 11 }}
                      />
                      <Bar dataKey="token_count" fill="hsl(var(--primary))" name="Tokens" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Unique Daily Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={dailyStats ?? []}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 6, fontSize: 11 }}
                      />
                      <Line type="monotone" dataKey="unique_users" stroke="#f59e0b" strokeWidth={2} dot={false} name="Users" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Provider breakdown table */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Provider Cost Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Provider</TableHead>
                        <TableHead className="text-xs">Messages</TableHead>
                        <TableHead className="text-xs">Tokens</TableHead>
                        <TableHead className="text-xs">Cost</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(providerStats ?? []).map((p) => (
                        <TableRow key={p.provider}>
                          <TableCell className="text-xs font-medium capitalize">{p.provider}</TableCell>
                          <TableCell className="text-xs">{p.message_count.toLocaleString()}</TableCell>
                          <TableCell className="text-xs">{formatTokens(p.token_count)}</TableCell>
                          <TableCell className="text-xs">{formatCost(p.cost_usd)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── AI Providers ──────────────────────────────────────────────────── */}
          <TabsContent value="ai" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Cpu className="h-4 w-4" />
                  AI Provider Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-4">
                  OpenRouter is the primary provider. Configure API keys in your Vercel environment variables.
                </p>
                <div className="space-y-3">
                  {[
                    { name: "OpenRouter", key: "OPENROUTER_API_KEY", primary: true },
                    { name: "OpenAI", key: "OPENAI_API_KEY", primary: false },
                    { name: "Anthropic", key: "ANTHROPIC_API_KEY", primary: false },
                    { name: "Google AI", key: "GOOGLE_API_KEY", primary: false },
                    { name: "DeepSeek", key: "DEEPSEEK_API_KEY", primary: false },
                  ].map((p) => (
                    <div key={p.name} className="flex items-center justify-between p-3 rounded-lg border border-border">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{p.name}</span>
                          {p.primary && (
                            <Badge variant="default" className="text-[10px] px-1.5">Primary</Badge>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">{p.key}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        Set via env
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Feature Flags ─────────────────────────────────────────────────── */}
          <TabsContent value="flags" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Flag className="h-4 w-4" />
                  Feature Flags
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(featureFlags ?? []).length === 0 && (
                  <p className="text-xs text-muted-foreground">No feature flags configured.</p>
                )}
                {(featureFlags ?? []).map((flag) => (
                  <div key={flag.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div>
                      <p className="text-sm font-medium">{flag.name}</p>
                      {flag.description && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">{flag.description}</p>
                      )}
                      <p className="text-[10px] font-mono text-muted-foreground">{flag.key}</p>
                    </div>
                    <Switch
                      checked={flag.enabled}
                      onCheckedChange={async (checked) => {
                        await updateFlagMutation.mutateAsync({ id: flag.id, enabled: checked });
                        utils.admin.getFeatureFlags.invalidate();
                      }}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── System Prompts ────────────────────────────────────────────────── */}
          <TabsContent value="prompts" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  System Prompts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(prompts ?? []).length === 0 && (
                  <p className="text-xs text-muted-foreground">No system prompts configured.</p>
                )}
                {(prompts ?? []).map((prompt) => (
                  <div key={prompt.id} className="p-3 rounded-lg border border-border space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{prompt.name}</span>
                        {prompt.is_default && (
                          <Badge variant="default" className="text-[10px] px-1.5">Default</Badge>
                        )}
                      </div>
                      <Switch
                        checked={prompt.is_active}
                        onCheckedChange={async (checked) => {
                          await updatePromptMutation.mutateAsync({ id: prompt.id, is_active: checked });
                          utils.admin.getPrompts.invalidate();
                        }}
                      />
                    </div>
                    {prompt.description && (
                      <p className="text-[10px] text-muted-foreground">{prompt.description}</p>
                    )}
                    <div className="bg-muted/50 rounded p-2 max-h-24 overflow-y-auto">
                      <pre className="text-[10px] font-mono whitespace-pre-wrap text-muted-foreground">
                        {prompt.prompt}
                      </pre>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
