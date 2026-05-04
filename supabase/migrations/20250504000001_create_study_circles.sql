/**
 * Create Study Circles Tables
 *
 * Replaces Squads with async accountability groups.
 * 3-8 members, shared weekly goals, no real-time features.
 *
 * @phase 3
 */

-- Enable RLS
ALTER TABLE IF NOT EXISTS auth.users ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Study Circles Core Tables
-- ============================================================================

-- Study Circles
CREATE TABLE IF NOT EXISTS study_circles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  banner_url TEXT,
  
  -- Stats
  member_count INTEGER NOT NULL DEFAULT 0,
  max_members INTEGER NOT NULL DEFAULT 6 CHECK (max_members BETWEEN 3 AND 8),
  total_focus_time INTEGER NOT NULL DEFAULT 0, -- Total minutes from all members
  completed_sessions INTEGER NOT NULL DEFAULT 0,
  
  -- Shared goal (replaces boss/challenge)
  weekly_goal_minutes INTEGER NOT NULL DEFAULT 120, -- 2 hours per week default
  current_week_progress INTEGER NOT NULL DEFAULT 0,
  
  -- Settings
  is_public BOOLEAN DEFAULT FALSE,
  join_requirements TEXT NOT NULL DEFAULT 'APPROVAL' CHECK (join_requirements IN ('OPEN', 'APPROVAL', 'INVITE_ONLY')),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Circle Members
CREATE TABLE IF NOT EXISTS circle_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID REFERENCES study_circles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'MEMBER' CHECK (role IN ('FOUNDER', 'MEMBER')),
  
  -- Membership state
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Contribution tracking (simplified)
  sessions_completed INTEGER NOT NULL DEFAULT 0,
  total_focus_time INTEGER NOT NULL DEFAULT 0, -- Minutes
  weekly_contribution INTEGER NOT NULL DEFAULT 0, -- Minutes this week
  streak_days INTEGER NOT NULL DEFAULT 0,
  
  -- Permissions (simplified)
  permissions TEXT[] DEFAULT ARRAY['VIEW', 'POST'],
  
  CONSTRAINT circle_members_unique UNIQUE (circle_id, user_id)
);

-- Weekly Accountability Checks
CREATE TABLE IF NOT EXISTS circle_weekly_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID REFERENCES study_circles(id) ON DELETE CASCADE,
  week_start TIMESTAMP WITH TIME ZONE NOT NULL, -- Monday timestamp
  week_end TIMESTAMP WITH TIME ZONE NOT NULL,   -- Sunday timestamp
  
  -- Each member's commitment
  member_goals JSONB NOT NULL DEFAULT '[]', -- Array of {userId, goalMinutes, actualMinutes, completed}
  
  -- Circle totals
  total_goal_minutes INTEGER NOT NULL DEFAULT 0,
  total_actual_minutes INTEGER NOT NULL DEFAULT 0,
  percent_complete NUMERIC(5,2) DEFAULT 0.00,
  all_members_met_goal BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Circle Activity Feed (Async)
CREATE TABLE IF NOT EXISTS circle_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID REFERENCES study_circles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'SESSION_COMPLETED', 'GOAL_UPDATED', 'MEMBER_JOINED', 
    'STREAK_MILESTONE', 'WEEKLY_GOAL_MET'
  )),
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Circle Invites
CREATE TABLE IF NOT EXISTS circle_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID REFERENCES study_circles(id) ON DELETE CASCADE,
  invited_by_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'DECLINED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  
  CONSTRAINT circle_invites_unique UNIQUE (circle_id, invited_user_id, status)
);

