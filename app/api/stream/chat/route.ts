import { NextRequest, NextResponse } from "next/server";
import { streamText, convertToModelMessages } from "ai";
import { createClient } from "@/lib/supabase/server";
import {
  getActiveProvider,
  getModelProvider,
  calculateCost,
} from "@/server/services/ai-provider";
import { DEFAULT_ROBLOX_SYSTEM_PROMPT } from "@/server/services/roblox-prompt";
import {
  createMessage,
  incrementUsage,
  updateChatTimestamp,
  getTodayUsage,
  findChatById,
} from "@/server/queries/chats";
import { getTodayDateStr } from "@/lib/utils";

const FREE_TIER_DAILY_LIMIT = 20;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("id", authUser.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 401 }
      );
    }

    let body: {
      chatId: string;
      messages: Array<{ role: string; content: string }>;
      model?: string;
      provider?: string;
      systemPrompt?: string;
    };

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    if (!body.chatId || !body.messages || body.messages.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields: chatId, messages" },
        { status: 400 }
      );
    }

    const chat = await findChatById(body.chatId, authUser.id);

    if (!chat) {
      return NextResponse.json(
        { error: "Chat not found" },
        { status: 404 }
      );
    }

    const today = getTodayDateStr();
    const usage = await getTodayUsage(authUser.id, today);
    const messageCount = usage?.message_count ?? 0;

    if (messageCount >= FREE_TIER_DAILY_LIMIT) {
      return NextResponse.json(
        {
          error: `Daily limit reached (${messageCount}/${FREE_TIER_DAILY_LIMIT})`,
          code: "RATE_LIMIT",
        },
        { status: 429 }
      );
    }

    const { config, model } = getActiveProvider(
      body.provider,
      body.model || chat.model
    );

    if (!config.apiKey) {
      return NextResponse.json(
        {
          error: `AI provider "${config.name}" is not configured`,
        },
        { status: 500 }
      );
    }

    const lastUserMessage = [...body.messages]
      .reverse()
      .find((m) => m.role === "user");

    if (lastUserMessage) {
      await createMessage({
        chatId: body.chatId,
        role: "user",
        content: lastUserMessage.content,
        model,
        provider: config.slug,
      });
    }

    const uiMessages = body.messages.map((m) => ({
      id: crypto.randomUUID(),
      role: m.role as "user" | "assistant" | "system",
      parts: [
        {
          type: "text" as const,
          text: m.content,
        },
      ],
    }));

    const providerModel = getModelProvider(config, model);
    const startTime = Date.now();

    const result = streamText({
      model: providerModel,
      system: body.systemPrompt || DEFAULT_ROBLOX_SYSTEM_PROMPT,
      messages: await convertToModelMessages(uiMessages),
      temperature: 0.7,
      maxOutputTokens: 4096,

      onFinish: async (completion) => {
        const latencyMs = Date.now() - startTime;

        const totalTokens = completion.usage?.totalTokens ?? 0;
        const inputTokens = completion.usage?.inputTokens ?? 0;
        const outputTokens = completion.usage?.outputTokens ?? 0;

        const costUsd = calculateCost(
          config,
          inputTokens,
          outputTokens
        );

        try {
          await createMessage({
            chatId: body.chatId,
            role: "assistant",
            content: completion.text,
            model,
            tokensUsed: totalTokens,
            latencyMs,
            costUsd,
            provider: config.slug,
          });

          await incrementUsage(
            authUser.id,
            today,
            totalTokens,
            costUsd,
            model,
            config.slug
          );

          await updateChatTimestamp(body.chatId);
        } catch (err) {
          console.error("[stream] Post-completion error:", err);
        }
      },
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("[stream] Unhandled error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Internal server error";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
