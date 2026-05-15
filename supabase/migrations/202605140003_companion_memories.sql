CREATE TABLE IF NOT EXISTS companion_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  session_id UUID REFERENCES public.user_sessions(id) ON DELETE SET NULL,
  session_date DATE NOT NULL,
  grade TEXT DEFAULT NULL,
  purity_score NUMERIC(5,2) DEFAULT NULL,
  streak_day INTEGER DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, type)
);

ALTER TABLE companion_memories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user owns memories" ON companion_memories;
CREATE POLICY "user owns memories" ON companion_memories
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_companion_memories_user
  ON companion_memories(user_id, created_at DESC);
