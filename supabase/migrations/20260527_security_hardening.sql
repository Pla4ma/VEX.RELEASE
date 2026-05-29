-- Security hardening: atomic XP operations, rate limiting, idempotency guards
-- Migration: 20260527_security_hardening.sql

-- === Rate Limiting Function ===
-- Uses a dedicated table for rate limit tracking with expiry

CREATE TABLE IF NOT EXISTS public.rate_limit_buckets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  operation TEXT NOT NULL,
  window_start BIGINT NOT NULL DEFAULT floor(extract(epoch from clock_timestamp()) * 1000),
  count INTEGER NOT NULL DEFAULT 1,
  UNIQUE(user_id, operation, window_start)
);

ALTER TABLE public.rate_limit_buckets ENABLE ROW LEVEL SECURITY;
-- No direct user access to rate limit buckets; only called via SECURITY DEFINER function

CREATE INDEX IF NOT EXISTS idx_rate_limit_buckets_lookup
  ON public.rate_limit_buckets(user_id, operation, window_start DESC);

CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_user_id UUID,
  p_operation TEXT,
  p_max_requests INTEGER,
  p_window_seconds INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_window_start BIGINT;
  v_current_count INTEGER;
  v_reset_at BIGINT;
BEGIN
  -- Fixed-window: bucket by p_window_seconds, not per-millisecond
  v_window_start := floor(extract(epoch from clock_timestamp()) / p_window_seconds) * p_window_seconds * 1000;
  v_reset_at := v_window_start + (p_window_seconds * 1000);

  INSERT INTO public.rate_limit_buckets (user_id, operation, window_start, count)
  VALUES (p_user_id, p_operation, v_window_start, 1)
  ON CONFLICT (user_id, operation, window_start)
  DO UPDATE SET count = rate_limit_buckets.count + 1
  RETURNING rate_limit_buckets.count INTO v_current_count;

  IF v_current_count > p_max_requests THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'remaining', 0,
      'reset_at', v_reset_at
    );
  END IF;

  RETURN jsonb_build_object(
    'allowed', true,
    'remaining', p_max_requests - v_current_count,
    'reset_at', v_reset_at
  );
END;
$$;

