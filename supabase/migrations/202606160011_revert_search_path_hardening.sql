-- Migration: Revert SECURITY DEFINER search_path weakening introduced by
-- 202606160002_security_advisor_sweep.sql
-- Date: 2026-06-16
--
-- The June 16 security advisor sweep changed SECURITY DEFINER functions
-- from SET search_path = '' (hardened by 20260610_search_path_hardening_fix.sql)
-- to SET search_path = public, pg_temp.
--
-- Including pg_temp in SECURITY DEFINER search_path reintroduces the risk that
-- a temp table with the same name as a real table shadows the intended target,
-- allowing privilege escalation in privilege-elevated functions.
--
-- This migration reverts all affected functions back to SET search_path = ''.
-- Functions that reference tables by unqualified name will need their bodies
-- updated to schema-qualify those references (e.g., public.table_name), but
-- that is a separate, larger effort. The immediate priority is closing the
-- pg_temp attack surface.

-- Functions that were ALTERed by 202606160002_security_advisor_sweep.sql
ALTER FUNCTION public.can_user_reroll(uuid, date) SET search_path = '';
ALTER FUNCTION public.check_daily_generation_limit(uuid, integer) SET search_path = '';
ALTER FUNCTION public.claim_journey_milestone(uuid, uuid, integer) SET search_path = '';
ALTER FUNCTION public.create_squad(text, text, boolean, text) SET search_path = '';
ALTER FUNCTION public.decrement_squad_member_count() SET search_path = '';
ALTER FUNCTION public.get_circle_activity_feed(uuid, integer) SET search_path = '';
ALTER FUNCTION public.get_season_stats(uuid) SET search_path = '';
ALTER FUNCTION public.get_story_engagement_stats(uuid, integer) SET search_path = '';
ALTER FUNCTION public.get_today_dungeon() SET search_path = '';
ALTER FUNCTION public.get_user_active_raid(uuid) SET search_path = '';
ALTER FUNCTION public.get_user_journey_progress(uuid) SET search_path = '';
ALTER FUNCTION public.get_user_study_buddies(uuid) SET search_path = '';
ALTER FUNCTION public.get_user_study_circles(uuid) SET search_path = '';
ALTER FUNCTION public.handle_updated_at() SET search_path = '';
ALTER FUNCTION public.increment_coins(uuid, integer) SET search_path = '';
ALTER FUNCTION public.increment_squad_member_count() SET search_path = '';
ALTER FUNCTION public.join_study_circle(uuid, uuid, text) SET search_path = '';
ALTER FUNCTION public.leave_study_circle(uuid, uuid) SET search_path = '';
ALTER FUNCTION public.purchase_battle_pass_premium(uuid, uuid, integer) SET search_path = '';
ALTER FUNCTION public.send_study_buddy_encouragement(uuid, uuid, uuid, text, text) SET search_path = '';
ALTER FUNCTION public.set_updated_at() SET search_path = '';
ALTER FUNCTION public.soft_delete_old_content() SET search_path = '';
ALTER FUNCTION public.sync_companion_promises_phase3_fields() SET search_path = '';
ALTER FUNCTION public.transfer_funds(uuid, uuid, numeric, text) SET search_path = '';
ALTER FUNCTION public.update_circle_member_count() SET search_path = '';
ALTER FUNCTION public.update_circle_weekly_checks_updated_at_column() SET search_path = '';
ALTER FUNCTION public.update_journey_updated_at_column() SET search_path = '';
ALTER FUNCTION public.update_study_buddies_updated_at_column() SET search_path = '';
ALTER FUNCTION public.update_study_buddy_check_ins_updated_at_column() SET search_path = '';
ALTER FUNCTION public.update_study_buddy_shared_goals_updated_at_column() SET search_path = '';
ALTER FUNCTION public.update_study_circles_updated_at_column() SET search_path = '';
ALTER FUNCTION public.update_study_content_updated_at() SET search_path = '';
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';
ALTER FUNCTION public.upsert_session_story(uuid, uuid, uuid, jsonb, bigint) SET search_path = '';
