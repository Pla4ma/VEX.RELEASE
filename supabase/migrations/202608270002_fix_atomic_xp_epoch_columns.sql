-- Keep legacy epoch columns numeric while using timestamptz audit columns.

CREATE OR REPLACE FUNCTION public.atomic_add_xp(
  p_user_id UUID, p_amount INTEGER, p_source TEXT,
  p_session_id UUID DEFAULT NULL, p_idempotency_key TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_progression RECORD;
  v_total INTEGER;
  v_level INTEGER;
  v_xp INTEGER;
  v_threshold INTEGER;
  v_previous INTEGER;
  v_level_up BOOLEAN := false;
  v_entry UUID;
  v_now BIGINT;
BEGIN
  IF p_idempotency_key IS NULL THEN
    RAISE EXCEPTION 'atomic_add_xp requires p_idempotency_key to prevent duplicate XP awards';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.xp_history
    WHERE user_id = p_user_id AND metadata->>'idempotencyKey' = p_idempotency_key
  ) THEN
    RETURN jsonb_build_object('success', true, 'duplicate', true, 'xp_added', 0,
      'new_total_xp', 0, 'new_level', 0, 'level_up', false, 'rewards', '[]'::jsonb);
  END IF;

  SELECT * INTO v_progression FROM public.progression WHERE user_id = p_user_id;
  IF NOT FOUND THEN
    INSERT INTO public.progression (
      user_id, level, xp, total_xp, next_level_threshold,
      last_level_up_at, created_at, updated_at
    ) VALUES (p_user_id, 1, 0, 0, 100, NULL, now(), now())
    RETURNING * INTO v_progression;
  END IF;

  v_previous := v_progression.level;
  v_total := v_progression.total_xp + p_amount;
  v_level := floor(sqrt(GREATEST(v_total::numeric, 0) / 100)) + 1;
  IF v_level < 1 THEN v_level := 1; END IF;
  v_threshold := v_level * v_level * 100;
  v_xp := v_total - ((v_level - 1) * (v_level - 1) * 100);
  v_level_up := v_level > v_previous;
  v_now := floor(extract(epoch from clock_timestamp()) * 1000)::bigint;

  INSERT INTO public.xp_history (
    id, user_id, amount, source, session_id, metadata, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), p_user_id, p_amount, p_source, p_session_id,
    COALESCE(p_metadata, '{}'::jsonb) || jsonb_build_object(
      'idempotencyKey', p_idempotency_key, 'atomic', true
    ), now(), now()
  ) RETURNING id INTO v_entry;

  UPDATE public.progression
  SET total_xp = v_total, level = v_level, xp = v_xp,
      next_level_threshold = v_threshold,
      last_level_up_at = CASE WHEN v_level_up THEN v_now ELSE last_level_up_at END,
      updated_at = now()
  WHERE user_id = p_user_id;

  IF v_level_up THEN
    INSERT INTO public.level_up_history (
      user_id, level, achieved_at, xp_at_level, metadata, created_at, updated_at
    ) VALUES (p_user_id, v_level, v_now, v_total, '{}'::jsonb, now(), now());
  END IF;

  RETURN jsonb_build_object(
    'success', true, 'duplicate', false, 'xp_added', p_amount,
    'new_total_xp', v_total, 'new_level', v_level,
    'previous_level', v_previous, 'level_up', v_level_up,
    'xp_entry_id', v_entry,
    'rewards', CASE WHEN v_level_up THEN jsonb_build_array(
      CASE WHEN v_level = 2 THEN 'first_level_up'
           WHEN v_level = 5 THEN 'level_5'
           WHEN v_level = 10 THEN 'level_10'
           WHEN v_level % 25 = 0 THEN 'level_milestone'
           ELSE 'level_up' END
    ) ELSE '[]'::jsonb END
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.atomic_add_xp(UUID, INTEGER, TEXT, UUID, TEXT, JSONB)
  FROM anon, authenticated;