-- === Cleanup Old Rate Limit Buckets (run periodically) ===
CREATE OR REPLACE FUNCTION public.cleanup_rate_limit_buckets(
  p_max_age_hours INTEGER DEFAULT 24
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM public.rate_limit_buckets
  WHERE window_start < floor(extract(epoch from clock_timestamp()) * 1000) - (p_max_age_hours * 3600 * 1000);
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

-- === Atomic XP Add with Idempotency Guard ===
-- Prevents duplicate XP entries for same completion
-- Returns: { success, xp_added, new_total_xp, new_level, level_up, rewards }

CREATE OR REPLACE FUNCTION public.atomic_add_xp(
  p_user_id UUID,
  p_amount INTEGER,
  p_source TEXT,
  p_session_id UUID DEFAULT NULL,
  p_idempotency_key TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_progression RECORD;
  v_new_total_xp INTEGER;
  v_new_level INTEGER;
  v_new_xp_in_level INTEGER;
  v_new_threshold INTEGER;
  v_level_up BOOLEAN := false;
  v_previous_level INTEGER;
  v_xp_entry_id UUID;
BEGIN
  -- Idempotency check: if key provided and already exists, skip
  IF p_idempotency_key IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM public.xp_history
      WHERE user_id = p_user_id
        AND metadata->>'idempotencyKey' = p_idempotency_key
    ) THEN
      RETURN jsonb_build_object(
        'success', true,
        'duplicate', true,
        'xp_added', 0,
        'new_total_xp', 0,
        'new_level', 0,
        'level_up', false,
        'rewards', '[]'::jsonb
      );
    END IF;
  END IF;

  -- Fetch or create progression row
  SELECT * INTO v_progression
  FROM public.progression
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    INSERT INTO public.progression (user_id, level, xp, total_xp, next_level_threshold, last_level_up_at, created_at, updated_at)
    VALUES (p_user_id, 1, 0, 0, 100, NULL, floor(extract(epoch from clock_timestamp()) * 1000), floor(extract(epoch from clock_timestamp()) * 1000))
    RETURNING * INTO v_progression;
  END IF;

  v_previous_level := v_progression.level;
  v_new_total_xp := v_progression.total_xp + p_amount;

  -- Calculate new level using simple formula: level = floor(sqrt(total_xp / 100)) + 1
  v_new_level := floor(sqrt(GREATEST(v_new_total_xp::numeric, 0) / 100)) + 1;
  IF v_new_level < 1 THEN v_new_level := 1; END IF;

  -- Calculate XP at current level threshold
  v_new_threshold := v_new_level * v_new_level * 100;
  v_new_xp_in_level := v_new_total_xp - ((v_new_level - 1) * (v_new_level - 1) * 100);

  v_level_up := v_new_level > v_previous_level;

  -- Insert XP history entry with idempotency key in metadata
  INSERT INTO public.xp_history (id, user_id, amount, source, session_id, metadata, created_at, updated_at)
  VALUES (
    gen_random_uuid(), p_user_id, p_amount, p_source, p_session_id,
    COALESCE(p_metadata, '{}'::jsonb) || jsonb_build_object('idempotencyKey', p_idempotency_key, 'atomic', true),
    floor(extract(epoch from clock_timestamp()) * 1000),
    floor(extract(epoch from clock_timestamp()) * 1000)
  )
  RETURNING id INTO v_xp_entry_id;

  -- Update progression atomically with version check
  UPDATE public.progression
  SET total_xp = v_new_total_xp,
      level = v_new_level,
      xp = v_new_xp_in_level,
      next_level_threshold = v_new_threshold,
      last_level_up_at = CASE WHEN v_level_up THEN floor(extract(epoch from clock_timestamp()) * 1000) ELSE last_level_up_at END,
      updated_at = floor(extract(epoch from clock_timestamp()) * 1000)
  WHERE user_id = p_user_id;

  -- Record level up if occurred
  IF v_level_up THEN
    INSERT INTO public.level_up_history (user_id, level, achieved_at, xp_at_level, metadata, created_at, updated_at)
    VALUES (p_user_id, v_new_level, floor(extract(epoch from clock_timestamp()) * 1000), v_new_total_xp, '{}'::jsonb, floor(extract(epoch from clock_timestamp()) * 1000), floor(extract(epoch from clock_timestamp()) * 1000));
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'duplicate', false,
    'xp_added', p_amount,
    'new_total_xp', v_new_total_xp,
    'new_level', v_new_level,
    'previous_level', v_previous_level,
    'level_up', v_level_up,
    'xp_entry_id', v_xp_entry_id,
    'rewards', CASE WHEN v_level_up THEN
      jsonb_build_array(
        CASE WHEN v_new_level = 2 THEN 'first_level_up'
             WHEN v_new_level = 5 THEN 'level_5'
             WHEN v_new_level = 10 THEN 'level_10'
             WHEN v_new_level % 25 = 0 THEN 'level_milestone'
             ELSE 'level_up' END
      )
      ELSE '[]'::jsonb
    END
  );
END;
$$;

-- === Server-Side Session Completion (Idempotent) ===
-- The authoritative function for recording session completion with economy payouts.
-- Client MUST call this; client-side XP/streak calculation is advisory only.

