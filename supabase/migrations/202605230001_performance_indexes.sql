-- Add performance indexes for tables that have RLS but no explicit indexes.
-- These tables are queried by user_id and ordered by created_at in client code.

CREATE INDEX IF NOT EXISTS idx_xp_history_user_created
  ON public.xp_history(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_created
  ON public.user_achievements(user_id, created_at DESC);
