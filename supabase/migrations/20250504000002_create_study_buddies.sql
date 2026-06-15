/**
 * Create Study Buddies Tables
 *
 * Replaces Rivals with non-competitive accountability pairs.
 * Mutual support, encouragement, and shared goals.
 *
 * @phase 3
 */

-- auth.users RLS is managed by Supabase Auth.

-- ============================================================================
-- Study Buddies Core Tables
-- ============================================================================

-- Study Buddy Pairs
CREATE TABLE IF NOT EXISTS study_buddies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  buddy_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Simple status (no complex rivalry states)
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACTIVE', 'PAUSED', 'ENDED')),
  initiated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  initiated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE NULL,
  ended_at TIMESTAMP WITH TIME ZONE NULL,
  end_reason TEXT CHECK (end_reason IN ('MUTUAL_AGREEMENT', 'TIMEOUT', 'USER_INITIATED', 'GOAL_COMPLETED', 'PREFERENCE_CHANGE')),
  
  -- Shared goal (replaces stakes)
  shared_goal_id UUID,
  
  -- Mutual stats (no winner/loser)
  mutual_stats JSONB DEFAULT '{}',
  
  -- Encouragement tracking
  encouragements_sent INTEGER NOT NULL DEFAULT 0,
  encouragements_received INTEGER NOT NULL DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT study_buddies_unique UNIQUE (user_id, buddy_id)
);

-- Shared Goals
CREATE TABLE IF NOT EXISTS study_buddy_shared_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  metric TEXT NOT NULL CHECK (metric IN ('SESSIONS', 'MINUTES', 'STREAK_DAYS', 'DAYS_ACTIVE')),
  target INTEGER NOT NULL CHECK (target > 0),
  timeframe TEXT NOT NULL CHECK (timeframe IN ('DAILY', 'WEEKLY', 'MONTHLY')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Encouragement Messages
CREATE TABLE IF NOT EXISTS study_buddy_encouragements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buddy_pair_id UUID REFERENCES study_buddies(id) ON DELETE CASCADE,
  from_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('GREAT_JOB', 'KEEP_GOING', 'STREAK_ALMOST', 'MISSED_YOU', 'CUSTOM')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  seen BOOLEAN DEFAULT FALSE
);

-- Daily Check-ins (async accountability)
CREATE TABLE IF NOT EXISTS study_buddy_check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buddy_pair_id UUID REFERENCES study_buddies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date TEXT NOT NULL CHECK (date ~ '^\d{4}-\d{2}-\d{2}$'), -- YYYY-MM-DD
  
  -- Simple daily check-in
  completed_session BOOLEAN DEFAULT FALSE,
  minutes_studied INTEGER DEFAULT 0,
  mood TEXT CHECK (mood IN ('GREAT', 'GOOD', 'OKAY', 'STRUGGLING')),
  note TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT buddy_check_ins_unique UNIQUE (buddy_pair_id, user_id, date)
);

-- ============================================================================
-- Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_study_buddies_user_id ON study_buddies(user_id);
CREATE INDEX IF NOT EXISTS idx_study_buddies_buddy_id ON study_buddies(buddy_id);
CREATE INDEX IF NOT EXISTS idx_study_buddies_status ON study_buddies(status);
CREATE INDEX IF NOT EXISTS idx_study_buddies_initiated_at ON study_buddies(initiated_at);

CREATE INDEX IF NOT EXISTS idx_study_buddy_encouragements_buddy_pair_id ON study_buddy_encouragements(buddy_pair_id);
CREATE INDEX IF NOT EXISTS idx_study_buddy_encouragements_from_user_id ON study_buddy_encouragements(from_user_id);
CREATE INDEX IF NOT EXISTS idx_study_buddy_encouragements_to_user_id ON study_buddy_encouragements(to_user_id);
CREATE INDEX IF NOT EXISTS idx_study_buddy_encouragements_created_at ON study_buddy_encouragements(created_at);