-- ============================================================================
-- Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_study_circles_is_public ON study_circles(is_public);
CREATE INDEX IF NOT EXISTS idx_study_circles_created_by ON study_circles(created_by);
CREATE INDEX IF NOT EXISTS idx_circle_members_circle_id ON circle_members(circle_id);
CREATE INDEX IF NOT EXISTS idx_circle_members_user_id ON circle_members(user_id);
CREATE INDEX IF NOT EXISTS idx_circle_members_is_active ON circle_members(is_active);
CREATE INDEX IF NOT EXISTS idx_circle_weekly_checks_circle_id ON circle_weekly_checks(circle_id);
CREATE INDEX IF NOT EXISTS idx_circle_weekly_checks_week_start ON circle_weekly_checks(week_start);
CREATE INDEX IF NOT EXISTS idx_circle_activities_circle_id ON circle_activities(circle_id);
CREATE INDEX IF NOT EXISTS idx_circle_activities_created_at ON circle_activities(created_at);
CREATE INDEX IF NOT EXISTS idx_circle_activities_user_id ON circle_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_circle_invites_circle_id ON circle_invites(circle_id);
CREATE INDEX IF NOT EXISTS idx_circle_invites_invited_user_id ON circle_invites(invited_user_id);
CREATE INDEX IF NOT EXISTS idx_circle_invites_status ON circle_invites(status);

-- ============================================================================
-- RLS Policies
-- ============================================================================

-- Study Circles (public read, member write)
CREATE POLICY "Study circles are publicly viewable" ON study_circles
  FOR SELECT USING (true);

CREATE POLICY "Users can create study circles" ON study_circles
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Circle members can update own circles" ON study_circles
  FOR UPDATE USING (
    id IN (
      SELECT circle_id FROM circle_members 
      WHERE user_id = auth.uid() AND role = 'FOUNDER'
    )
  );

-- Circle Members (member-specific)
CREATE POLICY "Users can view own circle memberships" ON circle_members
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own circle memberships" ON circle_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Circle members can update own membership" ON circle_members
  FOR UPDATE USING (auth.uid() = user_id);

-- Circle Activities (member-specific)
CREATE POLICY "Circle members can view own circle activities" ON circle_activities
  FOR SELECT USING (
    user_id = auth.uid() OR 
    circle_id IN (
      SELECT circle_id FROM circle_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Circle members can create activities" ON circle_activities
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    circle_id IN (
      SELECT circle_id FROM circle_members WHERE user_id = auth.uid()
    )
  );

-- Circle Invites (user-specific)
CREATE POLICY "Users can view own circle invites" ON circle_invites
  FOR SELECT USING (
    invited_user_id = auth.uid() OR 
    invited_by_user_id = auth.uid()
  );

CREATE POLICY "Users can create circle invites" ON circle_invites
  FOR INSERT WITH CHECK (invited_by_user_id = auth.uid());

CREATE POLICY "Users can update own invites" ON circle_invites
  FOR UPDATE USING (invited_user_id = auth.uid() OR invited_by_user_id = auth.uid());

-- Weekly Checks (member-specific)
CREATE POLICY "Circle members can view weekly checks" ON circle_weekly_checks
  FOR SELECT USING (
    circle_id IN (
      SELECT circle_id FROM circle_members WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- Triggers
-- ============================================================================

-- Update updated_at timestamps
CREATE OR REPLACE FUNCTION update_study_circles_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_circle_weekly_checks_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_study_circles_updated_at
  BEFORE UPDATE ON study_circles
  FOR EACH ROW EXECUTE FUNCTION update_study_circles_updated_at_column();

CREATE TRIGGER update_circle_weekly_checks_updated_at
  BEFORE UPDATE ON circle_weekly_checks
  FOR EACH ROW EXECUTE FUNCTION update_study_weekly_checks_updated_at_column();

-- Update circle member count
CREATE OR REPLACE FUNCTION update_circle_member_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE study_circles 
  SET member_count = (
    SELECT COUNT(*) FROM circle_members 
    WHERE circle_id = NEW.circle_id AND is_active = TRUE
  )
  WHERE id = NEW.circle_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_circle_member_count_on_insert
  AFTER INSERT OR UPDATE OR DELETE ON circle_members
  FOR EACH ROW EXECUTE PROCEDURE update_circle_member_count();

-- ============================================================================
-- Functions for Circle Management
-- ============================================================================

-- Get user's circle memberships
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get circle activity feed
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add member to circle
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Leave circle
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
$$ LANGUAGE plpgsql SECURITY DEFINER;
