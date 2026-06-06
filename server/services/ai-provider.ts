import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { deepseek } from "@ai-sdk/deepseek";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import {
  streamText,
  convertToModelMessages,
  type UIMessage,
  type LanguageModelV1,
} from "ai";

// ─── Provider Configuration ────────────────────────────────────────────────────

export interface ProviderConfig {
  name: string;
  slug: string;
  apiKey: string;
  baseUrl?: string;
  defaultModel: string;
  models: string[];
  isActive: boolean;
  isDefault: boolean;
  costPer1kInput: number;  // USD
  costPer1kOutput: number; // USD
}

// ─── Default Provider Configurations ──────────────────────────────────────────
// OpenRouter is now the PRIMARY default provider.

export const DEFAULT_PROVIDERS: ProviderConfig[] = [
  {
    name: "OpenRouter",
    slug: "openrouter",
    apiKey: process.env.OPENROUTER_API_KEY || "",
    baseUrl: "https://openrouter.ai/api/v1",
    defaultModel: "openai/gpt-4o-mini",
    models: [
      "openai/gpt-4o",
      "openai/gpt-4o-mini",
      "anthropic/claude-sonnet-4",
      "anthropic/claude-opus-4",
      "google/gemini-2.5-pro",
      "google/gemini-2.5-flash",
      "deepseek/deepseek-chat",
      "deepseek/deepseek-r1",
      "meta-llama/llama-4-maverick",
      "meta-llama/llama-4-scout",
      "mistralai/mistral-large",
    ],
    isActive: true,
    isDefault: true, // PRIMARY
    costPer1kInput: 0.00015,
    costPer1kOutput: 0.0006,
  },
  {
    name: "OpenAI",
    slug: "openai",
    apiKey: process.env.OPENAI_API_KEY || "",
    defaultModel: "gpt-4o-mini",
    models: [
      "gpt-4o",
      "gpt-4o-mini",
      "gpt-4-turbo",
      "gpt-3.5-turbo",
      "o1-preview",
      "o1-mini",
    ],
    isActive: true,
    isDefault: false,
    costPer1kInput: 0.00015,
    costPer1kOutput: 0.0006,
  },
  {
    name: "Anthropic",
    slug: "anthropic",
    apiKey: process.env.ANTHROPIC_API_KEY || "",
    defaultModel: "claude-sonnet-4-20250514",
    models: [
      "claude-opus-4-20250514",
      "claude-sonnet-4-20250514",
      "claude-haiku-4-20250514",
    ],
    isActive: true,
    isDefault: false,
    costPer1kInput: 0.003,
    costPer1kOutput: 0.015,
  },
  {
    name: "Google",
    slug: "google",
    apiKey: process.env.GOOGLE_API_KEY || "",
    defaultModel: "gemini-2.5-flash",
    models: [
      "gemini-2.5-pro",
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-1.5-pro",
    ],
    isActive: true,
    isDefault: false,
    costPer1kInput: 0.00015,
    costPer1kOutput: 0.0006,
  },
  {
    name: "DeepSeek",
    slug: "deepseek",
    apiKey: process.env.DEEPSEEK_API_KEY || "",
    defaultModel: "deepseek-chat",
    models: ["deepseek-chat", "deepseek-reasoner"],
    isActive: true,
    isDefault: false,
    costPer1kInput: 0.00014,
    costPer1kOutput: 0.00028,
  },
];

// ─── Model Provider Factory ────────────────────────────────────────────────────

export function getModelProvider(
  config: ProviderConfig,
  model?: string
): LanguageModelV1 {
  const selectedModel = model || config.defaultModel;

  switch (config.slug) {
    case "openai":
      return openai(selectedModel);

    case "anthropic":
      return anthropic(selectedModel);

    case "google":
      return google(selectedModel);

    case "deepseek":
      return deepseek(selectedModel);

    case "openrouter": {
      const or = createOpenAICompatible({
        name: "openrouter",
        apiKey: config.apiKey,
        baseURL: config.baseUrl || "https://openrouter.ai/api/v1",
        headers: {
          "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://localhost:3000",
          "X-Title": "RECOIL AI",
        },
      });
      return or(selectedModel);
    }

    default:
      // Fallback to OpenRouter
      const fallback = createOpenAICompatible({
        name: "openrouter",
        apiKey: process.env.OPENROUTER_API_KEY || "",
        baseURL: "https://openrouter.ai/api/v1",
      });
      return fallback(selectedModel);
  }
}