CREATE INDEX IF NOT EXISTS idx_study_buddy_check_ins_buddy_pair_id ON study_buddy_check_ins(buddy_pair_id);
CREATE INDEX IF NOT EXISTS idx_study_buddy_check_ins_user_id ON study_buddy_check_ins(user_id);
CREATE INDEX IF NOT EXISTS idx_study_buddy_check_ins_date ON study_buddy_check_ins(date);

-- ============================================================================
-- RLS Policies
-- ============================================================================

ALTER TABLE study_buddies ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_buddy_shared_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_buddy_encouragements ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_buddy_check_ins ENABLE ROW LEVEL SECURITY;

-- Study Buddies (user-specific)
CREATE POLICY "Users can view own study buddies" ON study_buddies
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = buddy_id)
  WITH CHECK (auth.uid() = user_id OR auth.uid() = buddy_id);

CREATE POLICY "Users can create own study buddy requests" ON study_buddies
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own study buddy relationships" ON study_buddies
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = buddy_id);

-- Shared Goals (public read)
CREATE POLICY "Shared goals are publicly viewable" ON study_buddy_shared_goals
  FOR SELECT USING (true);

CREATE POLICY "Users can create shared goals" ON study_buddy_shared_goals
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Encouragements (participant-specific)
CREATE POLICY "Users can view own encouragements" ON study_buddy_encouragements
  FOR SELECT USING (
    auth.uid() = from_user_id OR 
    auth.uid() = to_user_id OR
    buddy_pair_id IN (
      SELECT id FROM study_buddies 
      WHERE (user_id = auth.uid() OR buddy_id = auth.uid())
    )
  );

CREATE POLICY "Users can create encouragements" ON study_buddy_encouragements
  FOR INSERT WITH CHECK (
    auth.uid() = from_user_id AND
    buddy_pair_id IN (
      SELECT id FROM study_buddies 
      WHERE (user_id = auth.uid() OR buddy_id = auth.uid()) AND status = 'ACTIVE'
    )
  );

-- Check-ins (participant-specific)
CREATE POLICY "Users can view own check-ins" ON study_buddy_check_ins
  FOR SELECT USING (
    auth.uid() = user_id AND
    buddy_pair_id IN (
      SELECT id FROM study_buddies 
      WHERE (user_id = auth.uid() OR buddy_id = auth.uid()) AND status = 'ACTIVE'
    )
  );

CREATE POLICY "Users can create own check-ins" ON study_buddy_check_ins
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    buddy_pair_id IN (
      SELECT id FROM study_buddies 
      WHERE (user_id = auth.uid() OR buddy_id = auth.uid()) AND status = 'ACTIVE'
    )
  );

-- ============================================================================
-- Triggers
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_study_buddies_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_study_buddy_shared_goals_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_study_buddy_check_ins_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_study_buddies_updated_at
  BEFORE UPDATE ON study_buddies
  FOR EACH ROW EXECUTE FUNCTION update_study_buddies_updated_at_column();

CREATE TRIGGER update_study_buddy_shared_goals_updated_at
  BEFORE UPDATE ON study_buddy_shared_goals
  FOR EACH ROW EXECUTE FUNCTION update_study_buddy_shared_goals_updated_at_column();

CREATE TRIGGER update_study_buddy_check_ins_updated_at
  BEFORE UPDATE ON study_buddy_check_ins
  FOR EACH ROW EXECUTE FUNCTION update_study_buddy_check_ins_updated_at_column();

-- ============================================================================
-- Functions for Buddy Management
-- ============================================================================

-- Get user's study buddy relationships
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Send encouragement to buddy
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Initial Data
-- ============================================================================

-- Insert default shared goals
INSERT INTO study_buddy_shared_goals (description, metric, target, timeframe) VALUES
  ('Study 5 days this week', 'DAYS_ACTIVE', 5, 'WEEKLY'),
  ('Complete 3 sessions', 'SESSIONS', 3, 'WEEKLY'),
  ('Focus 150 minutes', 'MINUTES', 150, 'WEEKLY'),
  ('Maintain 3-day streak', 'STREAK_DAYS', 3, 'WEEKLY')
ON CONFLICT DO NOTHING;
