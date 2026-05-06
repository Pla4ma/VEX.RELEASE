-- Phase 2.2: Focus Identity repository persistence and RLS

CREATE TABLE IF NOT EXISTS public.focus_score_current (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  current_score integer NOT NULL CHECK (current_score BETWEEN 300 AND 850),
  previous_score integer NOT NULL CHECK (previous_score BETWEEN 300 AND 850),
  band text NOT NULL,
  factors jsonb NOT NULL,
  last_change_reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.focus_score_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  occurred_at timestamptz NOT NULL,
  score integer NOT NULL CHECK (score BETWEEN 300 AND 850),
  delta integer NOT NULL,
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS focus_score_current_user_idx
  ON public.focus_score_current (user_id);

CREATE INDEX IF NOT EXISTS focus_score_history_user_occurred_idx
  ON public.focus_score_history (user_id, occurred_at DESC);

ALTER TABLE public.focus_score_current ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_score_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS focus_score_current_select_own ON public.focus_score_current;
DROP POLICY IF EXISTS focus_score_current_insert_own ON public.focus_score_current;
DROP POLICY IF EXISTS focus_score_current_update_own ON public.focus_score_current;
DROP POLICY IF EXISTS focus_score_current_delete_own ON public.focus_score_current;

CREATE POLICY focus_score_current_select_own
  ON public.focus_score_current
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY focus_score_current_insert_own
  ON public.focus_score_current
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY focus_score_current_update_own
  ON public.focus_score_current
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY focus_score_current_delete_own
  ON public.focus_score_current
  FOR DELETE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS focus_score_history_select_own ON public.focus_score_history;
DROP POLICY IF EXISTS focus_score_history_insert_own ON public.focus_score_history;
DROP POLICY IF EXISTS focus_score_history_update_own ON public.focus_score_history;
DROP POLICY IF EXISTS focus_score_history_delete_own ON public.focus_score_history;

CREATE POLICY focus_score_history_select_own
  ON public.focus_score_history
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY focus_score_history_insert_own
  ON public.focus_score_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY focus_score_history_update_own
  ON public.focus_score_history
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY focus_score_history_delete_own
  ON public.focus_score_history
  FOR DELETE
  USING (auth.uid() = user_id);