// ─── Active Provider Selection ─────────────────────────────────────────────────

export function getActiveProvider(
  preferredProvider?: string,
  preferredModel?: string
): { config: ProviderConfig; model: string } {
  const providers = DEFAULT_PROVIDERS.filter((p) => p.isActive);

  if (preferredProvider) {
    const config = providers.find((p) => p.slug === preferredProvider);
    if (config && config.apiKey) {
      const model =
        preferredModel && config.models.includes(preferredModel)
          ? preferredModel
          : config.defaultModel;
      return { config, model };
    }
  }

  // Find the default provider with a configured API key
  const defaultProvider =
    providers.find((p) => p.isDefault && p.apiKey) ||
    providers.find((p) => p.apiKey) ||
    providers[0];

  return {
    config: defaultProvider,
    model: preferredModel || defaultProvider.defaultModel,
  };
}

// ─── Available Models ──────────────────────────────────────────────────────────

export function getAvailableModels() {
  const models: Array<{
    provider: string;
    providerName: string;
    model: string;
    label: string;
  }> = [];

  for (const provider of DEFAULT_PROVIDERS) {
    if (!provider.isActive) continue;
    for (const model of provider.models) {
      models.push({
        provider: provider.slug,
        providerName: provider.name,
        model,
        label: `${provider.name} — ${model}`,
      });
    }
  }

  return models;
}

// ─── Cost Calculation ──────────────────────────────────────────────────────────

export function calculateCost(
  config: ProviderConfig,
  inputTokens: number,
  outputTokens: number
): number {
  const inputCost = (inputTokens / 1000) * config.costPer1kInput;
  const outputCost = (outputTokens / 1000) * config.costPer1kOutput;
  return Number((inputCost + outputCost).toFixed(8));
}

// ─── Chat Message Type ─────────────────────────────────────────────────────────

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface StreamChatOptions {
  messages: ChatMessage[];
  systemPrompt?: string;
  provider?: string;
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
}

export interface StreamChatResult {
  stream: Response;
  model: string;
  provider: string;
  providerName: string;
  config: ProviderConfig;
}

// ─── Stream Chat with Retry ────────────────────────────────────────────────────

export async function streamChatResponse(
  options: StreamChatOptions,
  maxRetries = 2
): Promise<StreamChatResult> {
  const { config, model } = getActiveProvider(options.provider, options.model);

  if (!config.apiKey) {
    throw new Error(
      `No API key configured for provider "${config.name}". ` +
      `Set ${config.slug.toUpperCase()}_API_KEY in environment variables.`
    );
  }

  const providerModel = getModelProvider(config, model);

  const uiMessages: UIMessage[] = options.messages.map((m) => ({
    id: crypto.randomUUID(),
    role: m.role,
    parts: [{ type: "text" as const, text: m.content }],
  }));

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = streamText({
        model: providerModel,
        system: options.systemPrompt,
        messages: await convertToModelMessages(uiMessages),
        temperature: options.temperature ?? 0.7,
        maxOutputTokens: options.maxOutputTokens ?? 4096,
      });

      return {
        stream: result.toTextStreamResponse(),
        model,
        provider: config.slug,
        providerName: config.name,
        config,
      };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      // Don't retry on auth errors or client errors
      if (
        lastError.message.includes("401") ||
        lastError.message.includes("403") ||
        lastError.message.includes("400")
      ) {
        break;
      }

      if (attempt < maxRetries) {
        // Exponential backoff: 1s, 2s
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * Math.pow(2, attempt))
        );
        console.warn(`[ai-provider] Retry ${attempt + 1}/${maxRetries} for ${config.name}`);
      }
    }
  }

  throw lastError || new Error("Failed to stream chat response");
}
