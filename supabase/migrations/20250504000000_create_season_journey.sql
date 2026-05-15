/**
 * Create Season Journey Tables
 *
 * Replaces Battle Pass with simplified 20-30 milestone progression.
 * Single reward track, meaningful milestones.
 *
 * @phase 3
 */

-- auth.users RLS is managed by Supabase Auth.

-- ============================================================================
-- Season Journey Core Tables
-- ============================================================================

-- Season Journey Configuration
CREATE TABLE IF NOT EXISTS season_journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id TEXT NOT NULL,
  milestone_count INTEGER NOT NULL DEFAULT 25 CHECK (milestone_count BETWEEN 20 AND 30),
  xp_per_milestone INTEGER NOT NULL DEFAULT 1000,
  theme TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT season_journeys_season_id_unique UNIQUE (season_id)
);

-- Journey Milestones
CREATE TABLE IF NOT EXISTS journey_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_journey_id UUID REFERENCES season_journeys(id) ON DELETE CASCADE,
  milestone_number INTEGER NOT NULL CHECK (milestone_number BETWEEN 1 AND 30),
  xp_required INTEGER NOT NULL,
  reward_id TEXT,
  reward_type TEXT CHECK (reward_type IN ('XP', 'COINS', 'GEMS', 'ITEM', 'COSMETIC', 'TITLE', 'BOOST', 'STREAK_SHIELD')),
  reward_amount INTEGER,
  icon_url TEXT,
  is_major_milestone BOOLEAN DEFAULT FALSE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT journey_milestones_unique UNIQUE (season_journey_id, milestone_number)
);

-- User Journey Progress
CREATE TABLE IF NOT EXISTS user_journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  season_journey_id UUID REFERENCES season_journeys(id) ON DELETE CASCADE,
  current_milestone INTEGER NOT NULL DEFAULT 0 CHECK (current_milestone BETWEEN 0 AND 30),
  milestone_xp INTEGER NOT NULL DEFAULT 0,
  total_xp INTEGER NOT NULL DEFAULT 0,
  claimed_milestones INTEGER[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT user_journeys_user_season_unique UNIQUE (user_id, season_journey_id)
);

