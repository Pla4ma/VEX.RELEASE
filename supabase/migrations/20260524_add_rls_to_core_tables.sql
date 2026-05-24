-- Fix: Add RLS to core tables that were created without Row Level Security.
-- These tables previously had NO access control — any authenticated user
-- could read/write any other user's data.

-- === sessions ===
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS sessions_owner_all ON public.sessions;
CREATE POLICY sessions_owner_all ON public.sessions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- === streaks ===
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS streaks_owner_all ON public.streaks;
CREATE POLICY streaks_owner_all ON public.streaks
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- === streak_shields ===
ALTER TABLE public.streak_shields ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS streak_shields_owner_all ON public.streak_shields;
CREATE POLICY streak_shields_owner_all ON public.streak_shields
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- === streak_repair_quests ===
ALTER TABLE public.streak_repair_quests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS streak_repair_quests_owner_all ON public.streak_repair_quests;
CREATE POLICY streak_repair_quests_owner_all ON public.streak_repair_quests
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- === reward_ledger ===
ALTER TABLE public.reward_ledger ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS reward_ledger_owner_all ON public.reward_ledger;
CREATE POLICY reward_ledger_owner_all ON public.reward_ledger
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- === wallet_transactions ===
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS wallet_transactions_owner_all ON public.wallet_transactions;
CREATE POLICY wallet_transactions_owner_all ON public.wallet_transactions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- === session_stories ===
ALTER TABLE public.session_stories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS session_stories_owner_all ON public.session_stories;
CREATE POLICY session_stories_owner_all ON public.session_stories
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- === Performance indexes for the newly-RLS-enabled tables ===
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_streaks_user_id ON public.streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_streak_shields_user_id ON public.streak_shields(user_id);
CREATE INDEX IF NOT EXISTS idx_streak_repair_quests_user_id ON public.streak_repair_quests(user_id);
CREATE INDEX IF NOT EXISTS idx_reward_ledger_user_id ON public.reward_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON public.wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_session_stories_user_id ON public.session_stories(user_id);
