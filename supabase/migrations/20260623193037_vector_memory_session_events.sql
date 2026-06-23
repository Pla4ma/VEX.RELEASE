-- Database vector memory and session event ledger.
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

CREATE TABLE IF NOT EXISTS public.ai_memory_vectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_table TEXT NOT NULL,
  source_id UUID NOT NULL,
  memory_type TEXT NOT NULL,
  content TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  embedding extensions.vector(1536) NOT NULL,
  embedding_model TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_referenced_at TIMESTAMPTZ DEFAULT NULL,
  reference_count INTEGER NOT NULL DEFAULT 0 CHECK (reference_count >= 0),
  deleted_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, source_table, source_id, content_hash)
);

CREATE INDEX IF NOT EXISTS ai_memory_vectors_user_type_idx
  ON public.ai_memory_vectors (user_id, memory_type, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ai_memory_vectors_embedding_hnsw
  ON public.ai_memory_vectors USING hnsw (embedding extensions.vector_cosine_ops)
  WHERE deleted_at IS NULL;

ALTER TABLE public.ai_memory_vectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_memory_vectors FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.ai_memory_vectors FROM anon;
GRANT SELECT ON TABLE public.ai_memory_vectors TO authenticated;
GRANT ALL ON TABLE public.ai_memory_vectors TO service_role;

DROP POLICY IF EXISTS ai_memory_vectors_owner_read ON public.ai_memory_vectors;
CREATE POLICY ai_memory_vectors_owner_read
  ON public.ai_memory_vectors FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS ai_memory_vectors_service_all ON public.ai_memory_vectors;
CREATE POLICY ai_memory_vectors_service_all
  ON public.ai_memory_vectors FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.match_ai_memories(
  query_embedding extensions.vector(1536),
  match_count INT DEFAULT 8,
  match_threshold DOUBLE PRECISION DEFAULT 0.72,
  memory_type_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  source_table TEXT,
  source_id UUID,
  memory_type TEXT,
  content TEXT,
  metadata JSONB,
  similarity DOUBLE PRECISION
)
LANGUAGE SQL
STABLE
SECURITY INVOKER
SET search_path = public, extensions
AS $$
  SELECT
    m.id, m.source_table, m.source_id, m.memory_type, m.content, m.metadata,
    1 - (m.embedding <=> query_embedding) AS similarity
  FROM public.ai_memory_vectors m
  WHERE m.user_id = (select auth.uid())
    AND m.deleted_at IS NULL
    AND (memory_type_filter IS NULL OR m.memory_type = memory_type_filter)
    AND 1 - (m.embedding <=> query_embedding) >= match_threshold
  ORDER BY m.embedding <=> query_embedding
  LIMIT LEAST(GREATEST(match_count, 1), 20);
$$;

REVOKE ALL ON FUNCTION public.match_ai_memories(extensions.vector, INT, DOUBLE PRECISION, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.match_ai_memories(extensions.vector, INT, DOUBLE PRECISION, TEXT) TO authenticated;

CREATE TABLE IF NOT EXISTS public.session_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  event_version INTEGER NOT NULL DEFAULT 1 CHECK (event_version > 0),
  event_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  idempotency_key TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sequence_number BIGINT GENERATED ALWAYS AS IDENTITY,
  UNIQUE (user_id, session_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS session_events_user_session_sequence_idx
  ON public.session_events (user_id, session_id, sequence_number);

CREATE INDEX IF NOT EXISTS session_events_user_type_occurred_idx
  ON public.session_events (user_id, event_type, occurred_at DESC);

ALTER TABLE public.session_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_events FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.session_events FROM anon;
GRANT SELECT ON TABLE public.session_events TO authenticated;
GRANT ALL ON TABLE public.session_events TO service_role;

DROP POLICY IF EXISTS session_events_owner_read ON public.session_events;
CREATE POLICY session_events_owner_read
  ON public.session_events FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS session_events_service_all ON public.session_events;
CREATE POLICY session_events_service_all
  ON public.session_events FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.record_session_event(
  p_user_id UUID,
  p_session_id UUID,
  p_event_type TEXT,
  p_event_payload JSONB,
  p_idempotency_key TEXT,
  p_occurred_at TIMESTAMPTZ DEFAULT now()
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_event public.session_events%ROWTYPE;
  v_inserted BOOLEAN := false;
BEGIN
  IF (select auth.uid()) IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'record_session_event owner mismatch';
  END IF;
  IF p_idempotency_key IS NULL OR length(trim(p_idempotency_key)) = 0 THEN
    RAISE EXCEPTION 'record_session_event requires idempotency key';
  END IF;

  INSERT INTO public.session_events (user_id, session_id, event_type, event_payload, idempotency_key, occurred_at)
  VALUES (p_user_id, p_session_id, p_event_type, COALESCE(p_event_payload, '{}'::jsonb), p_idempotency_key, p_occurred_at)
  ON CONFLICT (user_id, session_id, idempotency_key) DO NOTHING
  RETURNING * INTO v_event;

  IF v_event.id IS NOT NULL THEN
    v_inserted := true;
  ELSE
    SELECT * INTO v_event
    FROM public.session_events
    WHERE user_id = p_user_id AND session_id = p_session_id AND idempotency_key = p_idempotency_key;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'event_id', v_event.id,
    'sequence_number', v_event.sequence_number,
    'duplicate', NOT v_inserted
  );
END;
$$;

REVOKE ALL ON FUNCTION public.record_session_event(UUID, UUID, TEXT, JSONB, TEXT, TIMESTAMPTZ) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_session_event(UUID, UUID, TEXT, JSONB, TEXT, TIMESTAMPTZ) TO authenticated;

CREATE OR REPLACE FUNCTION public.prevent_session_event_mutation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  RAISE EXCEPTION 'session_events is append-only';
END;
$$;

DROP TRIGGER IF EXISTS session_events_prevent_update_delete ON public.session_events;
CREATE TRIGGER session_events_prevent_update_delete
  BEFORE UPDATE OR DELETE ON public.session_events
  FOR EACH ROW EXECUTE FUNCTION public.prevent_session_event_mutation();

COMMENT ON TABLE public.ai_memory_vectors IS 'User-owned pgvector memory for AI personalization.';
COMMENT ON TABLE public.session_events IS 'Append-only event-sourced session ledger.';
