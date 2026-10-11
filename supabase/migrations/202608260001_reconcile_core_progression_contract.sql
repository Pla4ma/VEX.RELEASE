-- VEX core progression contract reconciliation.
-- Expand-only migration: preserve generic metadata rows while adding the
-- columns required by the active client repositories and idempotent writes.

ALTER TABLE public.progression
  ADD COLUMN IF NOT EXISTS level INTEGER,
  ADD COLUMN IF NOT EXISTS xp INTEGER,
  ADD COLUMN IF NOT EXISTS total_xp INTEGER,
  ADD COLUMN IF NOT EXISTS next_level_threshold INTEGER,
  ADD COLUMN IF NOT EXISTS last_level_up_at BIGINT;

UPDATE public.progression
SET
  level = COALESCE(level, CASE
    WHEN metadata ? 'level' AND (metadata->>'level') ~ '^[0-9]+$'
      THEN (metadata->>'level')::INTEGER
    ELSE 1
  END),
  xp = COALESCE(xp, CASE
    WHEN metadata ? 'xp' AND (metadata->>'xp') ~ '^[0-9]+$'
      THEN (metadata->>'xp')::INTEGER
    ELSE 0
  END),
  total_xp = COALESCE(total_xp, CASE
    WHEN metadata ? 'total_xp' AND (metadata->>'total_xp') ~ '^[0-9]+$'
      THEN (metadata->>'total_xp')::INTEGER
    ELSE 0
  END),
  next_level_threshold = COALESCE(next_level_threshold, 100)
WHERE level IS NULL
   OR xp IS NULL
   OR total_xp IS NULL
   OR next_level_threshold IS NULL;

ALTER TABLE public.progression
  ALTER COLUMN level SET DEFAULT 1,
  ALTER COLUMN xp SET DEFAULT 0,
  ALTER COLUMN total_xp SET DEFAULT 0,
  ALTER COLUMN next_level_threshold SET DEFAULT 100;

ALTER TABLE public.xp_history
  ADD COLUMN IF NOT EXISTS amount INTEGER,
  ADD COLUMN IF NOT EXISTS source TEXT,
  ADD COLUMN IF NOT EXISTS session_id UUID,
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT;

UPDATE public.xp_history
SET
  amount = CASE
    WHEN metadata ? 'amount' AND (metadata->>'amount') ~ '^[0-9]+$'
      THEN (metadata->>'amount')::INTEGER
    ELSE amount
  END,
  source = COALESCE(source, NULLIF(metadata->>'source', ''))
WHERE amount IS NULL OR source IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS xp_history_user_idempotency_key_uq
  ON public.xp_history (user_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

ALTER TABLE public.level_up_history
  ADD COLUMN IF NOT EXISTS level INTEGER,
  ADD COLUMN IF NOT EXISTS xp_at_level INTEGER,
  ADD COLUMN IF NOT EXISTS achieved_at BIGINT,
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT;

UPDATE public.level_up_history
SET
  level = CASE
    WHEN metadata ? 'level' AND (metadata->>'level') ~ '^[0-9]+$'
      THEN (metadata->>'level')::INTEGER
    ELSE level
  END,
  xp_at_level = CASE
    WHEN metadata ? 'xp_at_level' AND (metadata->>'xp_at_level') ~ '^[0-9]+$'
      THEN (metadata->>'xp_at_level')::INTEGER
    ELSE xp_at_level
  END,
  achieved_at = CASE
    WHEN metadata ? 'achieved_at' AND (metadata->>'achieved_at') ~ '^[0-9]+$'
      THEN (metadata->>'achieved_at')::BIGINT
    ELSE achieved_at
  END
WHERE level IS NULL OR xp_at_level IS NULL OR achieved_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS level_up_history_user_idempotency_key_uq
  ON public.level_up_history (user_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS progression_user_id_uq
  ON public.progression (user_id)
  WHERE user_id IS NOT NULL;
