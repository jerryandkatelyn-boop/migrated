"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/components/providers/trpc-provider";

import { Sidebar } from "@/components/sidebar/Sidebar";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { UsageBar } from "@/components/usage/UsageBar";
import { EmptyState } from "@/components/chat/EmptyState";
import { Zap } from "lucide-react";

import type { ChatMessage } from "@/types/database";

export default function DashboardClient() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();

  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedModel, setSelectedModel] = useState("openai/gpt-4o-mini");
  const [selectedProvider, setSelectedProvider] = useState("openrouter");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── tRPC Queries ─────────────────────────────────────────────────────

  const { data: chatList, refetch: refetchChats } = trpc.chat.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const { data: chatMessages } = trpc.chat.messages.useQuery(
    { chatId: activeChatId! },
    { enabled: !!activeChatId }
  );

  const { data: usageData, refetch: refetchUsage } =
    trpc.chat.checkLimit.useQuery(undefined, { enabled: isAuthenticated });

  const { data: modelsList } = trpc.models.useQuery();

  const createChat = trpc.chat.create.useMutation({ onSuccess: () => refetchChats() });

  const deleteChat = trpc.chat.delete.useMutation({
    onSuccess: (_, vars) => {
      refetchChats();
      if (activeChatId === vars.id) { setActiveChatId(null); setMessages([]); }
    },
  });

  const updateChat = trpc.chat.update.useMutation({ onSuccess: () => refetchChats() });

  // ── Load messages ────────────────────────────────────────────────────

  useEffect(() => {
    if (chatMessages && activeChatId) {
      setMessages(chatMessages.map((m) => ({
        role: m.role as "user" | "assistant" | "system",
        content: m.content,
      })));
    }
  }, [chatMessages, activeChatId]);

  // ── Auto scroll ──────────────────────────────────────────────────────

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Handlers ─────────────────────────────────────────────────────────

  const handleNewChat = useCallback(async () => {
    const chat = await createChat.mutateAsync({ title: "New Chat", model: selectedModel });
    if (chat) { setActiveChatId(chat.id); setMessages([]); }
  }, [createChat, selectedModel]);

  const handleSelectChat = useCallback((chatId: string) => { setActiveChatId(chatId); }, []);

  const handleDeleteChat = useCallback(async (chatId: string) => {
    await deleteChat.mutateAsync({ id: chatId });
  }, [deleteChat]);

  const handleRenameChat = useCallback(async (chatId: string, title: string) => {
    await updateChat.mutateAsync({ id: chatId, title });
  }, [updateChat]);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!activeChatId || isStreaming) return;
    if (usageData?.hasReachedLimit) return;

    const userMsg: ChatMessage = { role: "user", content };
    setMessages((prev) => [...prev, userMsg]);
    setIsStreaming(true);

    try {
      const allMessages: ChatMessage[] = [...messages, userMsg];
      abortControllerRef.current = new AbortController();

      const response = await fetch("/api/stream/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          chatId: activeChatId,
          messages: allMessages,
          model: selectedModel,
          provider: selectedProvider,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `**Error:** ${error.error || "Failed to get response"}` },
        ]);
        setIsStreaming(false);
        refetchUsage();
        return;
      }

      if (!response.body) { setIsStreaming(false); return; }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter((l) => l.trim());
        for (const line of lines) {
          if (line.startsWith("0:")) {
            try {
              const text = JSON.parse(line.slice(2));
              assistantContent += text;
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last && last.role === "assistant") last.content = assistantContent;
                return updated;
              });
            } catch { /* skip */ }
          }
        }
      }

      refetchUsage();
      refetchChats();
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "**Error:** Failed to connect to AI service. Please try again." },
        ]);
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, [activeChatId, isStreaming, messages, selectedModel, selectedProvider, usageData, refetchUsage, refetchChats]);

  const handleStopStreaming = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsStreaming(false);
  }, []);

  // ── Auth redirect ────────────────────────────────────────────────────

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
      router.refresh();
    }
  }, [isLoading, isAuthenticated, router]);

  // ── Loading screen ───────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-background relative overflow-hidden">
        {/* BG */}
        <div className="absolute inset-0 mesh-hero" />
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/8 rounded-full blur-[100px]" />

        {/* Spinner content */}
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="relative w-16 h-16">
            {/* Outer pulse ring */}
            <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
            {/* Spinning ring */}
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
            {/* Icon */}
            <div className="absolute inset-2 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
              <Zap className="h-5 w-5 text-primary" strokeWidth={2} />
            </div>
          </div>

          <div className="text-center">
            <p className="font-display text-sm font-semibold tracking-widest uppercase text-foreground/80 mb-1">
              RECOIL AI
            </p>
            <p className="text-xs text-muted-foreground animate-pulse">
              Loading your workspace…
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen w-screen bg-background overflow-hidden">
      <Sidebar
        chats={chatList || []}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        user={user}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <ChatHeader
          selectedModel={selectedModel}
          selectedProvider={selectedProvider}
          onModelChange={setSelectedModel}
          onProviderChange={setSelectedProvider}
          models={modelsList || []}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        {usageData && (
          <UsageBar
            used={usageData.used}
            limit={usageData.limit}
            remaining={usageData.remaining}
            hasReachedLimit={usageData.hasReachedLimit}
          />
        )}

        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 && !isStreaming ? (
            <EmptyState onSuggestionClick={handleSendMessage} />
          ) : (
            <MessageList
              messages={messages}
              isStreaming={isStreaming}
              messagesEndRef={messagesEndRef}
            />
          )}
        </div>

        <ChatInput
          onSend={handleSendMessage}
          isStreaming={isStreaming}
          onStop={handleStopStreaming}
          disabled={!activeChatId || usageData?.hasReachedLimit}
          placeholder={
            !activeChatId
              ? "Select or create a conversation to begin…"
              : usageData?.hasReachedLimit
              ? "Daily limit reached · Come back tomorrow"
              : undefined
          }
        />
      </div>
    </div>
  );
}
