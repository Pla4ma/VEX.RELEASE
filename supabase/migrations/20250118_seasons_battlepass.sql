-- ============================================================================
-- Seasons & Battle Pass Migration
-- Production-ready schema for LiveOps Retention Engine
-- ============================================================================

-- ============================================================================
-- Seasons Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  theme VARCHAR(50),
  start_at TIMESTAMP WITH TIME ZONE NOT NULL,
  end_at TIMESTAMP WITH TIME ZONE NOT NULL,
  archived_at TIMESTAMP WITH TIME ZONE,
  tier_count INTEGER NOT NULL DEFAULT 50,
  xp_per_tier INTEGER NOT NULL DEFAULT 1000,
  premium_price_gems INTEGER NOT NULL DEFAULT 499,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_season_dates CHECK (end_at > start_at),
  CONSTRAINT valid_tier_count CHECK (tier_count BETWEEN 10 AND 100),
  CONSTRAINT valid_xp_per_tier CHECK (xp_per_tier BETWEEN 500 AND 5000),
  CONSTRAINT valid_premium_price CHECK (premium_price_gems BETWEEN 99 AND 4999)
);

-- Index for active season lookups
CREATE INDEX idx_seasons_active ON seasons(is_active, start_at, end_at) WHERE is_active = true;
CREATE INDEX idx_seasons_dates ON seasons(start_at, end_at);

-- ============================================================================
-- Battle Pass Tiers Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS battle_pass_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  tier_number INTEGER NOT NULL,
  xp_required INTEGER NOT NULL,
  
  -- Free track reward
  free_reward_type VARCHAR(20),
  free_reward_amount INTEGER,
  free_reward_item_id UUID,
  
  -- Premium track reward
  premium_reward_type VARCHAR(20),
  premium_reward_amount INTEGER,
  premium_reward_item_id UUID,
  
  -- Visual
  icon_url TEXT,
  is_major_milestone BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Unique constraint per season/tier
  CONSTRAINT unique_tier_per_season UNIQUE(season_id, tier_number),
  CONSTRAINT valid_tier_number CHECK (tier_number > 0),
  CONSTRAINT valid_xp_required CHECK (xp_required > 0)
);

CREATE INDEX idx_battle_pass_tiers_season ON battle_pass_tiers(season_id);
CREATE INDEX idx_battle_pass_tiers_milestones ON battle_pass_tiers(season_id, is_major_milestone) WHERE is_major_milestone = true;

-- ============================================================================
-- User Season Progress Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_season_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  
  -- Progress tracking
  current_tier INTEGER DEFAULT 0,
  tier_xp INTEGER DEFAULT 0,
  total_season_xp INTEGER DEFAULT 0,
  
  -- Premium status
  is_premium BOOLEAN DEFAULT false,
  premium_purchased_at TIMESTAMP WITH TIME ZONE,
  
  -- Claimed rewards tracking
  claimed_tiers UUID[] DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Unique constraint per user/season
  CONSTRAINT unique_user_season_progress UNIQUE(user_id, season_id),
  CONSTRAINT valid_current_tier CHECK (current_tier >= 0),
  CONSTRAINT valid_tier_xp CHECK (tier_xp >= 0),
  CONSTRAINT valid_total_xp CHECK (total_season_xp >= 0)
);

CREATE INDEX idx_user_season_progress_user ON user_season_progress(user_id);
CREATE INDEX idx_user_season_progress_season ON user_season_progress(season_id);
CREATE INDEX idx_user_season_progress_premium ON user_season_progress(season_id, is_premium) WHERE is_premium = true;

