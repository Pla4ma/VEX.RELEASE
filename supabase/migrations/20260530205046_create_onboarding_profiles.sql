-- onboarding_profiles: server-side persistence for onboarding progress.
-- Currently only stored in MMKV/Zustand — this table backs cross-device sync.

CREATE TABLE IF NOT EXISTS public.onboarding_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'IN_PROGRESS',
  steps JSONB NOT NULL DEFAULT '{"profileStarted":false,"goalSelected":false,"firstSessionStarted":false,"firstSessionCompleted":false,"rewardSeen":false}',
  first_session JSONB NOT NULL DEFAULT '{}',
  permissions JSONB NOT NULL DEFAULT '{"notificationAsked":false,"notificationGranted":false}',
  goal TEXT,
  focus_duration INTEGER,
  display_name TEXT,
  persona TEXT,
  element TEXT,
  motivation_profile JSONB,
  chosen_lane TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.onboarding_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS onboarding_profiles_owner_all ON public.onboarding_profiles;
CREATE POLICY onboarding_profiles_owner_all ON public.onboarding_profiles
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_onboarding_profiles_user
  ON public.onboarding_profiles(user_id);
