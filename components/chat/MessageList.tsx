"use client";

import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { User, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { ChatMessage } from "@/types/database";

interface MessageListProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

function CodeBlock({
  language,
  value,
}: {
  language: string;
  value: string;
}) {
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
  };

  return (
    <div className="relative group rounded-md overflow-hidden my-2">
      <div className="flex items-center justify-between px-3 py-1.5 bg-muted/80 border-b border-border">
        <span className="text-[10px] font-mono text-muted-foreground uppercase">
          {language || "code"}
        </span>
        <button
          onClick={handleCopy}
          className="text-[10px] text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
        >
          Copy
        </button>
      </div>
      <SyntaxHighlighter
        language={language || "lua"}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: "12px 16px",
          fontSize: "13px",
          lineHeight: "1.5",
          borderRadius: "0 0 6px 6px",
        }}
        showLineNumbers
        lineNumberStyle={{
          fontSize: "11px",
          color: "#4a4a4a",
          minWidth: "2em",
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
}

function MessageBubble({
  message,
  isLast,
  isStreaming,
}: {
  message: ChatMessage;
  isLast: boolean;
  isStreaming: boolean;
}) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "py-4 px-4 md:px-8 lg:px-12",
        isUser ? "bg-transparent" : "bg-muted/30"
      )}
    >
      <div className="max-w-3xl mx-auto flex gap-4">
        {/* Avatar */}
        <div className="shrink-0 mt-0.5">
          {isUser ? (
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
          ) : (
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary-foreground" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-muted-foreground mb-1">
            {isUser ? "You" : "RECOIL AI"}
          </div>

          {isUser ? (
            <div className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </div>
          ) : (
            <div className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  code({ className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || "");
                    const language = match ? match[1] : "";
                    const value = String(children).replace(/\n$/, "");

                    if (match) {
                      return <CodeBlock language={language} value={value} />;
                    }

                    return (
                      <code
                        className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                  pre({ children }) {
                    return <>{children}</>;
                  },
                  h1: ({ children }) => (
                    <h1 className="text-lg font-bold mt-4 mb-2">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-base font-semibold mt-3 mb-2">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-sm font-semibold mt-2 mb-1">{children}</h3>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-sm">{children}</li>
                  ),
                  p: ({ children }) => (
                    <p className="my-2 leading-relaxed">{children}</p>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold">{children}</strong>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-primary/50 pl-3 my-2 text-muted-foreground">
                      {children}
                    </blockquote>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-3">
                      <table className="w-full text-xs border-collapse">{children}</table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead className="bg-muted">{children}</thead>
                  ),
                  th: ({ children }) => (
                    <th className="px-3 py-2 text-left font-semibold border">{children}</th>
                  ),
                  td: ({ children }) => (
                    <td className="px-3 py-2 border">{children}</td>
                  ),
                }}
              >
                {message.content || " "}
              </ReactMarkdown>

              {/* Streaming indicator */}
              {isLast && isStreaming && !message.content && (
                <div className="flex items-center gap-1 mt-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse delay-75" />
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse delay-150" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function MessageList({
  messages,
  isStreaming,
  messagesEndRef,
}: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, messagesEndRef]);

  return (
    <div ref={containerRef} className="divide-y divide-border/50">
      {messages.map((msg, i) => (
        <MessageBubble
          key={i}
          message={msg}
          isLast={i === messages.length - 1}
          isStreaming={isStreaming}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
