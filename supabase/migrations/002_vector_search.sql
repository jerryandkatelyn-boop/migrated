-- ============================================================
-- RECOIL AI — Vector Search (RAG Foundation)
-- Migration: 002_vector_search.sql
-- Requires: pgvector extension enabled in Supabase Dashboard
--           Database > Extensions > vector (enable it first)
-- ============================================================

-- ── pgvector Extension ────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS vector;

-- ── Documents Table ───────────────────────────────────────────────────────────
-- Stores knowledge base documents with vector embeddings.
-- Used for RAG (Retrieval-Augmented Generation).

CREATE TABLE IF NOT EXISTS public.documents (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title      TEXT NOT NULL,
  content    TEXT NOT NULL,
  source     TEXT,       -- URL, file path, or manual
  category   TEXT,       -- 'roblox-api', 'tutorial', 'snippet', etc.
  metadata   TEXT,       -- JSON string for arbitrary metadata
  embedding  VECTOR(1536), -- OpenAI text-embedding-3-small dimensions
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_category ON public.documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_source   ON public.documents(source);

-- IVFFlat index for approximate nearest-neighbor search.
-- Requires at least 100 rows before it becomes effective.
-- Replace with HNSW for better recall at higher list counts.
CREATE INDEX IF NOT EXISTS idx_documents_embedding
  ON public.documents
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- ── Vector Search Function ────────────────────────────────────────────────────
-- Called from TypeScript via supabase.rpc('match_documents', {...})

CREATE OR REPLACE FUNCTION public.match_documents(
  query_embedding   VECTOR(1536),
  match_count       INT     DEFAULT 5,
  match_threshold   FLOAT   DEFAULT 0.75,
  filter_category   TEXT    DEFAULT NULL
)
RETURNS TABLE (
  id          UUID,
  title       TEXT,
  content     TEXT,
  source      TEXT,
  category    TEXT,
  similarity  FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.title,
    d.content,
    d.source,
    d.category,
    1 - (d.embedding <=> query_embedding) AS similarity
  FROM public.documents d
  WHERE
    d.embedding IS NOT NULL
    AND (filter_category IS NULL OR d.category = filter_category)
    AND 1 - (d.embedding <=> query_embedding) > match_threshold
  ORDER BY d.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ── Keyword Search Fallback ───────────────────────────────────────────────────
-- Full-text search using PostgreSQL tsvector (no embeddings needed).
-- Useful when no embedding is available or as a hybrid search fallback.

ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS fts TSVECTOR
    GENERATED ALWAYS AS (to_tsvector('english', title || ' ' || content)) STORED;

CREATE INDEX IF NOT EXISTS idx_documents_fts ON public.documents USING gin(fts);

CREATE OR REPLACE FUNCTION public.search_documents_text(
  query_text  TEXT,
  match_count INT  DEFAULT 5
)
RETURNS TABLE (
  id       UUID,
  title    TEXT,
  content  TEXT,
  source   TEXT,
  category TEXT,
  rank     FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.title,
    d.content,
    d.source,
    d.category,
    ts_rank(d.fts, plainto_tsquery('english', query_text))::FLOAT AS rank
  FROM public.documents d
  WHERE d.fts @@ plainto_tsquery('english', query_text)
  ORDER BY rank DESC
  LIMIT match_count;
END;
$$;

-- ── Updated-At Trigger ────────────────────────────────────────────────────────
CREATE TRIGGER set_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Seed: Example Roblox Knowledge Base Documents ────────────────────────────
-- These do NOT have embeddings yet. Run update_document_embedding() on each
-- via the admin panel or a one-time ingestion script after deployment.

INSERT INTO public.documents (title, content, source, category) VALUES
  (
    'RemoteEvents vs RemoteFunctions',
    'RemoteEvents are used for one-way communication (fire and forget). FireServer sends from client to server, FireClient sends from server to specific client, FireAllClients sends to all clients. RemoteFunctions are for two-way communication with a return value. InvokeServer blocks the client and waits for the server to return a value. Never use InvokeClient as it can be exploited.',
    'manual',
    'roblox-api'
  ),
  (
    'DataStore Best Practices',
    'Always use pcall() when accessing DataStores. Implement session locking to prevent data loss. Use UpdateAsync instead of SetAsync for concurrent updates. Implement retry logic with exponential backoff. Store data as a single table rather than multiple keys to reduce API calls.',
    'manual',
    'roblox-api'
  ),
  (
    'Luau Type System',
    'Luau supports gradual typing. Use type annotations like: local x: number = 5. Define interfaces with type MyType = { name: string, value: number }. Use typeof() for type narrowing. Strict mode (--!strict) enforces full type checking. Export types from ModuleScripts for reuse.',
    'manual',
    'roblox-api'
  )
ON CONFLICT DO NOTHING;