-- ============================================================================
-- User Battle Pass Table (detailed tier tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_battle_pass (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  
  -- Progress tracking
  current_tier INTEGER DEFAULT 0,
  tier_xp INTEGER DEFAULT 0,
  total_xp INTEGER DEFAULT 0,
  
  -- Premium status
  is_premium BOOLEAN DEFAULT false,
  premium_purchased_at TIMESTAMP WITH TIME ZONE,
  
  -- Detailed claim tracking
  claimed_free_tiers INTEGER[] DEFAULT '{}',
  claimed_premium_tiers INTEGER[] DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT unique_user_battle_pass UNIQUE(user_id, season_id),
  CONSTRAINT valid_bp_tier CHECK (current_tier >= 0),
  CONSTRAINT valid_bp_tier_xp CHECK (tier_xp >= 0),
  CONSTRAINT valid_bp_total_xp CHECK (total_xp >= 0)
);

CREATE INDEX idx_user_battle_pass_user ON user_battle_pass(user_id);
CREATE INDEX idx_user_battle_pass_season ON user_battle_pass(season_id);

-- ============================================================================
-- Season History Table (Archive)
-- ============================================================================
CREATE TABLE IF NOT EXISTS season_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  
  -- Final stats
  final_tier INTEGER NOT NULL,
  total_xp_earned INTEGER NOT NULL,
  challenges_completed INTEGER DEFAULT 0,
  rewards_claimed INTEGER DEFAULT 0,
  was_premium BOOLEAN DEFAULT false,
  
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT valid_final_tier CHECK (final_tier >= 0),
  CONSTRAINT valid_total_xp CHECK (total_xp_earned >= 0),
  CONSTRAINT valid_challenges CHECK (challenges_completed >= 0),
  CONSTRAINT valid_rewards CHECK (rewards_claimed >= 0)
);

CREATE INDEX idx_season_history_user ON season_history(user_id);
CREATE INDEX idx_season_history_season ON season_history(season_id);
CREATE INDEX idx_season_history_completed ON season_history(completed_at);

-- ============================================================================
-- Challenge System Tables
-- ============================================================================
CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  
  -- Challenge definition
  type VARCHAR(20) NOT NULL CHECK (type IN ('DAILY', 'WEEKLY', 'EVENT')),
  category VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  
  -- Target/goal
  target_value INTEGER NOT NULL,
  target_type VARCHAR(50) NOT NULL, -- e.g., 'SESSIONS', 'MINUTES', 'STREAK_DAYS'
  
  -- Rewards
  reward_type VARCHAR(20),
  reward_amount INTEGER,
  reward_item_id UUID,
  
  -- Availability
  start_at TIMESTAMP WITH TIME ZONE,
  end_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT valid_target_value CHECK (target_value > 0),
  CONSTRAINT valid_reward_amount CHECK (reward_amount >= 0)
);

CREATE INDEX idx_challenges_season ON challenges(season_id);
CREATE INDEX idx_challenges_type ON challenges(type);
CREATE INDEX idx_challenges_active ON challenges(is_active, start_at, end_at) WHERE is_active = true;

-- ============================================================================
-- User Challenges Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  
  -- Progress
  current_value INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'CLAIMED', 'EXPIRED', 'REROLLED')),
  
  -- Timestamps
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  claimed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Reroll tracking
  reroll_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT unique_user_challenge UNIQUE(user_id, challenge_id),
  CONSTRAINT valid_progress CHECK (current_value >= 0),
  CONSTRAINT valid_reroll_count CHECK (reroll_count >= 0)
);

CREATE INDEX idx_user_challenges_user ON user_challenges(user_id);
CREATE INDEX idx_user_challenges_challenge ON user_challenges(challenge_id);
CREATE INDEX idx_user_challenges_status ON user_challenges(user_id, status);

-- ============================================================================
-- Challenge Rerolls Table (Fraud Prevention)
-- ============================================================================
CREATE TABLE IF NOT EXISTS challenge_rerolls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_challenge_id UUID REFERENCES challenges(id),
  new_challenge_id UUID REFERENCES challenges(id),
  
  reroll_type VARCHAR(20) CHECK (reroll_type IN ('FREE', 'PAID')),
  gems_spent INTEGER DEFAULT 0,
  
  rerolled_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT valid_gems_spent CHECK (gems_spent >= 0)
);

CREATE INDEX idx_challenge_rerolls_user ON challenge_rerolls(user_id);
CREATE INDEX idx_challenge_rerolls_date ON challenge_rerolls(rerolled_at);

