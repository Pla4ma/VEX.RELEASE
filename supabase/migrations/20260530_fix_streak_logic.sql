-- Fix P0-4: Streak XP multiplier was always 0 because p_streak_days was hardcoded to 0
-- Fix P0-5: Streak consecutive check used ambiguous OR with timezone-unaware 86400000ms check
--
-- Changes:
--   1. Removed p_streak_days from function signature (client never sends it)
--   2. Moved streak calculation BEFORE XP multiplier so v_new_streak is used
--   3. Removed the 86400000ms OR condition — calendar-day check only

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

  -- === STREAK UPDATE (Server Authoritative) ===
  -- Moved BEFORE XP calculation so v_new_streak is available for the multiplier
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
      -- Check if consecutive (calendar-day only, no ms-based fallback)
      IF (
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

  -- Streak multiplier (now uses server-calculated v_new_streak instead of p_streak_days)
  IF v_new_streak >= 30 THEN
    v_total_xp := floor(v_total_xp * 2.0);
  ELSIF v_new_streak >= 14 THEN
    v_total_xp := floor(v_total_xp * 1.75);
  ELSIF v_new_streak >= 7 THEN
    v_total_xp := floor(v_total_xp * 1.5);
  ELSIF v_new_streak >= 3 THEN
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

-- Revoke direct client access (must match existing security posture)
REVOKE EXECUTE ON FUNCTION public.complete_session(UUID, UUID, TEXT, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER, TEXT, INTEGER, INTEGER) FROM anon, authenticated;