-- ============================================================================
-- Seasons Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS journey_seasons (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  theme TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  milestone_count INTEGER NOT NULL DEFAULT 25,
  is_active BOOLEAN DEFAULT FALSE,
  total_xp_required INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_journey_milestones_season_journey_id ON journey_milestones(season_journey_id);
CREATE INDEX IF NOT EXISTS idx_journey_milestones_number ON journey_milestones(milestone_number);
CREATE INDEX IF NOT EXISTS idx_user_journeys_user_id ON user_journeys(user_id);
CREATE INDEX IF NOT EXISTS idx_user_journeys_season_journey_id ON user_journeys(season_journey_id);
CREATE INDEX IF NOT EXISTS idx_user_journeys_current_milestone ON user_journeys(current_milestone);
CREATE INDEX IF NOT EXISTS idx_journey_seasons_is_active ON journey_seasons(is_active);
CREATE INDEX IF NOT EXISTS idx_journey_seasons_dates ON journey_seasons(start_date, end_date);

-- ============================================================================
-- RLS Policies
-- ============================================================================

-- Season Journeys (public read)
CREATE POLICY "Season journeys are publicly viewable" ON season_journeys
  FOR SELECT USING (true);

-- Journey Milestones (public read)
CREATE POLICY "Journey milestones are publicly viewable" ON journey_milestones
  FOR SELECT USING (true);

-- User Journeys (user-specific)
CREATE POLICY "Users can view own journey progress" ON user_journeys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own journey progress" ON user_journeys
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journey progress" ON user_journeys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Journey Seasons (public read)
CREATE POLICY "Journey seasons are publicly viewable" ON journey_seasons
  FOR SELECT USING (true);

-- ============================================================================
-- Triggers
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_journey_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_season_journeys_updated_at
  BEFORE UPDATE ON season_journeys
  FOR EACH ROW EXECUTE FUNCTION update_journey_updated_at_column();

CREATE TRIGGER update_user_journeys_updated_at
  BEFORE UPDATE ON user_journeys
  FOR EACH ROW EXECUTE FUNCTION update_journey_updated_at_column();

-- ============================================================================
-- Initial Data
-- ============================================================================

-- Insert default season if none exists
INSERT INTO journey_seasons (
  id,
  name,
  theme,
  start_date,
  end_date,
  milestone_count,
  is_active,
  total_xp_required
) VALUES (
  'season-2025-q2',
  'Spring 2025',
  'growth',
  '2025-04-01T00:00:00Z',
  '2025-06-30T23:59:59Z',
  25,
  TRUE,
  25000
) ON CONFLICT (id) DO NOTHING;

-- Create season journey for default season
INSERT INTO season_journeys (
  season_id,
  milestone_count,
  xp_per_milestone,
  theme
) VALUES (
  'season-2025-q2',
  25,
  1000,
  'growth'
) ON CONFLICT (season_id) DO NOTHING;

-- Insert default milestones
INSERT INTO journey_milestones (
  season_journey_id,
  milestone_number,
  xp_required,
  reward_type,
  reward_amount,
  name,
  description,
  is_major_milestone
) VALUES 
  -- Get season_journey_id from previous insert
  ((SELECT id FROM season_journeys WHERE season_id = 'season-2025-q2' LIMIT 1), 1, 1000, 'XP', 500, 'First Steps', 'Begin your journey with a boost of XP', FALSE),
  ((SELECT id FROM season_journeys WHERE season_id = 'season-2025-q2' LIMIT 1), 5, 5000, 'COINS', 100, 'Consistent Learner', '5 sessions completed - reward coins', FALSE),
  ((SELECT id FROM season_journeys WHERE season_id = 'season-2025-q2' LIMIT 1), 10, 10000, 'GEMS', 50, 'Dedicated Student', '10 sessions completed - premium gems', TRUE),
  ((SELECT id FROM season_journeys WHERE season_id = 'season-2025-q2' LIMIT 1), 15, 15000, 'ITEM', 1, 'Study Champion', '15 sessions - special item', FALSE),
  ((SELECT id FROM season_journeys WHERE season_id = 'season-2025-q2' LIMIT 1), 20, 20000, 'TITLE', 1, 'Master Student', '20 sessions - exclusive title', TRUE),
  ((SELECT id FROM season_journeys WHERE season_id = 'season-2025-q2' LIMIT 1), 25, 25000, 'COSMETIC', 1, 'Journey Complete', 'Complete the season - special cosmetic', TRUE)
ON CONFLICT (season_journey_id, milestone_number) DO NOTHING;

-- ============================================================================
-- Functions for Journey Management
-- ============================================================================

-- Get user's current journey progress
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add milestone reward to user
CREATE OR REPLACE FUNCTION claim_journey_milestone(
  p_user_id UUID,
  p_season_journey_id UUID,
  p_milestone_number INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_journey RECORD;
  v_milestone RECORD;
  v_already_claimed BOOLEAN;
BEGIN
  -- Get user journey
  SELECT * INTO v_user_journey 
  FROM user_journeys 
  WHERE user_id = p_user_id AND season_journey_id = p_season_journey_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Check if milestone is reached
  IF v_user_journey.current_milestone < p_milestone_number THEN
    RETURN FALSE;
  END IF;
  
  -- Check if already claimed
  v_already_claimed := p_milestone_number = ANY(v_user_journey.claimed_milestones);
  IF v_already_claimed THEN
    RETURN FALSE;
  END IF;
  
  -- Update claimed milestones
  UPDATE user_journeys 
  SET claimed_milestones = array_append(claimed_milestones, p_milestone_number)
  WHERE user_id = p_user_id AND season_journey_id = p_season_journey_id;
  
  -- Get milestone reward
  SELECT * INTO v_milestone
  FROM journey_milestones
  WHERE season_journey_id = p_season_journey_id AND milestone_number = p_milestone_number;
  
  -- Award reward (this would integrate with economy service)
  -- For now, just log the claim
  INSERT INTO user_journey_claims (
    user_id,
    season_journey_id,
    milestone_number,
    reward_type,
    reward_amount,
    claimed_at
  ) VALUES (
    p_user_id,
    p_season_journey_id,
    p_milestone_number,
    v_milestone.reward_type,
    v_milestone.reward_amount,
    NOW()
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Journey Claims Table (for tracking reward history)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_journey_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  season_journey_id UUID REFERENCES season_journeys(id) ON DELETE CASCADE,
  milestone_number INTEGER NOT NULL,
  reward_type TEXT,
  reward_amount INTEGER,
  claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_journey_claims_user_id ON user_journey_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_user_journey_claims_season_journey_id ON user_journey_claims(season_journey_id);

-- RLS for claims
CREATE POLICY "Users can view own journey claims" ON user_journey_claims
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journey claims" ON user_journey_claims
  FOR INSERT WITH CHECK (auth.uid() = user_id);
