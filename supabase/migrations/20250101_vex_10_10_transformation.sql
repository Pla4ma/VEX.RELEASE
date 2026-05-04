-- VEX 10/10 Transformation - Database Migrations
-- Run this to create all tables needed for the 10/10 transformation

-- ============================================================================
-- 1. UNIFIED MASTERY SYSTEM
-- ============================================================================

CREATE TABLE mastery_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 5 mastery tracks
  duration_level INTEGER DEFAULT 1,
  duration_xp INTEGER DEFAULT 0,
  duration_total_xp INTEGER DEFAULT 0,
  
  purity_level INTEGER DEFAULT 1,
  purity_xp INTEGER DEFAULT 0,
  purity_total_xp INTEGER DEFAULT 0,
  
  consistency_level INTEGER DEFAULT 1,
  consistency_xp INTEGER DEFAULT 0,
  consistency_total_xp INTEGER DEFAULT 0,
  
  comeback_level INTEGER DEFAULT 1,
  comeback_xp INTEGER DEFAULT 0,
  comeback_total_xp INTEGER DEFAULT 0,
  
  boss_level INTEGER DEFAULT 1,
  boss_xp INTEGER DEFAULT 0,
  boss_total_xp INTEGER DEFAULT 0,
  
  overall_level INTEGER DEFAULT 1,
  overall_rank TEXT DEFAULT 'APPRENTICE',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

CREATE INDEX idx_mastery_tracks_user_id ON mastery_tracks(user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_mastery_tracks_updated_at
  BEFORE UPDATE ON mastery_tracks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 2. PRESTIGE SYSTEM
-- ============================================================================

CREATE TABLE prestige_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  prestige_level INTEGER DEFAULT 0,
  total_prestiges INTEGER DEFAULT 0,
  first_prestige_at TIMESTAMPTZ,
  last_prestige_at TIMESTAMPTZ,
  
  active_bonuses TEXT[] DEFAULT '{}',
  fastest_prestige_days INTEGER,
  most_xp_at_prestige INTEGER,
  
  nightmare_unlocked BOOLEAN DEFAULT FALSE,
  nightmare_completions INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

CREATE INDEX idx_prestige_states_user_id ON prestige_states(user_id);

CREATE TRIGGER update_prestige_states_updated_at
  BEFORE UPDATE ON prestige_states
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 3. JOURNEY MAP (BATTLE PASS REPLACEMENT)
-- ============================================================================

CREATE TABLE journey_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  season_id TEXT NOT NULL,
  
  current_node_id TEXT NOT NULL,
  current_path TEXT NOT NULL, -- PURITY, SPEED, SOCIAL, BALANCED
  
  -- XP per path
  path_xp_purity INTEGER DEFAULT 0,
  path_xp_speed INTEGER DEFAULT 0,
  path_xp_social INTEGER DEFAULT 0,
  path_xp_balanced INTEGER DEFAULT 0,
  total_xp INTEGER DEFAULT 0,
  
  -- Completion tracking
  completed_nodes TEXT[] DEFAULT '{}',
  claimed_rewards TEXT[] DEFAULT '{}',
  
  -- Path switching history (stored as JSON)
  path_switch_history JSONB DEFAULT '[]',
  
  is_premium BOOLEAN DEFAULT FALSE,
  premium_purchased_at TIMESTAMPTZ,
  
  started_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, season_id)
);

CREATE INDEX idx_journey_progress_user_season ON journey_progress(user_id, season_id);

CREATE TRIGGER update_journey_progress_updated_at
  BEFORE UPDATE ON journey_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 4. STREAK INSURANCE SYSTEM
-- ============================================================================

CREATE TABLE streak_insurance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  streak_days_protected INTEGER NOT NULL,
  cost INTEGER NOT NULL,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_streak_insurance_user_active 
  ON streak_insurance(user_id, used) 
  WHERE used = FALSE;

CREATE TABLE streak_gambles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  streak_days_at_risk INTEGER NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  session_id UUID,
  status TEXT DEFAULT 'ACTIVE', -- ACTIVE, WON, LOST, CANCELLED
  required_grade TEXT NOT NULL, -- S, A, B
  actual_grade TEXT,
  bonus_xp_if_won INTEGER,
  settled_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_streak_gambles_user_active 
  ON streak_gambles(user_id, status) 
  WHERE status = 'ACTIVE';

