CREATE TABLE IF NOT EXISTS public.focus_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_description TEXT NOT NULL CHECK (char_length(task_description) BETWEEN 3 AND 80),
  completion_status TEXT CHECK (completion_status IN ('done', 'partial', 'not_done', 'skipped')) DEFAULT NULL,
  reflection_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.focus_contracts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user owns contract" ON public.focus_contracts;
CREATE POLICY "user owns contract" ON public.focus_contracts
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.focus_contracts TO authenticated;

CREATE INDEX IF NOT EXISTS idx_focus_contracts_user_session
  ON public.focus_contracts(user_id, session_id);

CREATE INDEX IF NOT EXISTS idx_focus_contracts_user_created
  ON public.focus_contracts(user_id, created_at DESC);
