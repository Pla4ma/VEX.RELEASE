CREATE TABLE IF NOT EXISTS public.personal_bests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_mode TEXT NOT NULL,
  duration_bucket TEXT NOT NULL,
  best_purity_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  best_grade TEXT NOT NULL DEFAULT 'D',
  total_sessions INTEGER NOT NULL DEFAULT 1,
  achieved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, session_mode, duration_bucket)
);

ALTER TABLE public.personal_bests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user owns personal bests" ON public.personal_bests;
CREATE POLICY "user owns personal bests" ON public.personal_bests
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.personal_bests TO authenticated;

CREATE INDEX IF NOT EXISTS idx_personal_bests_user_updated
  ON public.personal_bests(user_id, updated_at DESC);
