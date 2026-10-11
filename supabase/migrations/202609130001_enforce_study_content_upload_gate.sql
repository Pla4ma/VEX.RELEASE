-- Keep Study uploads on the server-side unlock path even if a client bypasses
-- the normal screen and calls PostgREST or Storage directly.

CREATE OR REPLACE FUNCTION public.get_study_content_access(p_user_id uuid)
RETURNS TABLE (can_upload boolean, fallback_label text)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_completed_sessions bigint := 0;
  v_study_sessions bigint := 0;
  v_goal text;
  v_motivation_style text;
  v_study_ratio numeric := 0;
  v_has_study_intent boolean;
  v_can_upload boolean;
BEGIN
  SELECT
    count(*),
    count(*) FILTER (WHERE upper(coalesce(mode, '')) = 'STUDY')
  INTO v_completed_sessions, v_study_sessions
  FROM public.sessions
  WHERE user_id = p_user_id
    AND status = 'completed';

  SELECT
    upper(goal),
    lower(motivation_profile ->> 'primary')
  INTO v_goal, v_motivation_style
  FROM public.onboarding_profiles
  WHERE user_id = p_user_id;

  IF v_completed_sessions > 0 THEN
    v_study_ratio := v_study_sessions::numeric / v_completed_sessions;
  END IF;

  v_has_study_intent := coalesce(
    v_goal IN ('STUDY', 'LEARNING')
    OR v_motivation_style IN ('study_focused', 'student')
    OR v_study_ratio >= 0.35,
    false
  );

  v_can_upload := v_has_study_intent
    AND (v_completed_sessions >= 3 OR v_study_ratio >= 0.35);

  RETURN QUERY SELECT
    v_can_upload,
    CASE
      WHEN v_can_upload THEN NULL::text
      WHEN v_has_study_intent THEN
        'Start with a study target and a few focused blocks. Content tools unlock as your study path takes shape.'::text
      ELSE
        'Choose a study goal and complete a focused study block to unlock content tools.'::text
    END;
END;
$$;

REVOKE ALL ON FUNCTION public.get_study_content_access(uuid)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_study_content_access(uuid)
  TO service_role;

CREATE OR REPLACE FUNCTION public.can_upload_study_content(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_can_upload boolean;
BEGIN
  IF coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false)
    OR (
      coalesce(auth.role(), '') <> 'service_role'
      AND p_user_id IS DISTINCT FROM auth.uid()
    ) THEN
    RETURN false;
  END IF;

  SELECT access.can_upload
  INTO v_can_upload
  FROM public.get_study_content_access(p_user_id) AS access;

  RETURN coalesce(v_can_upload, false);
END;
$$;

REVOKE ALL ON FUNCTION public.can_upload_study_content(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_upload_study_content(uuid)
  TO authenticated, service_role;

CREATE INDEX IF NOT EXISTS study_content_gate_completed_sessions_idx
  ON public.sessions(user_id)
  WHERE status = 'completed';

DROP POLICY IF EXISTS "Users can only access own study content" ON public.study_content;
CREATE POLICY study_content_owner_select
  ON public.study_content FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    AND coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
  );
CREATE POLICY study_content_unlocked_insert
  ON public.study_content FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
    AND public.can_upload_study_content(auth.uid())
  );
CREATE POLICY study_content_owner_update
  ON public.study_content FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid()
    AND coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
  )
  WITH CHECK (
    user_id = auth.uid()
    AND coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
  );
CREATE POLICY study_content_owner_delete
  ON public.study_content FOR DELETE TO authenticated
  USING (
    user_id = auth.uid()
    AND coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
  );

DROP POLICY IF EXISTS "Users can only access own study files" ON storage.objects;
DROP POLICY IF EXISTS "Users can manage own study files" ON storage.objects;
CREATE POLICY study_files_owner_select
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'study-content'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
  );
CREATE POLICY study_files_unlocked_insert
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'study-content'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
    AND public.can_upload_study_content(auth.uid())
  );
CREATE POLICY study_files_owner_update
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'study-content'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
  )
  WITH CHECK (
    bucket_id = 'study-content'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
    AND public.can_upload_study_content(auth.uid())
  );
CREATE POLICY study_files_owner_delete
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'study-content'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
  );
