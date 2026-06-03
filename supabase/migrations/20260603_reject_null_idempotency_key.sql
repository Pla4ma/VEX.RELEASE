-- SEC-P0-5: Reject NULL idempotency key in atomic_add_xp
-- A NULL idempotency_key allows duplicate XP awards with no dedup guard.
-- This migration adds a RAISE EXCEPTION guard at the top of the function.

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
  -- Reject NULL idempotency key to prevent duplicate XP awards
  IF p_idempotency_key IS NULL THEN
    RAISE EXCEPTION 'atomic_add_xp requires p_idempotency_key to prevent duplicate XP awards';
  END IF;

  -- Idempotency check: if key already exists, skip
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

-- Re-apply security revocation since CREATE OR REPLACE resets privileges
REVOKE EXECUTE ON FUNCTION public.atomic_add_xp FROM anon, authenticated;