CREATE TABLE comeback_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  source_streak INTEGER NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  used BOOLEAN DEFAULT FALSE,
  restore_value INTEGER DEFAULT 5, -- days restored per token
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comeback_tokens_user_available 
  ON comeback_tokens(user_id, used) 
  WHERE used = FALSE;

-- ============================================================================
-- 5. UNIFIED ECONOMY - ITEMS
-- ============================================================================

CREATE TABLE user_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  template_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  rarity TEXT NOT NULL, -- COMMON, UNCOMMON, RARE, EPIC, LEGENDARY
  type TEXT NOT NULL, -- EQUIPMENT, CONSUMABLE, MATERIAL, COSMETIC, CHEST
  
  -- Equipment stats
  level INTEGER DEFAULT 1,
  max_level INTEGER DEFAULT 10,
  durability INTEGER,
  max_durability INTEGER,
  sockets INTEGER DEFAULT 0,
  gems JSONB DEFAULT '[]',
  
  -- Stats stored as JSON
  stats JSONB DEFAULT '[]',
  set_id TEXT,
  
  equipped BOOLEAN DEFAULT FALSE,
  equipped_slot TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_items_user_id ON user_items(user_id);
CREATE INDEX idx_user_items_equipped ON user_items(user_id, equipped) WHERE equipped = TRUE;

CREATE TRIGGER update_user_items_updated_at
  BEFORE UPDATE ON user_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 6. TRADING POST
-- ============================================================================

CREATE TABLE trading_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES user_items(id) ON DELETE CASCADE,
  
  price INTEGER NOT NULL,
  listed_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  sold BOOLEAN DEFAULT FALSE,
  sold_at TIMESTAMPTZ,
  buyer_id UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_trading_listings_seller ON trading_listings(seller_id, sold) WHERE sold = FALSE;
CREATE INDEX idx_trading_listings_active ON trading_listings(expires_at, sold) 
  WHERE sold = FALSE AND expires_at > NOW();

-- ============================================================================
-- 7. DAILY DUNGEONS
-- ============================================================================

CREATE TABLE daily_dungeons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  boss_id TEXT NOT NULL,
  boss_name TEXT NOT NULL,
  special_mechanic TEXT NOT NULL,
  theme TEXT NOT NULL,
  
  base_health INTEGER NOT NULL,
  time_limit_minutes INTEGER DEFAULT 45,
  
  guaranteed_reward JSONB NOT NULL,
  bonus_rewards JSONB DEFAULT '[]',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_daily_dungeons_date ON daily_dungeons(date);

CREATE TABLE user_dungeon_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dungeon_id UUID NOT NULL REFERENCES daily_dungeons(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  attempts INTEGER DEFAULT 0,
  best_time_seconds INTEGER,
  best_damage INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  
  claimed_rewards TEXT[] DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, dungeon_id)
);

CREATE INDEX idx_user_dungeon_attempts_user_date ON user_dungeon_attempts(user_id, date);

CREATE TRIGGER update_user_dungeon_attempts_updated_at
  BEFORE UPDATE ON user_dungeon_attempts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 8. SQUAD RAIDS
-- ============================================================================

CREATE TABLE squad_raids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id TEXT NOT NULL,
  squad_id UUID NOT NULL REFERENCES squads(id) ON DELETE CASCADE,
  
  scheduled_for TIMESTAMPTZ NOT NULL,
  time_slot TEXT NOT NULL, -- MORNING, AFTERNOON, EVENING
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  
  status TEXT DEFAULT 'SCHEDULED', -- SCHEDULED, IN_PROGRESS, VICTORY, DEFEAT, CANCELLED
  
  boss_health INTEGER NOT NULL,
  boss_max_health INTEGER NOT NULL,
  boss_phase INTEGER DEFAULT 1,
  
  total_damage_dealt INTEGER DEFAULT 0,
  damage_log JSONB DEFAULT '[]',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_squad_raids_squad ON squad_raids(squad_id, status);
CREATE INDEX idx_squad_raids_scheduled ON squad_raids(scheduled_for, status) 
  WHERE status IN ('SCHEDULED', 'IN_PROGRESS');

