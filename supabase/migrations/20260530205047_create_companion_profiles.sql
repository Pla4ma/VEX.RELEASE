-- companion_profiles: server-side persistence for companion state.
-- Merges the MMKV profile (companion-profile-ops) and the live companion
-- state (companion-schemas) into a single Supabase table.

CREATE TABLE IF NOT EXISTS public.companion_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Vexling',
  profile_type TEXT NOT NULL DEFAULT 'focus_wisp',
  phase TEXT NOT NULL DEFAULT 'EGG',
  level INTEGER NOT NULL DEFAULT 1,
  xp INTEGER NOT NULL DEFAULT 0,
  total_focus_minutes INTEGER NOT NULL DEFAULT 0,
  element TEXT NOT NULL DEFAULT 'FLAME',
  element_affinity INTEGER NOT NULL DEFAULT 75,
  current_mood TEXT NOT NULL DEFAULT 'SLEEPY',
  session_progress INTEGER NOT NULL DEFAULT 0,
  purity_score INTEGER NOT NULL DEFAULT 85,
  energy_level INTEGER NOT NULL DEFAULT 50,
  visual_seed INTEGER NOT NULL DEFAULT 42,
  color_hue INTEGER NOT NULL DEFAULT 15,
  particle_density REAL NOT NULL DEFAULT 0.8,
  session_count INTEGER NOT NULL DEFAULT 0,
  perfect_sessions INTEGER NOT NULL DEFAULT 0,
  longest_focus_streak INTEGER NOT NULL DEFAULT 0,
  next_evolution_at INTEGER NOT NULL DEFAULT 0,
  special_ability_charge INTEGER NOT NULL DEFAULT 0,
  equipped_items JSONB NOT NULL DEFAULT '[]',
  unlocked_abilities JSONB NOT NULL DEFAULT '[]',
  last_fed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_petted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.companion_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS companion_profiles_owner_all ON public.companion_profiles;
CREATE POLICY companion_profiles_owner_all ON public.companion_profiles
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_companion_profiles_user
  ON public.companion_profiles(user_id);
