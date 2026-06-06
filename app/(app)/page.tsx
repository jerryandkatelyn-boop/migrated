"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/components/providers/trpc-provider";

import { Sidebar } from "@/components/sidebar/Sidebar";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { UsageBar } from "@/components/usage/UsageBar";
import { EmptyState } from "@/components/chat/EmptyState";

import type { ChatMessage } from "@/types/database";

export default function DashboardPage() {
  const { user, isLoading, isAuthenticated } = useAuth();

  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedModel, setSelectedModel] = useState("openai/gpt-4o-mini");
  const [selectedProvider, setSelectedProvider] = useState("openrouter");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── tRPC Queries ────────────────────────────────────────────────────────────

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

  const createChat = trpc.chat.create.useMutation({
    onSuccess: () => refetchChats(),
  });

  const deleteChat = trpc.chat.delete.useMutation({
    onSuccess: (_, vars) => {
      refetchChats();
      if (activeChatId === vars.id) {
        setActiveChatId(null);
        setMessages([]);
      }
    },
  });

  const updateChat = trpc.chat.update.useMutation({
    onSuccess: () => refetchChats(),
  });

  // ── Load Messages When Chat Changes ────────────────────────────────────────

  useEffect(() => {
    if (chatMessages && activeChatId) {
      const loaded: ChatMessage[] = chatMessages.map((m) => ({
        role: m.role as "user" | "assistant" | "system",
        content: m.content,
      }));
      setMessages(loaded);
    }
  }, [chatMessages, activeChatId]);

  // ── Auto Scroll ─────────────────────────────────────────────────────────────

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleNewChat = useCallback(async () => {
    const chat = await createChat.mutateAsync({
      title: "New Chat",
      model: selectedModel,
    });
    if (chat) {
      setActiveChatId(chat.id);
      setMessages([]);
    }
  }, [createChat, selectedModel]);

  const handleSelectChat = useCallback((chatId: string) => {
    setActiveChatId(chatId);
  }, []);

  const handleDeleteChat = useCallback(
    async (chatId: string) => {
      await deleteChat.mutateAsync({ id: chatId });
    },
    [deleteChat]
  );

  const handleRenameChat = useCallback(
    async (chatId: string, title: string) => {
      await updateChat.mutateAsync({ id: chatId, title });
    },
    [updateChat]
  );

  const handleSendMessage = useCallback(
    async (content: string) => {
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
            {
              role: "assistant",
              content: `**Error:** ${error.error || "Failed to get response"}`,
            },
          ]);
          setIsStreaming(false);
          refetchUsage();
          return;
        }

        if (!response.body) {
          setIsStreaming(false);
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantContent = "";

        // Append empty assistant placeholder
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "" },
        ]);

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
                  if (last && last.role === "assistant") {
                    last.content = assistantContent;
                  }
                  return updated;
                });
              } catch {
                // skip
              }
            }
          }
        }

        refetchUsage();
        refetchChats();
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content:
                "**Error:** Failed to connect to AI service. Please try again.",
            },
          ]);
        }
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [
      activeChatId,
      isStreaming,
      messages,
      selectedModel,
      selectedProvider,
      usageData,
      refetchUsage,
      refetchChats,
    ]
  );

  const handleStopStreaming = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsStreaming(false);
  }, []);

  // ── Loading State ───────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading RECOIL AI...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  // ── Render ──────────────────────────────────────────────────────────────────

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

      <div className="flex-1 flex flex-col min-w-0">
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
              ? "Start a new chat to begin..."
              : usageData?.hasReachedLimit
              ? "Daily limit reached. Upgrade to continue."
              : "Ask RECOIL AI anything about Roblox development..."
          }
        />
      </div>
    </div>
  );
}
