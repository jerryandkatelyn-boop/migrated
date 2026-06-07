"use client";

import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { User, Zap, Copy, Check } from "lucide-react";
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

/* ── Code block component ───────────────────────────────────────────── */
function CodeBlock({ language, value }: { language: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-3 rounded-xl overflow-hidden border border-border/60 shadow-card-dark">
      {/* Tab bar */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 bg-card border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
          </div>
          <span className="font-mono text-[10px] text-muted-foreground/70 uppercase tracking-wider ml-1">
            {language || "code"}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60 hover:text-muted-foreground transition-all duration-200 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code — horizontally scrollable on mobile */}
      <div className="overflow-x-auto">
        <SyntaxHighlighter
          language={language || "lua"}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: "14px 16px",
            fontSize: "12px",
            lineHeight: "1.6",
            background: "hsl(228 55% 5%)",
            borderRadius: 0,
            minWidth: "100%",
          }}
          showLineNumbers
          lineNumberStyle={{
            fontSize: "11px",
            color: "hsl(228 30% 30%)",
            minWidth: "2.5em",
            paddingRight: "1em",
          }}
        >
          {value}
        </SyntaxHighlighter>
      </div>

      {/* Bottom accent line */}
      <div className="h-px bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0" />
    </div>
  );
}

/* ── Message bubble ─────────────────────────────────────────────────── */
function MessageBubble({
  message, isLast, isStreaming,
}: {
  message: ChatMessage;
  isLast: boolean;
  isStreaming: boolean;
}) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "py-4 sm:py-5 px-3 sm:px-6 md:px-8 lg:px-12 transition-colors",
        isUser
          ? "bg-transparent"
          : "bg-card/20 border-y border-border/30"
      )}
    >
      <div className="max-w-3xl mx-auto flex gap-2.5 sm:gap-4">
        {/* Avatar — smaller on mobile */}
        <div className="shrink-0 mt-0.5">
          {isUser ? (
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-secondary border border-border flex items-center justify-center">
              <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            </div>
          ) : (
            <div className="relative w-7 h-7 sm:w-8 sm:h-8">
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-sm" />
              <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" strokeWidth={2} />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
            <span className="text-[11px] font-display font-semibold uppercase tracking-wider text-muted-foreground/70">
              {isUser ? "You" : "RECOIL AI"}
            </span>
            {!isUser && (
              <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
            )}
          </div>

          {isUser ? (
            <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
              {message.content}
            </div>
          ) : (
            <div className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none
              prose-headings:font-display
              prose-h1:text-lg prose-h1:font-bold prose-h1:mt-5 prose-h1:mb-2.5
              prose-h2:text-base prose-h2:font-semibold prose-h2:mt-4 prose-h2:mb-2
              prose-h3:text-sm prose-h3:font-semibold prose-h3:mt-3 prose-h3:mb-1.5
              prose-p:my-2 prose-p:leading-relaxed
              prose-ul:my-2 prose-ul:pl-5 prose-li:my-0.5
              prose-ol:my-2 prose-ol:pl-5
              prose-strong:font-semibold prose-strong:text-foreground
              prose-blockquote:border-l-2 prose-blockquote:border-primary/40 prose-blockquote:pl-3 prose-blockquote:text-muted-foreground prose-blockquote:my-3
              prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono prose-code:text-foreground/90
              prose-table:text-xs
              prose-th:font-semibold prose-th:text-left prose-th:p-2.5 prose-th:border prose-th:border-border prose-th:bg-muted/50
              prose-td:p-2.5 prose-td:border prose-td:border-border
            ">
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
                      <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                        {children}
                      </code>
                    );
                  },
                  pre({ children }) { return <>{children}</>; },
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-4 rounded-lg border border-border">
                      <table className="w-full text-xs border-collapse">{children}</table>
                    </div>
                  ),
                  thead: ({ children }) => <thead className="bg-muted/50">{children}</thead>,
                }}
              >
                {message.content || " "}
              </ReactMarkdown>

              {/* Streaming dots */}
              {isLast && isStreaming && !message.content && (
                <div className="flex items-center gap-1.5 mt-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── MessageList ────────────────────────────────────────────────────── */
export function MessageList({ messages, isStreaming, messagesEndRef }: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, messagesEndRef]);

  return (
    <div ref={containerRef} className="divide-y-0">
      {messages.map((msg, i) => (
        <MessageBubble
          key={i}
          message={msg}
          isLast={i === messages.length - 1}
          isStreaming={isStreaming}
        />
      ))}
      <div ref={messagesEndRef} className="h-4" />
    </div>
  );
}
