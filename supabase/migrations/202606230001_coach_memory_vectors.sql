CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

ALTER TABLE public.coach_memories
  ADD COLUMN IF NOT EXISTS embedding extensions.vector(1536),
  ADD COLUMN IF NOT EXISTS embedding_model TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS embedded_at TIMESTAMPTZ DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_coach_memories_embedding_hnsw
  ON public.coach_memories
  USING hnsw (embedding extensions.vector_cosine_ops)
  WHERE deleted_at IS NULL AND embedding IS NOT NULL;

CREATE OR REPLACE FUNCTION public.match_coach_memories(
  query_embedding extensions.vector(1536),
  match_count INT DEFAULT 8,
  match_threshold DOUBLE PRECISION DEFAULT 0.72
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  type TEXT,
  title TEXT,
  description TEXT,
  occurred_at TIMESTAMPTZ,
  metadata JSONB,
  referenced_count INT,
  last_referenced_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  evidence_hash TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  similarity DOUBLE PRECISION
)
LANGUAGE SQL
STABLE
SECURITY INVOKER
SET search_path = public, extensions
AS $$
  SELECT
    coach_memories.id,
    coach_memories.user_id,
    coach_memories.type,
    coach_memories.title,
    coach_memories.description,
    coach_memories.occurred_at,
    coach_memories.metadata,
    coach_memories.referenced_count,
    coach_memories.last_referenced_at,
    coach_memories.deleted_at,
    coach_memories.evidence_hash,
    coach_memories.created_at,
    coach_memories.updated_at,
    1 - (coach_memories.embedding <=> query_embedding) AS similarity
  FROM public.coach_memories
  WHERE coach_memories.user_id = auth.uid()
    AND coach_memories.deleted_at IS NULL
    AND coach_memories.embedding IS NOT NULL
    AND 1 - (coach_memories.embedding <=> query_embedding) >= match_threshold
  ORDER BY coach_memories.embedding <=> query_embedding
  LIMIT LEAST(GREATEST(match_count, 1), 20);
$$;

COMMENT ON COLUMN public.coach_memories.embedding
  IS '1536-dimension semantic embedding for AI coach memory retrieval.';
COMMENT ON FUNCTION public.match_coach_memories
  IS 'Returns active user-scoped coach memories ranked by pgvector cosine similarity.';
