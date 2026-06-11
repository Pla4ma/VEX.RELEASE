-- Migration: Add SET search_path = '' to all SECURITY DEFINER functions
-- Generated: 2026-06-10
-- This prevents function-injection attacks via public schema

-- Function: can_user_reroll
CREATE OR REPLACE FUNCTION can_user_reroll(p_user_id UUID, p_date DATE DEFAULT CURRENT_DATE)
RETURNS BOOLEAN AS $$
DECLARE
  free_rerolls_today INTEGER;
BEGIN
  SELECT COUNT(*) INTO free_rerolls_today
  FROM challenge_rerolls
  WHERE user_id = p_user_id
    AND reroll_type = 'FREE'
    AND DATE(rerolled_at) = p_date;
  
  RETURN free_rerolls_today < 1; -- 1 free reroll per day
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function: check_daily_generation_limit
CREATE OR REPLACE FUNCTION check_daily_generation_limit(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE(can_generate BOOLEAN, remaining INTEGER) AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_last_date DATE;
  v_count INTEGER;
BEGIN
  -- Get current count for today
  SELECT last_generation_date, generation_count_today
  INTO v_last_date, v_count
  FROM study_content
  WHERE user_id = p_user_id
  ORDER BY last_generation_date DESC
  LIMIT 1;
  
  -- Reset if it's a new day
  IF v_last_date IS NULL OR v_last_date < v_today THEN
    RETURN QUERY SELECT true::BOOLEAN, p_limit::INTEGER;
  END IF;
  
  -- Check limit
  IF v_count >= p_limit THEN
    RETURN QUERY SELECT false::BOOLEAN, (p_limit - v_count)::INTEGER;
  ELSE
    RETURN QUERY SELECT true::BOOLEAN, (p_limit - v_count)::INTEGER;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function: get_circle_activity_feed
CREATE OR REPLACE FUNCTION get_circle_activity_feed(p_circle_id UUID, p_limit INTEGER DEFAULT 20)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  type TEXT,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE,
  user_display_name TEXT,
  user_avatar_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ca.id,
    ca.user_id,
    ca.type,
    ca.data,
    ca.created_at,
    u.raw_user_meta_data->>'displayName' as user_display_name,
    u.raw_user_meta_data->>'avatarUrl' as user_avatar_url
  FROM circle_activities ca
  JOIN auth.users u ON ca.user_id = u.id
  WHERE ca.circle_id = p_circle_id
  ORDER BY ca.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function: get_season_stats
CREATE OR REPLACE FUNCTION get_season_stats(p_season_id UUID)
RETURNS TABLE (
  total_participants BIGINT,
  premium_participants BIGINT,
  average_tier NUMERIC,
  total_xp_earned BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_participants,
    COUNT(*) FILTER (WHERE is_premium)::BIGINT as premium_participants,
    AVG(current_tier)::NUMERIC as average_tier,
    SUM(total_season_xp)::BIGINT as total_xp_earned
  FROM user_season_progress
  WHERE season_id = p_season_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function: get_story_engagement_stats
CREATE OR REPLACE FUNCTION get_story_engagement_stats(
    p_user_id UUID,
    p_days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
    total_stories BIGINT,
    viewed_stories BIGINT,
    avg_completion_rate NUMERIC,
    most_engaging_beat_type TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH story_stats AS (
        SELECT 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE viewed = TRUE) as viewed,
            AVG(completion_rate) as avg_completion,
            story_data->'beats' as beats
        FROM session_stories
        WHERE user_id = p_user_id
        AND created_at >= (extract(epoch from now()) * 1000)::bigint - (p_days_back * 24 * 60 * 60 * 1000)
        GROUP BY story_data
    ),
    beat_counts AS (
        SELECT 
            beat->>'type' as beat_type,
            COUNT(*) as cnt
        FROM story_stats, jsonb_array_elements(beats) as beat
        GROUP BY beat->>'type'
    )
    SELECT 
        (SELECT COUNT(*) FROM story_stats)::BIGINT as total_stories,
        (SELECT SUM(viewed) FROM story_stats)::BIGINT as viewed_stories,
        (SELECT AVG(avg_completion) FROM story_stats)::NUMERIC as avg_completion_rate,
        (SELECT beat_type FROM beat_counts ORDER BY cnt DESC LIMIT 1)::TEXT as most_engaging_beat_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function: get_today_dungeon
CREATE OR REPLACE FUNCTION get_today_dungeon()
RETURNS SETOF daily_dungeons AS $$
BEGIN
  RETURN QUERY SELECT * FROM daily_dungeons WHERE date = CURRENT_DATE LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function: get_user_active_raid
CREATE OR REPLACE FUNCTION get_user_active_raid(p_user_id UUID)
RETURNS SETOF squad_raids AS $$
BEGIN
  RETURN QUERY 
  SELECT r.* FROM squad_raids r
  JOIN raid_participants rp ON r.id = rp.raid_id
  WHERE rp.user_id = p_user_id
  AND r.status IN ('SCHEDULED', 'IN_PROGRESS')
  ORDER BY r.scheduled_for DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function: get_user_journey_progress
CREATE OR REPLACE FUNCTION get_user_journey_progress(p_user_id UUID)
RETURNS TABLE (
  season_id TEXT,
  current_milestone INTEGER,
  milestone_progress FLOAT,
  total_progress FLOAT,
  next_milestone_xp INTEGER,
  xp_to_next_milestone INTEGER,
  days_remaining INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    js.season_id,
    uj.current_milestone,
    CASE 
      WHEN uj.total_xp >= (uj.current_milestone * sj.xp_per_milestone) THEN 100
      ELSE (uj.total_xp - ((uj.current_milestone - 1) * sj.xp_per_milestone))::FLOAT / sj.xp_per_milestone::FLOAT * 100
    END as milestone_progress,
    CASE 
      WHEN uj.total_xp >= sj.total_xp_required THEN 100
      ELSE (uj.total_xp::FLOAT / sj.total_xp_required::FLOAT) * 100
    END as total_progress,
    (uj.current_milestone + 1) * sj.xp_per_milestone as next_milestone_xp,
    ((uj.current_milestone + 1) * sj.xp_per_milestone) - uj.total_xp as xp_to_next_milestone,
    EXTRACT(DAY FROM (js.end_date - NOW()))::INTEGER as days_remaining
  FROM user_journeys uj
  JOIN season_journeys sj ON uj.season_journey_id = sj.id
  JOIN journey_seasons js ON sj.season_id = js.id
  WHERE uj.user_id = p_user_id AND js.is_active = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function: get_user_study_buddies
CREATE OR REPLACE FUNCTION get_user_study_buddies(p_user_id UUID)
RETURNS TABLE (
  buddy_pair_id UUID,
  buddy_user_id UUID,
  buddy_display_name TEXT,
  buddy_avatar_url TEXT,
  status TEXT,
  shared_goal_description TEXT,
  shared_goal_target INTEGER,
  shared_goal_timeframe TEXT,
  mutual_total_sessions INTEGER,
  mutual_focus_time INTEGER,
  mutual_streak_days INTEGER,
  longest_streak INTEGER,
  encouragements_sent INTEGER,
  encouragements_received INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  can_send_encouragement BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sb.id as buddy_pair_id,
    CASE 
      WHEN sb.user_id = p_user_id THEN sb.buddy_id
      ELSE sb.user_id
    END as buddy_user_id,
    CASE 
      WHEN sb.user_id = p_user_id THEN u2.raw_user_meta_data->>'displayName'
      ELSE u1.raw_user_meta_data->>'displayName'
    END as buddy_display_name,
    CASE 
      WHEN sb.user_id = p_user_id THEN u2.raw_user_meta_data->>'avatarUrl'
      ELSE u1.raw_user_meta_data->>'avatarUrl'
    END as buddy_avatar_url,
    sb.status,
    sg.description as shared_goal_description,
    sg.target as shared_goal_target,
    sg.timeframe as shared_goal_timeframe,
    (sb.mutual_stats->>'totalSessionsTogether')::INTEGER as mutual_total_sessions,
    (sb.mutual_stats->>'combinedFocusTime')::INTEGER as mutual_focus_time,
    (sb.mutual_stats->>'streakDaysTogether')::INTEGER as mutual_streak_days,
    (sb.mutual_stats->>'longestStreak')::INTEGER as longest_streak,
    sb.encouragements_sent,
    sb.encouragements_received,
    sb.created_at,
    sb.status = 'ACTIVE' as can_send_encouragement
  FROM study_buddies sb
  JOIN auth.users u1 ON sb.user_id = u1.id
  JOIN auth.users u2 ON sb.buddy_id = u2.id
  LEFT JOIN study_buddy_shared_goals sg ON sb.shared_goal_id = sg.id
  WHERE (sb.user_id = p_user_id OR sb.buddy_id = p_user_id)
    AND sb.status IN ('PENDING', 'ACTIVE', 'PAUSED')
  ORDER BY sb.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function: get_user_study_circles
CREATE OR REPLACE FUNCTION get_user_study_circles(p_user_id UUID)
RETURNS TABLE (
  circle_id UUID,
  circle_name TEXT,
  role TEXT,
  member_count INTEGER,
  weekly_goal_minutes INTEGER,
  current_week_progress INTEGER,
  is_member BOOLEAN,
  can_post BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sc.id as circle_id,
    sc.name as circle_name,
    cm.role,
    sc.member_count,
    sc.weekly_goal_minutes,
    sc.current_week_progress,
    TRUE as is_member,
    'POST' = ANY(cm.permissions) as can_post
  FROM circle_members cm
  JOIN study_circles sc ON cm.circle_id = sc.id
  WHERE cm.user_id = p_user_id AND cm.is_active = TRUE
  ORDER BY sc.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function: increment_coins
CREATE OR REPLACE FUNCTION increment_coins(p_user_id UUID, p_amount INTEGER)
RETURNS INTEGER AS $$
BEGIN
  UPDATE unified_wallets 
  SET coins = coins + p_amount,
      total_earned_coins = total_earned_coins + GREATEST(p_amount, 0),
      total_spent_coins = total_spent_coins + GREATEST(-p_amount, 0),
      updated_at = NOW()
  WHERE user_id = p_user_id;
  RETURN p_amount;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function: join_study_circle
CREATE OR REPLACE FUNCTION join_study_circle(
  p_circle_id UUID,
  p_user_id UUID,
  p_role TEXT DEFAULT 'MEMBER'
)
RETURNS BOOLEAN AS $$
DECLARE
  v_circle RECORD;
  v_existing_member RECORD;
BEGIN
  -- Check if circle exists and has space
  SELECT * INTO v_circle 
  FROM study_circles 
  WHERE id = p_circle_id AND member_count < max_members;
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Check if already a member
  SELECT * INTO v_existing_member 
  FROM circle_members 
  WHERE circle_id = p_circle_id AND user_id = p_user_id;
  IF FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Add member
  INSERT INTO circle_members (
    circle_id, user_id, role, joined_at, last_active_at
  ) VALUES (
    p_circle_id, p_user_id, p_role, NOW(), NOW()
  );
  
  -- Add activity
  INSERT INTO circle_activities (
    circle_id, user_id, type, data
  ) VALUES (
    p_circle_id, p_user_id, 'MEMBER_JOINED', jsonb_build_object('role', p_role)
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function: leave_study_circle
CREATE OR REPLACE FUNCTION leave_study_circle(p_circle_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Remove membership
  DELETE FROM circle_members 
  WHERE circle_id = p_circle_id AND user_id = p_user_id;
  
  -- Add activity
  INSERT INTO circle_activities (
    circle_id, user_id, type, data
  ) VALUES (
    p_circle_id, p_user_id, 'MEMBER_LEFT', '{}'
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function: purchase_battle_pass_premium
CREATE OR REPLACE FUNCTION purchase_battle_pass_premium(
  p_user_id UUID,
  p_season_id UUID,
  p_gems_deducted INTEGER
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  season_id UUID,
  current_tier INTEGER,
  tier_xp INTEGER,
  total_xp INTEGER,
  is_premium BOOLEAN,
  premium_purchased_at TIMESTAMP WITH TIME ZONE,
  claimed_free_tiers INTEGER[],
  claimed_premium_tiers INTEGER[],
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  -- This would typically integrate with wallet service
  -- For now, just mark as premium
  RETURN QUERY
  UPDATE user_battle_pass
  SET 
    is_premium = true,
    premium_purchased_at = now(),
    updated_at = now()
  WHERE user_id = p_user_id AND season_id = p_season_id
  RETURNING *;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function: send_study_buddy_encouragement
CREATE OR REPLACE FUNCTION send_study_buddy_encouragement(
  p_buddy_pair_id UUID,
  p_from_user_id UUID,
  p_to_user_id UUID,
  p_type TEXT,
  p_message TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if buddy pair is active
  IF NOT EXISTS (
    SELECT 1 FROM study_buddies 
    WHERE id = p_buddy_pair_id AND status = 'ACTIVE'
  ) THEN
    RETURN FALSE;
  END IF;
  
  INSERT INTO study_buddy_encouragements (
    buddy_pair_id, from_user_id, to_user_id, type, message
  ) VALUES (
    p_buddy_pair_id, p_from_user_id, p_to_user_id, p_type, p_message
  );
  
  -- Update encouragement count
  UPDATE study_buddies 
  SET encouragements_sent = CASE 
    WHEN user_id = p_from_user_id THEN encouragements_sent + 1
    ELSE encouragements_sent
  END
  WHERE id = p_buddy_pair_id AND user_id = p_from_user_id;
  
  UPDATE study_buddies 
  SET encouragements_received = CASE 
    WHEN user_id = p_to_user_id THEN encouragements_received + 1
    ELSE encouragements_received
  END
  WHERE id = p_buddy_pair_id AND user_id = p_to_user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function: soft_delete_old_content
CREATE OR REPLACE FUNCTION soft_delete_old_content()
RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  UPDATE study_content
  SET deleted_at = NOW()
  WHERE deleted_at IS NULL
    AND created_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  -- Cascade to generations and packs
  UPDATE study_generations
  SET deleted_at = NOW()
  WHERE deleted_at IS NULL
    AND content_id IN (
      SELECT id FROM study_content WHERE deleted_at IS NOT NULL
    );
  
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function: upsert_session_story
CREATE OR REPLACE FUNCTION upsert_session_story(
    p_id UUID,
    p_session_id UUID,
    p_user_id UUID,
    p_story_data JSONB,
    p_created_at BIGINT
) RETURNS VOID AS $$
BEGIN
    INSERT INTO session_stories (id, session_id, user_id, story_data, created_at)
    VALUES (p_id, p_session_id, p_user_id, p_story_data, p_created_at)
    ON CONFLICT (session_id) DO UPDATE SET
        story_data = EXCLUDED.story_data,
        created_at = EXCLUDED.created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function: record_squad_war_damage (was SET search_path = public, hardening to '')
CREATE OR REPLACE FUNCTION public.record_squad_war_damage(
  p_squad_id uuid,
  p_user_id uuid,
  p_damage integer,
  p_session_id uuid
)
returns void
language plpgsql
SECURITY DEFINER
SET search_path = ''
as $$
declare
  v_war_id uuid;
  v_inserted_id uuid;
begin
  if auth.uid() is distinct from p_user_id then
    raise exception 'You can only record damage for your own user id';
  end if;

  if p_damage <= 0 then
    return;
  end if;

  if not exists (
    select 1
    from public.squad_members
    where squad_members.squad_id = p_squad_id
      and squad_members.user_id = p_user_id
      and coalesce(squad_members.is_active, true)
  ) then
    raise exception 'Only active squad members can record war damage';
  end if;

  select squad_wars.id
    into v_war_id
  from public.squad_wars
  where squad_wars.squad_id = p_squad_id
    and squad_wars.status = 'active'
    and squad_wars.week_starts_at <= now()
    and squad_wars.week_ends_at >= now()
  order by squad_wars.week_starts_at desc
  limit 1;

  if v_war_id is null then
    return;
  end if;

  insert into public.squad_war_damage (
    war_id,
    squad_id,
    user_id,
    session_id,
    damage
  )
  values (
    v_war_id,
    p_squad_id,
    p_user_id,
    p_session_id,
    p_damage
  )
  on conflict (user_id, session_id) do nothing
  returning id into v_inserted_id;

  if v_inserted_id is null then
    return;
  end if;

  update public.squad_wars
  set boss_current_health = greatest(0, boss_current_health - p_damage)
  where id = v_war_id;
end;
$$;
