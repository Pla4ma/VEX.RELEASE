BEGIN;
SELECT set_config('vex.test_user',gen_random_uuid()::text,true),set_config('vex.test_session',gen_random_uuid()::text,true);
INSERT INTO auth.users(id) VALUES(current_setting('vex.test_user')::uuid);
INSERT INTO public.session_completion_ledgers(user_id,session_id,idempotency_key,ledger_payload,completed_at,created_at,offline_sync_status)
VALUES(current_setting('vex.test_user')::uuid,current_setting('vex.test_session')::uuid,'focus-rollback-receipt','{}'::jsonb,0,0,'failed');
SELECT set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('vex.test_user'),'role','authenticated','is_anonymous',false)::text,true);
SET LOCAL ROLE authenticated;
DO $$
DECLARE r jsonb; s jsonb := '{"previousScore":550,"currentScore":558,"band":"Good","factors":{},"lastChangeReason":"Rollback check"}'::jsonb;
BEGIN
  r := public.record_session_focus_score(current_setting('vex.test_user')::uuid,current_setting('vex.test_session')::uuid,s,now());
  IF (r->>'conflict')::boolean OR (r->>'duplicate')::boolean THEN RAISE EXCEPTION 'Initial focus write failed'; END IF;
  r := public.record_session_focus_score(current_setting('vex.test_user')::uuid,current_setting('vex.test_session')::uuid,s,now());
  IF NOT (r->>'duplicate')::boolean THEN RAISE EXCEPTION 'Focus duplicate failed'; END IF;
  IF (SELECT count(*) FROM public.focus_score_history WHERE user_id=current_setting('vex.test_user')::uuid) <> 1 THEN RAISE EXCEPTION 'Repeated history'; END IF;
  IF (SELECT current_score FROM public.focus_score_current WHERE user_id=current_setting('vex.test_user')::uuid) <> 558 THEN RAISE EXCEPTION 'Repeated score'; END IF;
  BEGIN
    PERFORM public.record_session_focus_score(gen_random_uuid(),current_setting('vex.test_session')::uuid,s,now());
    RAISE EXCEPTION 'Foreign focus accepted';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;
ROLLBACK;
SELECT 'Atomic focus write, duplicate retry and foreign owner checks passed; fixture writes rolled back' AS validation;
