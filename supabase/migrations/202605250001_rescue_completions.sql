CREATE TABLE IF NOT EXISTS rescue_completions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  lane TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  outcome TEXT NOT NULL CHECK (outcome IN ('completed', 'partial', 'abandoned')),
  worked BOOLEAN NOT NULL DEFAULT false,
  next_recommendation TEXT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE rescue_completions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user owns rescue completions" ON rescue_completions;
CREATE POLICY "user owns rescue completions" ON rescue_completions
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_rescue_completions_user
  ON rescue_completions(user_id, completed_at DESC);

CREATE INDEX IF NOT EXISTS idx_rescue_completions_recent
  ON rescue_completions(user_id, created_at DESC)
  INCLUDE (outcome, worked);