-- ============================================================================
-- LiveOps Config Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS liveops_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  value_type VARCHAR(20) CHECK (value_type IN ('STRING', 'NUMBER', 'BOOLEAN', 'JSON')),
  description TEXT,
  
  -- Targeting
  applies_to_users UUID[], -- null = all users
  applies_to_seasons UUID[], -- null = all seasons
  
  -- Scheduling
  active_from TIMESTAMP WITH TIME ZONE,
  active_until TIMESTAMP WITH TIME ZONE,
  
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_liveops_config_key ON liveops_config(key);
CREATE INDEX idx_liveops_config_active ON liveops_config(active_from, active_until);

-- ============================================================================
-- Feature Flags Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  
  -- Flag state
  enabled BOOLEAN DEFAULT false,
  rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage BETWEEN 0 AND 100),
  
  -- Targeting
  requires_auth BOOLEAN DEFAULT false,
  target_user_ids UUID[], -- specific users
  target_user_segments TEXT[], -- e.g., ['premium', 'level_10_plus']
  
  -- Emergency controls
  emergency_disabled_at TIMESTAMP WITH TIME ZONE,
  emergency_disabled_by UUID REFERENCES auth.users(id),
  emergency_reason TEXT,
  
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT valid_rollout CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100)
);

CREATE INDEX idx_feature_flags_key ON feature_flags(key);
CREATE INDEX idx_feature_flags_enabled ON feature_flags(enabled);

-- ============================================================================
-- Admin Users Table (for RLS policies)
-- ============================================================================
CREATE TABLE IF NOT EXISTS admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  granted_by UUID REFERENCES auth.users(id)
);

-- Insert a default admin (replace with actual admin user ID)
-- INSERT INTO admin_users (user_id, role) VALUES ('your-admin-uuid', 'super_admin');

-- ============================================================================
-- Row Level Security Policies
-- ============================================================================

-- Seasons: readable by all, writable by admins only
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_pass_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY seasons_read_all ON seasons
  FOR SELECT TO authenticated, anon
  USING (true);

CREATE POLICY seasons_write_admin_select ON seasons
  FOR SELECT TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM admin_users));
CREATE POLICY seasons_write_admin_insert ON seasons
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users));
CREATE POLICY seasons_write_admin_update ON seasons
  FOR UPDATE TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM admin_users))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users));
CREATE POLICY seasons_write_admin_delete ON seasons
  FOR DELETE TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM admin_users));

-- User Season Progress: users can only access their own
ALTER TABLE user_season_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_progress_own ON user_season_progress
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- User Battle Pass: users can only access their own
ALTER TABLE user_battle_pass ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_battle_pass_own ON user_battle_pass
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Challenges: readable by all
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY challenges_read_all ON challenges
  FOR SELECT TO authenticated, anon
  USING (true);

CREATE POLICY challenges_write_admin ON challenges
  FOR ALL TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM admin_users))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users));

-- User Challenges: users can only access their own
ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_challenges_own ON user_challenges
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Challenge Rerolls: users can only access their own
ALTER TABLE challenge_rerolls ENABLE ROW LEVEL SECURITY;

CREATE POLICY challenge_rerolls_own ON challenge_rerolls
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Season History: users can only access their own
ALTER TABLE season_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY season_history_own ON season_history
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- LiveOps Config: readable by all, writable by admins
ALTER TABLE liveops_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY liveops_read_all ON liveops_config
  FOR SELECT TO authenticated, anon
  USING (true);

CREATE POLICY liveops_write_admin ON liveops_config
  FOR ALL TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM admin_users))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users));

-- Feature Flags: readable by all, writable by admins
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY feature_flags_read_all ON feature_flags
  FOR SELECT TO authenticated, anon
  USING (true);

CREATE POLICY feature_flags_write_admin ON feature_flags
  FOR ALL TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM admin_users))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users));

-- ============================================================================
-- Functions
-- ============================================================================

-- Function to get season statistics
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can reroll (fraud prevention)
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle battle pass premium purchase (atomic)
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update timestamps automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply timestamp triggers
CREATE TRIGGER update_seasons_timestamp BEFORE UPDATE ON seasons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_season_progress_timestamp BEFORE UPDATE ON user_season_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_battle_pass_timestamp BEFORE UPDATE ON user_battle_pass
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_liveops_config_timestamp BEFORE UPDATE ON liveops_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feature_flags_timestamp BEFORE UPDATE ON feature_flags
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
