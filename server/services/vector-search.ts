import "server-only";
import type { Document } from "@/types/database";
import { createServiceClient } from "@/lib/supabase/server";

// ─── Configuration ─────────────────────────────────────────────────────────────

const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_DIMENSIONS = 1536;
const DEFAULT_MATCH_COUNT = 5;
const DEFAULT_MATCH_THRESHOLD = 0.75;

// ─── Embedding Generation ──────────────────────────────────────────────────────

async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("No API key available for embedding generation");
  }

  const useOpenRouter = !process.env.OPENAI_API_KEY && !!process.env.OPENROUTER_API_KEY;
  const baseUrl = useOpenRouter
    ? "https://openrouter.ai/api/v1"
    : "https://api.openai.com/v1";

  const response = await fetch(`${baseUrl}/embeddings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: text,
      dimensions: EMBEDDING_DIMENSIONS,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Embedding generation failed (${response.status}): ${text}`);
  }

  const data = await response.json();
  return data.data[0].embedding as number[];
}

// ─── Document Ingestion ────────────────────────────────────────────────────────

export async function ingestDocument(doc: {
  title: string;
  content: string;
  source?: string;
  category?: string;
  metadata?: Record<string, unknown>;
}): Promise<Document | null> {
  const supabase = await createServiceClient();

  try {
    // Generate embedding for the document content
    const embedding = await generateEmbedding(
      `${doc.title}\n\n${doc.content}`
    );

    const { data, error } = await supabase
      .from("documents")
      .insert({
        title: doc.title,
        content: doc.content,
        source: doc.source ?? null,
        category: doc.category ?? null,
        metadata: doc.metadata ? JSON.stringify(doc.metadata) : null,
        embedding,
      })
      .select()
      .single();

    if (error) {
      console.error("[vector] ingestDocument error:", error);
      return null;
    }

    return data as Document;
  } catch (err) {
    console.error("[vector] ingestDocument failed:", err);
    return null;
  }
}

export async function ingestDocumentsBatch(
  docs: Array<{
    title: string;
    content: string;
    source?: string;
    category?: string;
    metadata?: Record<string, unknown>;
  }>
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (const doc of docs) {
    const result = await ingestDocument(doc);
    if (result) {
      success++;
    } else {
      failed++;
    }
    // Rate limit: pause between embeddings
    await new Promise((r) => setTimeout(r, 200));
  }

  return { success, failed };
}

// ─── Vector Search ─────────────────────────────────────────────────────────────

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  source: string | null;
  category: string | null;
  similarity: number;
}

export async function searchDocuments(
  query: string,
  options?: {
    matchCount?: number;
    matchThreshold?: number;
    category?: string;
  }
): Promise<SearchResult[]> {
  const supabase = await createServiceClient();

  try {
    const embedding = await generateEmbedding(query);

    const { data, error } = await supabase.rpc("match_documents", {
      query_embedding: embedding,
      match_count: options?.matchCount ?? DEFAULT_MATCH_COUNT,
      match_threshold: options?.matchThreshold ?? DEFAULT_MATCH_THRESHOLD,
      filter_category: options?.category ?? null,
    });

    if (error) {
      console.error("[vector] searchDocuments error:", error);
      return [];
    }

    return (data ?? []) as SearchResult[];
  } catch (err) {
    console.error("[vector] searchDocuments failed:", err);
    return [];
  }
}

// ─── RAG Context Builder ───────────────────────────────────────────────────────

export async function buildRAGContext(
  userQuery: string,
  options?: {
    matchCount?: number;
    matchThreshold?: number;
    category?: string;
  }
): Promise<string> {
  const results = await searchDocuments(userQuery, options);

  if (results.length === 0) return "";

  const contextChunks = results.map(
    (r, i) =>
      `[Source ${i + 1}: ${r.title}${r.source ? ` (${r.source})` : ""}]\n${r.content}`
  );

  return `\n\n## Relevant Knowledge Base Context\n\n${contextChunks.join("\n\n---\n\n")}`;
}

// ─── Document Management ───────────────────────────────────────────────────────

export async function listDocuments(
  options?: { category?: string; limit?: number }
): Promise<Omit<Document, "embedding">[]> {
  const supabase = await createServiceClient();

  let query = supabase
    .from("documents")
    .select("id, title, content, source, category, metadata, created_at, updated_at")
    .order("created_at", { ascending: false })
    .limit(options?.limit ?? 100);

  if (options?.category) {
    query = query.eq("category", options.category);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[vector] listDocuments error:", error);
    return [];
  }

  return (data ?? []) as Omit<Document, "embedding">[];
}

export async function deleteDocument(id: string): Promise<boolean> {
  const supabase = await createServiceClient();
  const { error } = await supabase.from("documents").delete().eq("id", id);
  return !error;
}

export async function updateDocumentEmbedding(id: string): Promise<boolean> {
  const supabase = await createServiceClient();

  const { data: doc } = await supabase
    .from("documents")
    .select("title, content")
    .eq("id", id)
    .single();

  if (!doc) return false;

  try {
    const embedding = await generateEmbedding(`${doc.title}\n\n${doc.content}`);
    const { error } = await supabase
      .from("documents")
      .update({ embedding, updated_at: new Date().toISOString() })
      .eq("id", id);
    return !error;
  } catch {
    return false;
  }
}
