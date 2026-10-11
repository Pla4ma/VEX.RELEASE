-- Keep score and history together, with one effect per owned session.
BEGIN;
SET LOCAL lock_timeout = '3s';
ALTER TABLE public.focus_score_current ADD COLUMN IF NOT EXISTS top_positive_factor text;
ALTER TABLE public.focus_score_current ADD COLUMN IF NOT EXISTS top_negative_factor text;
ALTER TABLE public.focus_score_history ADD COLUMN IF NOT EXISTS session_id uuid;
CREATE UNIQUE INDEX IF NOT EXISTS focus_score_history_user_session_key
  ON public.focus_score_history(user_id, session_id) WHERE session_id IS NOT NULL;
CREATE OR REPLACE FUNCTION public.record_session_focus_score(
  p_user_id uuid, p_session_id uuid, p_score jsonb, p_occurred_at timestamptz
) RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE
  v_current integer;
  v_previous integer := (p_score->>'previousScore')::integer;
  v_new integer := (p_score->>'currentScore')::integer;
BEGIN
  IF auth.uid() IS DISTINCT FROM p_user_id OR
     coalesce((auth.jwt()->>'is_anonymous')::boolean, false) OR p_session_id IS NULL THEN
    RAISE EXCEPTION 'Focus score requires the authenticated owner' USING ERRCODE = '42501';
  END IF;
  IF v_new IS NULL OR v_previous IS NULL OR v_new NOT BETWEEN 300 AND 850 OR
     v_previous NOT BETWEEN 300 AND 850 OR p_occurred_at IS NULL OR
     jsonb_typeof(p_score->'factors') IS DISTINCT FROM 'object' OR
     coalesce(p_score->>'lastChangeReason','') = '' THEN
    RAISE EXCEPTION 'Invalid focus score' USING ERRCODE = '22023';
  END IF;
  IF NOT EXISTS(SELECT 1 FROM public.session_completion_ledgers
    WHERE user_id=p_user_id AND session_id=p_session_id) THEN
    RAISE EXCEPTION 'Focus score requires an owned completion' USING ERRCODE = '42501';
  END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(p_user_id::text, 711));
  IF EXISTS(SELECT 1 FROM public.focus_score_history
    WHERE user_id=p_user_id AND session_id=p_session_id) THEN
    RETURN jsonb_build_object('duplicate',true,'conflict',false);
  END IF;
  SELECT current_score INTO v_current FROM public.focus_score_current
    WHERE user_id=p_user_id FOR UPDATE;
  IF coalesce(v_current,550) <> v_previous THEN
    RETURN jsonb_build_object('duplicate',false,'conflict',true);
  END IF;
  INSERT INTO public.focus_score_current(user_id,current_score,previous_score,band,
    factors,last_change_reason,top_positive_factor,top_negative_factor,updated_at)
  VALUES(p_user_id,v_new,v_previous,p_score->>'band',p_score->'factors',
    p_score->>'lastChangeReason',p_score->>'topPositiveFactor',p_score->>'topNegativeFactor',now())
  ON CONFLICT(user_id) DO UPDATE SET current_score=excluded.current_score,
    previous_score=excluded.previous_score,band=excluded.band,factors=excluded.factors,
    last_change_reason=excluded.last_change_reason,top_positive_factor=excluded.top_positive_factor,
    top_negative_factor=excluded.top_negative_factor,updated_at=excluded.updated_at;
  INSERT INTO public.focus_score_history(user_id,session_id,occurred_at,score,delta,reason)
  VALUES(p_user_id,p_session_id,p_occurred_at,v_new,v_new-v_previous,p_score->>'lastChangeReason');
  RETURN jsonb_build_object('duplicate',false,'conflict',false);
END;
$$;
REVOKE EXECUTE ON FUNCTION public.record_session_focus_score(uuid,uuid,jsonb,timestamptz) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_session_focus_score(uuid,uuid,jsonb,timestamptz) TO authenticated;
COMMIT;
