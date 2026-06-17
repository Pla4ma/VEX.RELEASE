DO $$
DECLARE
  policy_record record;
  table_name text;
  guard text := 'COALESCE((auth.jwt() ->> ''is_anonymous'')::boolean, false) = false';
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'admin_users',
    'battle_pass_tiers',
    'unified_wallets'
  ]
  LOOP
    IF to_regclass(format('public.%I', table_name)) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
      EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY', table_name);
    END IF;
  END LOOP;

  FOR policy_record IN
    SELECT schemaname, tablename, policyname, cmd, qual, with_check
    FROM pg_policies
    WHERE schemaname IN ('public', 'storage', 'realtime')
      AND ('public' = ANY (roles) OR 'anon' = ANY (roles))
  LOOP
    EXECUTE format(
      'ALTER POLICY %I ON %I.%I TO authenticated',
      policy_record.policyname,
      policy_record.schemaname,
      policy_record.tablename
    );

    IF policy_record.qual IS NOT NULL THEN
      EXECUTE format(
        'ALTER POLICY %I ON %I.%I USING ((%s) AND %s)',
        policy_record.policyname,
        policy_record.schemaname,
        policy_record.tablename,
        policy_record.qual,
        guard
      );
    END IF;

    IF policy_record.with_check IS NOT NULL THEN
      EXECUTE format(
        'ALTER POLICY %I ON %I.%I WITH CHECK ((%s) AND %s)',
        policy_record.policyname,
        policy_record.schemaname,
        policy_record.tablename,
        policy_record.with_check,
        guard
      );
    END IF;
  END LOOP;
END $$;

ALTER FUNCTION public.can_user_reroll(uuid, date) SET search_path = public, pg_temp;
ALTER FUNCTION public.check_daily_generation_limit(uuid, integer) SET search_path = public, pg_temp;
ALTER FUNCTION public.claim_journey_milestone(uuid, uuid, integer) SET search_path = public, pg_temp;
ALTER FUNCTION public.create_squad(text, text, boolean, text) SET search_path = public, pg_temp;
ALTER FUNCTION public.decrement_squad_member_count() SET search_path = public, pg_temp;
ALTER FUNCTION public.get_circle_activity_feed(uuid, integer) SET search_path = public, pg_temp;
ALTER FUNCTION public.get_season_stats(uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.get_story_engagement_stats(uuid, integer) SET search_path = public, pg_temp;
ALTER FUNCTION public.get_today_dungeon() SET search_path = public, pg_temp;
ALTER FUNCTION public.get_user_active_raid(uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.get_user_journey_progress(uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.get_user_study_buddies(uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.get_user_study_circles(uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.handle_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.increment_coins(uuid, integer) SET search_path = public, pg_temp;
ALTER FUNCTION public.increment_squad_member_count() SET search_path = public, pg_temp;
ALTER FUNCTION public.join_study_circle(uuid, uuid, text) SET search_path = public, pg_temp;
ALTER FUNCTION public.leave_study_circle(uuid, uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.purchase_battle_pass_premium(uuid, uuid, integer) SET search_path = public, pg_temp;
ALTER FUNCTION public.send_study_buddy_encouragement(uuid, uuid, uuid, text, text) SET search_path = public, pg_temp;
ALTER FUNCTION public.set_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.soft_delete_old_content() SET search_path = public, pg_temp;
ALTER FUNCTION public.sync_companion_promises_phase3_fields() SET search_path = public, pg_temp;
ALTER FUNCTION public.transfer_funds(uuid, uuid, numeric, text) SET search_path = public, pg_temp;
ALTER FUNCTION public.update_circle_member_count() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_circle_weekly_checks_updated_at_column() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_journey_updated_at_column() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_study_buddies_updated_at_column() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_study_buddy_check_ins_updated_at_column() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_study_buddy_shared_goals_updated_at_column() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_study_circles_updated_at_column() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_study_content_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public, pg_temp;
ALTER FUNCTION public.upsert_session_story(uuid, uuid, uuid, jsonb, bigint) SET search_path = public, pg_temp;
