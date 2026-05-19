CREATE TABLE IF NOT EXISTS public.companion_promises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_session_id UUID,
  promised_for DATE NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  window_end TIMESTAMPTZ NOT NULL,
  recommended_duration_minutes INTEGER NOT NULL CHECK (recommended_duration_minutes > 0),
  recommended_mode TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'fulfilled', 'missed', 'recovered', 'skipped')),
  fulfilled_session_id UUID,
  fulfilled_at TIMESTAMPTZ,
  missed_at TIMESTAMPTZ,
  recovery_session_id UUID,
  copy_seed JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS companion_promises_user_status_idx
  ON public.companion_promises(user_id, status, window_start);

CREATE INDEX IF NOT EXISTS companion_promises_user_created_idx
  ON public.companion_promises(user_id, created_at DESC);

ALTER TABLE public.companion_promises ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS companion_promises_owner_all ON public.companion_promises;

CREATE POLICY companion_promises_owner_all
  ON public.companion_promises
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.companion_promises TO authenticated;
