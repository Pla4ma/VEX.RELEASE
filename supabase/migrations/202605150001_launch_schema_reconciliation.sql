-- Phase 1 launch schema reconciliation for repository contracts missing from
-- version-controlled SQL. Existing tables are left intact by IF NOT EXISTS.

CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mode TEXT,
  difficulty TEXT,
  duration INTEGER NOT NULL DEFAULT 0,
  effective_duration INTEGER,
  quality_score NUMERIC(5,2),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','completed','cancelled','failed')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS mode TEXT;
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS difficulty TEXT;
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS duration INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS effective_duration INTEGER;
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS quality_score NUMERIC(5,2);
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS ended_at TIMESTAMPTZ;
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}';
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE TABLE IF NOT EXISTS public.session_completion_ledgers (
  ledger_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  idempotency_key TEXT NOT NULL UNIQUE,
  ledger_payload JSONB NOT NULL,
  offline_sync_status TEXT CHECK (offline_sync_status IN ('pending','synced','failed')),
  completed_at BIGINT NOT NULL,
  created_at BIGINT NOT NULL DEFAULT floor(extract(epoch from clock_timestamp()) * 1000)
);

CREATE TABLE IF NOT EXISTS public.reward_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  idempotency_key TEXT NOT NULL UNIQUE,
  reward_type TEXT NOT NULL,
  amount INTEGER NOT NULL DEFAULT 0,
  currency TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','delivered','failed','expired')),
  source_event TEXT NOT NULL,
  delivered_at TIMESTAMPTZ,
  failed_reason TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  currency TEXT NOT NULL,
  amount INTEGER NOT NULL,
  balance_before INTEGER NOT NULL DEFAULT 0,
  balance_after INTEGER NOT NULL DEFAULT 0,
  source TEXT NOT NULL,
  source_id TEXT,
  description TEXT,
  metadata JSONB,
  created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  current_days INTEGER NOT NULL DEFAULT 0,
  longest_days INTEGER NOT NULL DEFAULT 0,
  last_qualifying_session_at BIGINT,
  current_day_completed_at BIGINT,
  frozen_until BIGINT,
  shields_available INTEGER NOT NULL DEFAULT 0,
  grace_period_used BOOLEAN NOT NULL DEFAULT false,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.streak_shields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  used_at BIGINT,
  created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.streak_repair_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  previous_streak INTEGER NOT NULL,
  target_restore_days INTEGER NOT NULL,
  sessions_completed INTEGER NOT NULL DEFAULT 0,
  sessions_required INTEGER NOT NULL,
  started_at BIGINT NOT NULL,
  expires_at BIGINT NOT NULL,
  status TEXT NOT NULL,
  session_ids TEXT[] NOT NULL DEFAULT '{}',
  completed_at BIGINT,
  updated_at BIGINT
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  body TEXT,
  type TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.reminder_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL,
  scheduled_for BIGINT NOT NULL,
  delivery_method TEXT NOT NULL,
  status TEXT NOT NULL,
  context JSONB NOT NULL DEFAULT '{}',
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  UNIQUE(user_id, reminder_type)
);

CREATE TABLE IF NOT EXISTS public.push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  token TEXT NOT NULL,
  platform TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.purchase_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_item_id TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price_currency TEXT,
  unit_price_amount INTEGER,
  total_price_currency TEXT,
  total_price_amount INTEGER,
  status TEXT NOT NULL,
  error_code TEXT,
  error_message TEXT,
  inventory_item_ids TEXT[],
  refunded_at BIGINT,
  refund_reason TEXT,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS sessions_user_completed_idx ON public.sessions(user_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS completion_ledgers_user_idx ON public.session_completion_ledgers(user_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS reward_ledger_user_status_idx ON public.reward_ledger(user_id, status);
CREATE INDEX IF NOT EXISTS wallet_transactions_user_created_idx ON public.wallet_transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS streak_shields_user_available_idx ON public.streak_shields(user_id, used);
CREATE INDEX IF NOT EXISTS streak_repair_user_status_idx ON public.streak_repair_quests(user_id, status);
CREATE INDEX IF NOT EXISTS notifications_user_read_idx ON public.notifications(user_id, read, created_at DESC);
CREATE INDEX IF NOT EXISTS reminder_plans_due_idx ON public.reminder_plans(status, scheduled_for);
CREATE INDEX IF NOT EXISTS purchase_attempts_user_created_idx ON public.purchase_attempts(user_id, created_at DESC);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_completion_ledgers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streak_shields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streak_repair_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS sessions_owner_all ON public.sessions;
DROP POLICY IF EXISTS session_completion_ledgers_owner_all ON public.session_completion_ledgers;
DROP POLICY IF EXISTS reward_ledger_owner_all ON public.reward_ledger;
DROP POLICY IF EXISTS wallet_transactions_owner_all ON public.wallet_transactions;
DROP POLICY IF EXISTS streaks_owner_all ON public.streaks;
DROP POLICY IF EXISTS streak_shields_owner_all ON public.streak_shields;
DROP POLICY IF EXISTS streak_repair_quests_owner_all ON public.streak_repair_quests;
DROP POLICY IF EXISTS notifications_owner_all ON public.notifications;
DROP POLICY IF EXISTS reminder_plans_owner_all ON public.reminder_plans;
DROP POLICY IF EXISTS push_tokens_owner_all ON public.push_tokens;
DROP POLICY IF EXISTS purchase_attempts_owner_all ON public.purchase_attempts;

CREATE POLICY sessions_owner_all ON public.sessions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY session_completion_ledgers_owner_all ON public.session_completion_ledgers FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY reward_ledger_owner_all ON public.reward_ledger FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY wallet_transactions_owner_all ON public.wallet_transactions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY streaks_owner_all ON public.streaks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY streak_shields_owner_all ON public.streak_shields FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY streak_repair_quests_owner_all ON public.streak_repair_quests FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY notifications_owner_all ON public.notifications FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY reminder_plans_owner_all ON public.reminder_plans FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY push_tokens_owner_all ON public.push_tokens FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY purchase_attempts_owner_all ON public.purchase_attempts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