CREATE TABLE raid_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raid_id UUID NOT NULL REFERENCES squad_raids(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  is_ready BOOLEAN DEFAULT FALSE,
  is_present BOOLEAN DEFAULT FALSE,
  
  session_id UUID,
  session_started_at TIMESTAMPTZ,
  session_ended_at TIMESTAMPTZ,
  
  damage_dealt INTEGER DEFAULT 0,
  purity_score INTEGER,
  session_duration INTEGER,
  completed_session BOOLEAN DEFAULT FALSE,
  
  rewards_received JSONB DEFAULT '[]',
  
  UNIQUE(raid_id, user_id)
);

CREATE INDEX idx_raid_participants_raid ON raid_participants(raid_id);
CREATE INDEX idx_raid_participants_user ON raid_participants(user_id);

-- ============================================================================
-- 9. REAL-TIME DUELS
-- ============================================================================

CREATE TABLE realtime_duels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  challenger_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opponent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  mode TEXT NOT NULL, -- STANDARD, HIGH_STAKES, FRIENDLY
  duration INTEGER NOT NULL,
  boss_id TEXT NOT NULL,
  boss_health INTEGER NOT NULL,
  boss_max_health INTEGER NOT NULL,
  bet_amount INTEGER DEFAULT 0,
  
  status TEXT DEFAULT 'PENDING', -- PENDING, ACCEPTED, IN_PROGRESS, VICTORY, DEFEAT, DRAW, CANCELLED, FORFEIT
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  
  winner_id UUID REFERENCES auth.users(id),
  win_reason TEXT,
  
  events JSONB DEFAULT '[]',
  current_leader UUID,
  lead_changes INTEGER DEFAULT 0,
  
  challenger_damage INTEGER DEFAULT 0,
  challenger_purity INTEGER,
  challenger_completed BOOLEAN DEFAULT FALSE,
  
  opponent_damage INTEGER DEFAULT 0,
  opponent_purity INTEGER,
  opponent_completed BOOLEAN DEFAULT FALSE,
  
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_realtime_duels_challenger ON realtime_duels(challenger_id, status);
CREATE INDEX idx_realtime_duels_opponent ON realtime_duels(opponent_id, status);
CREATE INDEX idx_realtime_duels_active ON realtime_duels(status) 
  WHERE status IN ('PENDING', 'ACCEPTED', 'IN_PROGRESS');

-- ============================================================================
-- 10. AI COACH QUEST SYSTEM
-- ============================================================================

CREATE TABLE coach_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirement_type TEXT NOT NULL, -- SESSION_COUNT, PURITY_THRESHOLD, STREAK_DAYS, BOSS_DEFEAT
  requirement_value INTEGER NOT NULL,
  
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ NOT NULL,
  
  reward_coins INTEGER NOT NULL,
  reward_xp INTEGER,
  reward_item_id TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_coach_quests_user_active ON coach_quests(user_id, completed, expires_at) 
  WHERE completed = FALSE AND expires_at > NOW();

-- ============================================================================
-- 11. USER COACH PREFERENCES
-- ============================================================================

CREATE TABLE user_coach_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  selected_persona TEXT DEFAULT 'SUPPORTIVE',
  unlocked_personas TEXT[] DEFAULT '{"SUPPORTIVE"}',
  is_premium BOOLEAN DEFAULT FALSE,
  
  daily_reminders_enabled BOOLEAN DEFAULT TRUE,
  streak_warnings_enabled BOOLEAN DEFAULT TRUE,
  session_prompts_enabled BOOLEAN DEFAULT TRUE,
  weekly_summary_enabled BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

CREATE INDEX idx_user_coach_preferences_user ON user_coach_preferences(user_id);

-- ============================================================================
-- 12. WALLET (Extended for new economy)
-- ============================================================================

-- If existing wallets table exists, add columns:
-- ALTER TABLE wallets ADD COLUMN IF NOT EXISTS tokens INTEGER DEFAULT 0;
-- ALTER TABLE wallets ADD COLUMN IF NOT EXISTS total_earned_tokens INTEGER DEFAULT 0;
-- ALTER TABLE wallets ADD COLUMN IF NOT EXISTS total_spent_tokens INTEGER DEFAULT 0;

