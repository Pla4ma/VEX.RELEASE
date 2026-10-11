-- Safe client awards require an owned completion receipt or completed challenge.
-- SECURITY INVOKER preserves the existing non-anonymous ownership policies.
BEGIN;
SET LOCAL lock_timeout = '3s';
CREATE OR REPLACE FUNCTION public.atomic_add_xp(
  p_user_id uuid, p_amount integer, p_source text,
  p_session_id uuid DEFAULT NULL, p_idempotency_key text DEFAULT NULL,
  p_metadata jsonb DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE
  v_progression public.progression%ROWTYPE;
  v_expected integer;
  v_expected_key text;
  v_duplicate boolean;
  v_total bigint;
  v_remaining bigint;
  v_level integer := 1;
  v_threshold bigint := 100;
  v_level_up boolean;
  v_now bigint := floor(extract(epoch FROM clock_timestamp()) * 1000)::bigint;
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' AND (
    auth.uid() IS DISTINCT FROM p_user_id OR
    coalesce((auth.jwt()->>'is_anonymous')::boolean, false)
  ) THEN
    RAISE EXCEPTION 'XP award requires the authenticated owner' USING ERRCODE = '42501';
  END IF;
  IF p_user_id IS NULL OR p_amount IS NULL OR p_amount <= 0 OR p_amount > 50000 OR
     p_idempotency_key IS NULL OR length(trim(p_idempotency_key)) = 0 OR
     length(p_idempotency_key) > 512 THEN
    RAISE EXCEPTION 'Invalid XP award' USING ERRCODE = '22023';
  END IF;

  -- Serialize initialization, duplicate detection and balance updates together.
  PERFORM pg_advisory_xact_lock(hashtextextended(p_user_id::text, 710));
  SELECT EXISTS(SELECT 1 FROM public.xp_history WHERE user_id = p_user_id AND
    (idempotency_key = p_idempotency_key OR metadata->>'idempotencyKey' = p_idempotency_key))
  INTO v_duplicate;

  IF NOT v_duplicate AND auth.role() IS DISTINCT FROM 'service_role' THEN
    IF p_source = 'SESSION_COMPLETE' THEN
      SELECT (ledger_payload->>'xpDelta')::integer, idempotency_key || ':xp'
      INTO v_expected, v_expected_key FROM public.session_completion_ledgers
      WHERE user_id = p_user_id AND session_id = p_session_id;
    ELSIF p_source = 'CHALLENGE_BONUS' THEN
      SELECT c.reward_amount, 'challenge:' || p_user_id::text || ':' || c.id::text || ':xp'
      INTO v_expected, v_expected_key FROM public.user_challenges uc
      JOIN public.challenges c ON c.id = uc.challenge_id
      WHERE uc.user_id = p_user_id AND c.id::text = p_metadata->>'challengeId'
        AND uc.status = 'COMPLETED' AND uc.current_value >= c.target_value;
    ELSE
      RAISE EXCEPTION 'XP source requires a trusted server award' USING ERRCODE = '42501';
    END IF;
    IF v_expected IS DISTINCT FROM p_amount OR v_expected_key IS DISTINCT FROM p_idempotency_key THEN
      RAISE EXCEPTION 'XP award does not match an owned reward' USING ERRCODE = '42501';
    END IF;
  END IF;

  SELECT * INTO v_progression FROM public.progression WHERE user_id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN
    INSERT INTO public.progression(user_id, level, xp, total_xp, next_level_threshold,
      created_at, updated_at) VALUES(p_user_id, 1, 0, 0, 100, now(), now())
    RETURNING * INTO v_progression;
  END IF;
  IF v_duplicate THEN
    RETURN jsonb_build_object('success', true, 'duplicate', true, 'xp_added', 0,
      'new_total_xp', v_progression.total_xp, 'new_level', v_progression.level,
      'previous_level', v_progression.level, 'level_up', false, 'rewards', '[]'::jsonb);
  END IF;

  v_total := v_progression.total_xp::bigint + p_amount;
  IF v_total > 2147483647 THEN
    RAISE EXCEPTION 'XP balance exceeds supported range' USING ERRCODE = '22003';
  END IF;
  v_remaining := v_total;
  -- Match calculateLevelThreshold: floor(100 * 1.25^(level - 1)).
  WHILE v_remaining >= v_threshold AND v_level < 100 LOOP
    v_remaining := v_remaining - v_threshold;
    v_level := v_level + 1;
    v_threshold := floor(100 * power(1.25::double precision, v_level - 1))::bigint;
  END LOOP;
  v_level_up := v_level > v_progression.level;

  INSERT INTO public.xp_history(user_id, amount, source, session_id, idempotency_key,
    metadata, created_at, updated_at) VALUES(p_user_id, p_amount, p_source, p_session_id,
    p_idempotency_key, coalesce(p_metadata, '{}'::jsonb) ||
    jsonb_build_object('idempotencyKey', p_idempotency_key, 'atomic', true), now(), now());
  UPDATE public.progression SET total_xp = v_total::integer, level = v_level,
    xp = v_remaining::integer, next_level_threshold = least(v_threshold, 2147483647)::integer,
    last_level_up_at = CASE WHEN v_level_up THEN v_now ELSE last_level_up_at END,
    updated_at = now() WHERE id = v_progression.id;
  IF v_level_up THEN
    INSERT INTO public.level_up_history(user_id, level, achieved_at, xp_at_level,
      idempotency_key, metadata, created_at, updated_at) VALUES(p_user_id, v_level,
      v_now, v_total::integer, p_idempotency_key || ':level-up', '{}'::jsonb, now(), now());
  END IF;
  RETURN jsonb_build_object('success', true, 'duplicate', false, 'xp_added', p_amount,
    'new_total_xp', v_total, 'new_level', v_level, 'previous_level', v_progression.level,
    'level_up', v_level_up, 'rewards', CASE WHEN v_level_up THEN jsonb_build_array(
      CASE WHEN v_level = 2 THEN 'first_level_up' WHEN v_level = 5 THEN 'level_5'
        WHEN v_level = 10 THEN 'level_10' WHEN v_level % 25 = 0 THEN 'level_milestone'
        ELSE 'level_up' END) ELSE '[]'::jsonb END);
END;
$$;
REVOKE EXECUTE ON FUNCTION public.atomic_add_xp(uuid, integer, text, uuid, text, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.atomic_add_xp(uuid, integer, text, uuid, text, jsonb) TO authenticated, service_role;
COMMIT;
