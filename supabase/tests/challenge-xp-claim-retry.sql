BEGIN;
SELECT set_config('vex.test_user',gen_random_uuid()::text,true);
INSERT INTO auth.users(id) VALUES(current_setting('vex.test_user')::uuid);
WITH season AS (
 INSERT INTO public.seasons(name,start_at,end_at)
 VALUES('Rollback test season',now(),now()+interval '1 day') RETURNING id
), fixture AS (
 INSERT INTO public.challenges(season_id,type,category,title,target_value,target_type,reward_type,reward_amount)
 SELECT id,'DAILY','SESSIONS','Rollback reward check',1,'COUNT','XP',100 FROM season
 RETURNING id
) SELECT set_config('vex.test_challenge',id::text,true) FROM fixture;
INSERT INTO public.user_challenges(user_id,challenge_id,current_value,status)
VALUES(current_setting('vex.test_user')::uuid,current_setting('vex.test_challenge')::uuid,1,'ACTIVE');
SELECT set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('vex.test_user'),'role','authenticated','is_anonymous',false)::text,true);
SET LOCAL ROLE authenticated;
DO $$
DECLARE r jsonb; k text := 'challenge:' || current_setting('vex.test_user') || ':' || current_setting('vex.test_challenge') || ':xp';
 m jsonb := jsonb_build_object('challengeId',current_setting('vex.test_challenge'));
BEGIN
 BEGIN
  PERFORM public.atomic_add_xp(current_setting('vex.test_user')::uuid,100,'CHALLENGE_BONUS',NULL,k,m);
  RAISE EXCEPTION 'Uncompleted challenge accepted';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 UPDATE public.user_challenges SET status='COMPLETED',completed_at=now()
  WHERE user_id=current_setting('vex.test_user')::uuid;
 BEGIN
  PERFORM public.atomic_add_xp(current_setting('vex.test_user')::uuid,101,'CHALLENGE_BONUS',NULL,k,m);
  RAISE EXCEPTION 'Inflated challenge award accepted';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 r := public.atomic_add_xp(current_setting('vex.test_user')::uuid,100,'CHALLENGE_BONUS',NULL,k,m);
 IF (r->>'xp_added')::int <> 100 OR (r->>'new_level')::int <> 2 THEN RAISE EXCEPTION 'Challenge award failed'; END IF;
 UPDATE public.user_challenges SET status='CLAIMED',claimed_at=now()
  WHERE user_id=current_setting('vex.test_user')::uuid;
 r := public.atomic_add_xp(current_setting('vex.test_user')::uuid,100,'CHALLENGE_BONUS',NULL,k,m);
 IF NOT (r->>'duplicate')::boolean OR (r->>'new_total_xp')::int <> 100 THEN RAISE EXCEPTION 'Challenge duplicate retry failed'; END IF;
END $$;
RESET ROLE;
ROLLBACK;
SELECT 'Challenge completion, exact reward and duplicate retry checks passed; fixture writes rolled back' AS validation;
