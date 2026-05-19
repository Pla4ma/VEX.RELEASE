CREATE TABLE IF NOT EXISTS public.ai_quota_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  token_count INTEGER NOT NULL DEFAULT 0 CHECK (token_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_quota_log_user_created_idx
  ON public.ai_quota_log(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS ai_quota_log_user_category_created_idx
  ON public.ai_quota_log(user_id, category, created_at DESC);

ALTER TABLE public.ai_quota_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ai_quota_log_owner_select ON public.ai_quota_log;
DROP POLICY IF EXISTS ai_quota_log_owner_insert ON public.ai_quota_log;

CREATE POLICY ai_quota_log_owner_select
  ON public.ai_quota_log
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY ai_quota_log_owner_insert
  ON public.ai_quota_log
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

GRANT SELECT, INSERT ON public.ai_quota_log TO authenticated;