-- If creating new:
CREATE TABLE IF NOT EXISTS unified_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  coins INTEGER DEFAULT 1000,
  tokens INTEGER DEFAULT 0,
  
  total_earned_coins INTEGER DEFAULT 1000,
  total_earned_tokens INTEGER DEFAULT 0,
  total_spent_coins INTEGER DEFAULT 0,
  total_spent_tokens INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_unified_wallets_user ON unified_wallets(user_id);

-- ============================================================================
-- RLS POLICIES (Row Level Security)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE mastery_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE prestige_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE journey_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE streak_insurance ENABLE ROW LEVEL SECURITY;
ALTER TABLE streak_gambles ENABLE ROW LEVEL SECURITY;
ALTER TABLE comeback_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_dungeons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_dungeon_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE squad_raids ENABLE ROW LEVEL SECURITY;
ALTER TABLE raid_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE realtime_duels ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_coach_preferences ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY user_is_owner ON mastery_tracks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY user_is_owner ON prestige_states FOR ALL USING (auth.uid() = user_id);
CREATE POLICY user_is_owner ON journey_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY user_is_owner ON streak_insurance FOR ALL USING (auth.uid() = user_id);
CREATE POLICY user_is_owner ON streak_gambles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY user_is_owner ON comeback_tokens FOR ALL USING (auth.uid() = user_id);
CREATE POLICY user_is_owner ON user_items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY user_is_owner ON user_dungeon_attempts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY user_is_owner ON coach_quests FOR ALL USING (auth.uid() = user_id);
CREATE POLICY user_is_owner ON user_coach_preferences FOR ALL USING (auth.uid() = user_id);

-- Trading listings: everyone can view, only seller can modify
CREATE POLICY public_view ON trading_listings FOR SELECT USING (TRUE);
CREATE POLICY seller_modify ON trading_listings FOR ALL USING (auth.uid()::text = seller_id::text);

-- Raids: squad members can view
CREATE POLICY squad_view ON squad_raids FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM squad_members 
    WHERE squad_id = squad_raids.squad_id 
    AND user_id = auth.uid()
  )
);

-- Raid participants: participants can update their own data
CREATE POLICY participant_modify ON raid_participants FOR ALL USING (auth.uid() = user_id);

-- Duels: both players can view
CREATE POLICY duel_players ON realtime_duels FOR ALL USING (
  auth.uid() = challenger_id OR auth.uid() = opponent_id
);

-- Dungeons: public for viewing (everyone sees same daily dungeon)
CREATE POLICY public_view ON daily_dungeons FOR SELECT USING (TRUE);

-- ============================================================================
-- FUNCTIONS FOR COMMON OPERATIONS
-- ============================================================================

-- Function to increment coins
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get today's dungeon
CREATE OR REPLACE FUNCTION get_today_dungeon()
RETURNS SETOF daily_dungeons AS $$
BEGIN
  RETURN QUERY SELECT * FROM daily_dungeons WHERE date = CURRENT_DATE LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get active raid for user
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Insert initial daily dungeons for testing
INSERT INTO daily_dungeons (date, boss_id, boss_name, special_mechanic, theme, base_health, guaranteed_reward)
VALUES 
  (CURRENT_DATE, 'void_leviathan', 'Void Leviathan', 'REGENERATION', 'VOID', 50000, 
   '{"type": "MATERIAL", "amount": 5, "rarity": "RARE"}'::jsonb),
  (CURRENT_DATE + INTERVAL '1 day', 'inferno_titan', 'Inferno Titan', 'BURNING_AURA', 'FLAME', 55000,
   '{"type": "ITEM", "itemId": "ember_shard", "rarity": "RARE"}'::jsonb),
  (CURRENT_DATE + INTERVAL '2 days', 'glacier_colossus', 'Glacier Colossus', 'FREEZING_TOUCH', 'FROST', 55000,
   '{"type": "COSMETIC", "itemId": "frost_aura", "rarity": "EPIC"}'::jsonb);

COMMENT ON TABLE mastery_tracks IS '5-track unified mastery system (Duration/Purity/Consistency/Comeback/Boss)';
COMMENT ON TABLE journey_progress IS 'Branching journey map replacing linear battle pass';
COMMENT ON TABLE squad_raids IS 'Scheduled cooperative boss battles';
COMMENT ON TABLE realtime_duels IS 'Head-to-head competitive focus sessions';