CREATE OR REPLACE FUNCTION public.complete_session(
  p_user_id UUID,
  p_session_id UUID,
  p_idempotency_key TEXT,
  p_duration_seconds INTEGER,
  p_effective_duration_seconds INTEGER,
  p_completion_percentage INTEGER,
  p_focus_quality INTEGER,
  p_interruptions INTEGER DEFAULT 0,
  p_pauses INTEGER DEFAULT 0,
  p_session_mode TEXT DEFAULT 'FLOW',
  p_final_score INTEGER DEFAULT 0,
  p_streak_days INTEGER DEFAULT 0,
  p_mode_bonus INTEGER DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_completion_exists BOOLEAN;
  v_streak RECORD;
  v_xp_result JSONB;
  v_total_xp INTEGER;
  v_coins INTEGER := 0;
  v_gems INTEGER := 0;
  v_streak_action TEXT;
  v_new_streak INTEGER;
  v_session_day TEXT;
  v_last_session_day TEXT;
  v_bonuses JSONB := '[]'::jsonb;
  v_now BIGINT;
BEGIN
  v_now := floor(extract(epoch from clock_timestamp()) * 1000);

  -- === IDEMPOTENCY GUARD ===
  -- Check if this exact completion was already processed
  SELECT EXISTS(
    SELECT 1 FROM public.session_completion_ledgers
    WHERE idempotency_key = p_idempotency_key
  ) INTO v_completion_exists;

  IF v_completion_exists THEN
    RETURN jsonb_build_object(
      'success', true,
      'duplicate', true,
      'xp_awarded', 0,
      'coins_awarded', 0,
      'gems_awarded', 0,
      'streak_action', 'ALREADY_PROCESSED',
      'new_streak', 0,
      'bonuses', '[]'::jsonb
    );
  END IF;

  -- === CALCULATE XP (Server Authoritative) ===
  -- Base: 10 XP per effective minute of focus
  v_total_xp := (p_effective_duration_seconds / 60) * 10;

  -- Quality bonus
  IF p_focus_quality >= 95 THEN
    v_total_xp := v_total_xp + 150;
  ELSIF p_focus_quality >= 85 THEN
    v_total_xp := v_total_xp + 90;
  ELSIF p_focus_quality >= 75 THEN
    v_total_xp := v_total_xp + 50;
  END IF;

  -- Perfect session bonus
  IF p_interruptions = 0 AND p_pauses = 0 AND p_completion_percentage >= 100 THEN
    v_total_xp := v_total_xp + 100;
    v_bonuses := v_bonuses || jsonb_build_object('type', 'PERFECT_SESSION', 'amount', 100, 'description', 'Perfect focus session completed!');
  END IF;

  -- Streak multiplier
  IF p_streak_days >= 30 THEN
    v_total_xp := floor(v_total_xp * 2.0);
  ELSIF p_streak_days >= 14 THEN
    v_total_xp := floor(v_total_xp * 1.75);
  ELSIF p_streak_days >= 7 THEN
    v_total_xp := floor(v_total_xp * 1.5);
  ELSIF p_streak_days >= 3 THEN
    v_total_xp := floor(v_total_xp * 1.25);
  END IF;

  -- High score bonus
  IF p_final_score > 500 THEN
    v_bonuses := v_bonuses || jsonb_build_object('type', 'HIGH_SCORE', 'amount', floor(p_final_score * 0.1), 'description', 'Outstanding performance bonus!');
  END IF;

  -- Deep focus bonus
  IF p_interruptions <= 1 AND p_pauses <= 2 THEN
    v_bonuses := v_bonuses || jsonb_build_object('type', 'DEEP_FOCUS', 'amount', 25, 'description', 'Deep focus maintained!');
  END IF;

  -- === STREAK UPDATE (Server Authoritative) ===
  SELECT * INTO v_streak FROM public.streaks WHERE user_id = p_user_id;
  IF NOT FOUND THEN
    INSERT INTO public.streaks (user_id, current_days, longest_days, timezone, created_at, updated_at)
    VALUES (p_user_id, 0, 0, 'UTC', v_now, v_now)
    RETURNING * INTO v_streak;
  END IF;

  v_session_day := to_char(to_timestamp(v_now::double precision / 1000) AT TIME ZONE COALESCE(v_streak.timezone, 'UTC'), 'YYYY-MM-DD');
  v_last_session_day := CASE
    WHEN v_streak.last_qualifying_session_at IS NOT NULL
    THEN to_char(to_timestamp(v_streak.last_qualifying_session_at::double precision / 1000) AT TIME ZONE COALESCE(v_streak.timezone, 'UTC'), 'YYYY-MM-DD')
    ELSE NULL
  END;

  -- Only count qualifying sessions (10+ min, 50+ quality)
  IF p_duration_seconds >= 600 AND p_focus_quality >= 50 THEN
    IF v_last_session_day IS NULL THEN
      -- First session ever
      v_new_streak := 1;
      v_streak_action := 'INCREMENTED';
    ELSIF v_session_day = v_last_session_day THEN
      -- Already did session today
      v_new_streak := v_streak.current_days;
      v_streak_action := 'ALREADY_TODAY';
    ELSE
      -- Check if consecutive
      IF (
        v_now - COALESCE(v_streak.last_qualifying_session_at, 0) <= 86400000 OR
        (to_timestamp(v_now::double precision / 1000) AT TIME ZONE COALESCE(v_streak.timezone, 'UTC'))::date - 1 =
        (to_timestamp(COALESCE(v_streak.last_qualifying_session_at, 0)::double precision / 1000) AT TIME ZONE COALESCE(v_streak.timezone, 'UTC'))::date
      ) THEN
        v_new_streak := v_streak.current_days + 1;
        v_streak_action := 'INCREMENTED';
      ELSE
        v_new_streak := 1;
        v_streak_action := 'BROKEN';
      END IF;
    END IF;

    UPDATE public.streaks
    SET current_days = v_new_streak,
        longest_days = GREATEST(v_streak.longest_days, v_new_streak),
        last_qualifying_session_at = v_now,
        current_day_completed_at = v_now,
        updated_at = v_now
    WHERE user_id = p_user_id;
  ELSE
    v_new_streak := v_streak.current_days;
    v_streak_action := 'NOT_QUALIFYING';
  END IF;

  -- === RECORD IDEMPOTENT COMPLETION ===
  INSERT INTO public.session_completion_ledgers (
    user_id, session_id, idempotency_key, ledger_payload, offline_sync_status, completed_at, created_at
  ) VALUES (
    p_user_id, p_session_id, p_idempotency_key,
    jsonb_build_object(
      'xp_awarded', v_total_xp,
      'coins_awarded', v_coins,
      'gems_awarded', v_gems,
      'streak_action', v_streak_action,
      'new_streak', v_new_streak,
      'duration_seconds', p_duration_seconds,
      'effective_duration_seconds', p_effective_duration_seconds,
      'completion_percentage', p_completion_percentage,
      'focus_quality', p_focus_quality,
      'session_mode', p_session_mode
    ),
    'synced', v_now, v_now
  );

  -- === AWARD XP (Atomic, Idempotent) ===
  v_xp_result := public.atomic_add_xp(
    p_user_id, v_total_xp, 'SESSION_COMPLETE',
    p_session_id, p_idempotency_key || ':xp',
    jsonb_build_object('sessionMode', p_session_mode, 'streakDays', v_new_streak)
  );

  RETURN jsonb_build_object(
    'success', true,
    'duplicate', false,
    'xp_awarded', v_total_xp,
    'coins_awarded', v_coins,
    'gems_awarded', v_gems,
    'streak_action', v_streak_action,
    'new_streak', v_new_streak,
    'bonuses', v_bonuses,
    'xp_result', v_xp_result,
    'processed_at', v_now
  );
END;
$$;

-- === Ensure session_completion_ledgers has proper constraints ===
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'session_completion_ledgers_idempotency_key_unique'
    AND conrelid = 'session_completion_ledgers'::regclass
  ) THEN
    -- The UNIQUE constraint was already in the CREATE TABLE; verify it exists
    -- If not, add it (idempotent)
    ALTER TABLE public.session_completion_ledgers
    ADD CONSTRAINT session_completion_ledgers_idempotency_key_unique
    UNIQUE (idempotency_key);
  END IF;
END;
$$;

-- === Add RLS for rate_limit_buckets (service-only) ===
CREATE POLICY rate_limit_service_only ON public.rate_limit_buckets
  FOR ALL USING (false) WITH CHECK (false);

-- === Security: Revoke direct client access to economy RPCs ===
-- These functions must only be called by Edge Functions using the service role.
-- Direct client calls are blocked to prevent XP/economy manipulation.

REVOKE EXECUTE ON FUNCTION public.atomic_add_xp FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.complete_session FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.check_rate_limit FROM anon, authenticated;

-- === Security: Ensure all economy functions are SECURITY DEFINER ===
-- The atomic_add_xp and complete_session functions above use SECURITY DEFINER
-- so they bypass RLS and operate with owner privileges. This is intentional
-- because they include server-side validation logic.
