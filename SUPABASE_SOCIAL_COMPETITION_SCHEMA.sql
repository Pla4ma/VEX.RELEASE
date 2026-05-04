--
-- VEX Social & Competition Layer Database Schema
-- Phase 6: Squads, Guilds, Feed, Duels, Rankings
--

-- ============================================================================
-- SQUADS
-- ============================================================================

-- Squads table
CREATE TABLE squads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  is_public BOOLEAN DEFAULT true,
  join_requirements TEXT DEFAULT 'APPROVAL' CHECK (join_requirements IN ('OPEN', 'APPROVAL', 'INVITE_ONLY')),
  min_level_requirement INTEGER,
  member_count INTEGER DEFAULT 0,
  max_members INTEGER DEFAULT 5,
  total_focus_time BIGINT DEFAULT 0,
  focus_multiplier DECIMAL(3,2) DEFAULT 1.00,
  current_synergy_level INTEGER DEFAULT 1,
  current_synergy_points INTEGER DEFAULT 0,
  points_to_next_synergy INTEGER DEFAULT 100,
  focus_multiplier_bonus DECIMAL(3,2) DEFAULT 0.00,
  active_challenge_id UUID,
  active_boss_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Squad members
CREATE TABLE squad_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  squad_id UUID NOT NULL REFERENCES squads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'MEMBER' CHECK (role IN ('FOUNDER', 'ADMIN', 'MODERATOR', 'MEMBER', 'GUEST')),
  is_active BOOLEAN DEFAULT true,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  contribution_score INTEGER DEFAULT 0,
  weekly_contribution INTEGER DEFAULT 0,
  monthly_contribution INTEGER DEFAULT 0,
  last_contribution_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(squad_id, user_id)
);

-- Squad invites
CREATE TABLE squad_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  squad_id UUID NOT NULL REFERENCES squads(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_offered TEXT DEFAULT 'MEMBER' CHECK (role_offered IN ('FOUNDER', 'ADMIN', 'MODERATOR', 'MEMBER', 'GUEST')),
  message TEXT,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'CANCELLED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  responded_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(squad_id, invited_user_id, status) WHERE status = 'PENDING'
);

-- Squad join requests
CREATE TABLE squad_join_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  squad_id UUID NOT NULL REFERENCES squads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  responded_at TIMESTAMP WITH TIME ZONE,
  responded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE(squad_id, user_id, status) WHERE status = 'PENDING'
);

-- Squad sessions
CREATE TABLE squad_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  squad_id UUID NOT NULL REFERENCES squads(id) ON DELETE CASCADE,
  started_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'CANCELLED')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  total_duration INTEGER DEFAULT 0,
  total_focus_time INTEGER DEFAULT 0,
  participant_count INTEGER DEFAULT 0
);

-- Squad session participants
CREATE TABLE squad_session_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES squad_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'WAITING' CHECK (status IN ('WAITING', 'ACTIVE', 'PAUSED', 'COMPLETED', 'LEFT')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  left_at TIMESTAMP WITH TIME ZONE,
  focus_time INTEGER DEFAULT 0,
  contribution_points INTEGER DEFAULT 0,
  UNIQUE(session_id, user_id)
);

-- Squad synergy
CREATE TABLE squad_synergy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  squad_id UUID NOT NULL REFERENCES squads(id) ON DELETE CASCADE,
  level INTEGER DEFAULT 1,
  current_points INTEGER DEFAULT 0,
  points_to_next INTEGER DEFAULT 100,
  multiplier_bonus DECIMAL(3,2) DEFAULT 0.00,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- GUILDS
-- ============================================================================

-- Guilds table
CREATE TABLE guilds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  banner_url TEXT,
  is_public BOOLEAN DEFAULT true,
  join_requirements TEXT DEFAULT 'APPROVAL' CHECK (join_requirements IN ('OPEN', 'APPROVAL', 'INVITE_ONLY')),
  min_level_requirement INTEGER,
  member_count INTEGER DEFAULT 0,
  max_members INTEGER DEFAULT 20,
  total_contribution BIGINT DEFAULT 0,
  tier INTEGER DEFAULT 1,
  tier_progress INTEGER DEFAULT 0,
  reputation INTEGER DEFAULT 0,
  has_guild_hall BOOLEAN DEFAULT false,
  unlocked_perks JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Guild members
CREATE TABLE guild_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id UUID NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'RECRUIT' CHECK (role IN ('MASTER', 'OFFICER', 'VETERAN', 'MEMBER', 'RECRUIT')),
  is_active BOOLEAN DEFAULT true,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  contribution_points INTEGER DEFAULT 0,
  weekly_contribution INTEGER DEFAULT 0,
  monthly_contribution INTEGER DEFAULT 0,
  lifetime_contribution INTEGER DEFAULT 0,
  last_contribution_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(guild_id, user_id)
);

-- Guild invites
CREATE TABLE guild_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id UUID NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_offered TEXT DEFAULT 'MEMBER' CHECK (role_offered IN ('MASTER', 'OFFICER', 'VETERAN', 'MEMBER', 'RECRUIT')),
  message TEXT,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'CANCELLED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  responded_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(guild_id, invited_user_id, status) WHERE status = 'PENDING'
);

-- Guild quests
CREATE TABLE guild_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id UUID NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('DAILY', 'WEEKLY', 'SEASONAL', 'SPECIAL')),
  target_value INTEGER NOT NULL,
  current_value INTEGER DEFAULT 0,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'EXPIRED')),
  contribution_reward INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Guild activities
CREATE TABLE guild_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id UUID NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- FEED
-- ============================================================================

-- Feed items
CREATE TABLE feed_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('SESSION_COMPLETE', 'STREAK_MILESTONE', 'LEVEL_UP', 'ACHIEVEMENT_UNLOCKED', 'BOSS_DEFEAT', 'ITEM_CRAFTED', 'SHOP_PURCHASE', 'SQUAD_JOINED', 'GUILD_JOINED', 'DUEL_WON', 'RANKING_ACHIEVED', 'SEASON_REWARD', 'CHALLENGE_COMPLETED', 'CUSTOM')),
  content TEXT NOT NULL,
  metadata JSONB,
  visibility TEXT DEFAULT 'PUBLIC' CHECK (visibility IN ('PUBLIC', 'FRIENDS', 'SQUAD', 'GUILD', 'PRIVATE')),
  squad_id UUID REFERENCES squads(id) ON DELETE SET NULL,
  guild_id UUID REFERENCES guilds(id) ON DELETE SET NULL,
  reaction_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Feed reactions
CREATE TABLE feed_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feed_item_id UUID NOT NULL REFERENCES feed_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('LIKE', 'LOVE', 'FIRE', 'CLAP', 'WOW', 'THINKING', 'TROPHY')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(feed_item_id, user_id)
);

-- Feed comments
CREATE TABLE feed_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feed_item_id UUID NOT NULL REFERENCES feed_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES feed_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  reaction_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_edited BOOLEAN DEFAULT false
);

-- ============================================================================
-- DUELS
-- ============================================================================

-- Duels table
CREATE TABLE duels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED', 'EXPIRED', 'DISPUTED')),
  challenger_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenged_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  duration INTEGER NOT NULL CHECK (duration >= 60 AND duration <= 7200),
  category TEXT NOT NULL,
  stake_type TEXT DEFAULT 'NONE' CHECK (stake_type IN ('NONE', 'COINS', 'GEMS', 'XP')),
  stake_amount INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  winner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  forfeit_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ended_reason TEXT CHECK (ended_reason IN ('COMPLETED', 'FORFEIT', 'DISCONNECT', 'TIMEOUT', 'CANCELLED', 'DISPUTED'))
);

-- Duel sessions
CREATE TABLE duel_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  duel_id UUID NOT NULL REFERENCES duels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'WAITING' CHECK (status IN ('WAITING', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ABANDONED')),
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  focus_time INTEGER DEFAULT 0,
  pause_count INTEGER DEFAULT 0,
  total_pause_time INTEGER DEFAULT 0,
  checkpoints JSONB DEFAULT '[]',
  final_score INTEGER,
  completed BOOLEAN DEFAULT false,
  UNIQUE(duel_id, user_id)
);

-- Duel results
CREATE TABLE duel_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  duel_id UUID NOT NULL REFERENCES duels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opponent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  outcome TEXT NOT NULL CHECK (outcome IN ('WIN', 'LOSS', 'DRAW', 'FORFEIT')),
  focus_time INTEGER DEFAULT 0,
  score INTEGER DEFAULT 0,
  rank_at_time INTEGER DEFAULT 1000,
  xp_gained INTEGER DEFAULT 0,
  currency_gained INTEGER DEFAULT 0,
  rating_change INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Duel stats
CREATE TABLE duel_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  total_duels INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  forfeits INTEGER DEFAULT 0,
  win_rate DECIMAL(4,3) DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  total_focus_time INTEGER DEFAULT 0,
  average_score DECIMAL(10,2) DEFAULT 0,
  best_score INTEGER DEFAULT 0,
  current_rating INTEGER DEFAULT 1000,
  peak_rating INTEGER DEFAULT 1000,
  rank_tier TEXT DEFAULT 'BRONZE' CHECK (rank_tier IN ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'MASTER', 'LEGEND')),
  last_duel_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Matchmaking queue
CREATE TABLE matchmaking_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER DEFAULT 1000,
  preferred_duration INTEGER DEFAULT 600,
  preferred_category TEXT,
  stake_preference TEXT DEFAULT 'NONE',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- RANKINGS
-- ============================================================================

-- Leaderboards
CREATE TABLE leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('XP', 'FOCUS_TIME', 'SESSION_COUNT', 'STREAK_LENGTH', 'DUEL_RATING', 'CONTRIBUTION', 'ACHIEVEMENTS', 'CUSTOM')),
  scope TEXT NOT NULL CHECK (scope IN ('GLOBAL', 'REGIONAL', 'SQUAD', 'GUILD', 'FRIENDS')),
  period TEXT NOT NULL CHECK (period IN ('DAILY', 'WEEKLY', 'MONTHLY', 'SEASONAL', 'ALL_TIME')),
  squad_id UUID REFERENCES squads(id) ON DELETE CASCADE,
  guild_id UUID REFERENCES guilds(id) ON DELETE CASCADE,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  total_participants INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  frozen BOOLEAN DEFAULT false,
  UNIQUE(type, scope, period, squad_id, guild_id)
);

-- Leaderboard entries
CREATE TABLE leaderboard_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leaderboard_id UUID NOT NULL REFERENCES leaderboards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rank INTEGER NOT NULL,
  previous_rank INTEGER,
  value DECIMAL(20,2) DEFAULT 0,
  display_value TEXT,
  rank_change INTEGER DEFAULT 0,
  value_change DECIMAL(20,2) DEFAULT 0,
  UNIQUE(leaderboard_id, user_id)
);

-- Rank tiers
CREATE TABLE rank_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (name IN ('Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Grandmaster', 'Legend')),
  level INTEGER NOT NULL UNIQUE,
  min_rating INTEGER NOT NULL,
  max_rating INTEGER NOT NULL,
  color TEXT NOT NULL,
  icon_url TEXT NOT NULL,
  badge_url TEXT NOT NULL,
  rewards JSONB DEFAULT '[]'
);

-- User rankings
CREATE TABLE user_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  global_rank INTEGER,
  regional_rank INTEGER,
  rankings JSONB DEFAULT '[]',
  best_global_rank INTEGER DEFAULT 999999,
  best_category_rank JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Season summaries
CREATE TABLE season_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  season_id UUID NOT NULL,
  season_name TEXT NOT NULL,
  final_rank INTEGER NOT NULL,
  final_tier TEXT NOT NULL,
  total_participants INTEGER NOT NULL,
  percentile DECIMAL(5,2) NOT NULL,
  xp_gained INTEGER DEFAULT 0,
  sessions_completed INTEGER DEFAULT 0,
  total_focus_time INTEGER DEFAULT 0,
  streak_high INTEGER DEFAULT 0,
  duels_won INTEGER DEFAULT 0,
  duels_played INTEGER DEFAULT 0,
  rewards_earned JSONB DEFAULT '[]',
  total_reward_value INTEGER DEFAULT 0,
  rank_improvement INTEGER,
  tier_improvement INTEGER,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  share_card_url TEXT
);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Increment feed counter
CREATE OR REPLACE FUNCTION increment_feed_counter(
  p_feed_item_id UUID,
  p_column TEXT
) RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF p_column = 'reaction_count' THEN
    UPDATE feed_items SET reaction_count = reaction_count + 1 WHERE id = p_feed_item_id;
  ELSIF p_column = 'comment_count' THEN
    UPDATE feed_items SET comment_count = comment_count + 1 WHERE id = p_feed_item_id;
  ELSIF p_column = 'share_count' THEN
    UPDATE feed_items SET share_count = share_count + 1 WHERE id = p_feed_item_id;
  END IF;
END;
$$;

-- Decrement feed counter
CREATE OR REPLACE FUNCTION decrement_feed_counter(
  p_feed_item_id UUID,
  p_column TEXT
) RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF p_column = 'reaction_count' THEN
    UPDATE feed_items SET reaction_count = GREATEST(0, reaction_count - 1) WHERE id = p_feed_item_id;
  ELSIF p_column = 'comment_count' THEN
    UPDATE feed_items SET comment_count = GREATEST(0, comment_count - 1) WHERE id = p_feed_item_id;
  ELSIF p_column = 'share_count' THEN
    UPDATE feed_items SET share_count = GREATEST(0, share_count - 1) WHERE id = p_feed_item_id;
  END IF;
END;
$$;

-- Increment comment reply count
CREATE OR REPLACE FUNCTION increment_comment_reply_count(
  p_comment_id UUID
) RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE feed_comments SET reply_count = reply_count + 1 WHERE id = p_comment_id;
END;
$$;

-- Add duel checkpoint
CREATE OR REPLACE FUNCTION add_duel_checkpoint(
  p_session_id UUID,
  p_timestamp BIGINT,
  p_focus_time INTEGER,
  p_is_valid BOOLEAN
) RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE duel_sessions 
  SET checkpoints = checkpoints || jsonb_build_object(
    'timestamp', p_timestamp,
    'focusTime', p_focus_time,
    'isValid', p_is_valid
  )::jsonb
  WHERE id = p_session_id;
END;
$$;

-- Update duel stats
CREATE OR REPLACE FUNCTION increment_duel_stats(
  p_user_id UUID,
  p_wins INTEGER DEFAULT 0,
  p_losses INTEGER DEFAULT 0,
  p_draws INTEGER DEFAULT 0,
  p_total_duels INTEGER DEFAULT 0,
  p_current_streak INTEGER DEFAULT 0
) RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO duel_stats (user_id, wins, losses, draws, total_duels, current_streak, best_streak)
  VALUES (p_user_id, p_wins, p_losses, p_draws, p_total_duels, p_current_streak, p_current_streak)
  ON CONFLICT (user_id) 
  DO UPDATE SET
    wins = duel_stats.wins + p_wins,
    losses = duel_stats.losses + p_losses,
    draws = duel_stats.draws + p_draws,
    total_duels = duel_stats.total_duels + p_total_duels,
    current_streak = CASE 
      WHEN p_wins > 0 THEN duel_stats.current_streak + 1 
      WHEN p_losses > 0 OR p_draws > 0 THEN 0 
      ELSE duel_stats.current_streak 
    END,
    best_streak = CASE 
      WHEN p_wins > 0 AND duel_stats.current_streak + 1 > duel_stats.best_streak THEN duel_stats.current_streak + 1 
      ELSE duel_stats.best_streak 
    END,
    updated_at = now();
END;
$$;

-- Update leaderboard entry
CREATE OR REPLACE FUNCTION update_leaderboard_entry(
  p_leaderboard_id UUID,
  p_user_id UUID,
  p_value DECIMAL,
  p_display_value TEXT
) RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_previous_rank INTEGER;
BEGIN
  -- Get previous rank if exists
  SELECT rank INTO v_previous_rank
  FROM leaderboard_entries
  WHERE leaderboard_id = p_leaderboard_id AND user_id = p_user_id;

  -- Insert or update entry
  INSERT INTO leaderboard_entries (leaderboard_id, user_id, value, display_value, rank, previous_rank)
  VALUES (p_leaderboard_id, p_user_id, p_value, p_display_value, 0, v_previous_rank)
  ON CONFLICT (leaderboard_id, user_id)
  DO UPDATE SET
    value = p_value,
    display_value = p_display_value,
    previous_rank = leaderboard_entries.rank;

  -- Recalculate all ranks for this leaderboard
  WITH ranked AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY value DESC) as new_rank
    FROM leaderboard_entries
    WHERE leaderboard_id = p_leaderboard_id
  )
  UPDATE leaderboard_entries le
  SET rank = r.new_rank
  FROM ranked r
  WHERE le.id = r.id;

  -- Update rank_change
  UPDATE leaderboard_entries
  SET rank_change = COALESCE(previous_rank, rank) - rank
  WHERE leaderboard_id = p_leaderboard_id;
END;
$$;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE squads ENABLE ROW LEVEL SECURITY;
ALTER TABLE squad_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE squad_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE squad_join_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE squad_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE squad_session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE guilds ENABLE ROW LEVEL SECURITY;
ALTER TABLE guild_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE guild_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE duels ENABLE ROW LEVEL SECURITY;
ALTER TABLE duel_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE duel_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE duel_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;

-- Squads: Public can view public squads
CREATE POLICY squads_select_public ON squads
  FOR SELECT USING (is_public = true);

-- Squads: Members can view their squads
CREATE POLICY squads_select_member ON squads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM squad_members 
      WHERE squad_id = squads.id 
      AND user_id = auth.uid() 
      AND is_active = true
    )
  );

-- Squad members: Members can view active members
CREATE POLICY squad_members_select ON squad_members
  FOR SELECT USING (is_active = true);

-- Feed items: Public visibility
CREATE POLICY feed_items_select_public ON feed_items
  FOR SELECT USING (visibility = 'PUBLIC');

-- Feed items: Users can view their own feed
CREATE POLICY feed_items_select_own ON feed_items
  FOR SELECT USING (user_id = auth.uid());

-- Feed items: Squad visibility
CREATE POLICY feed_items_select_squad ON feed_items
  FOR SELECT USING (
    visibility = 'SQUAD' AND
    EXISTS (
      SELECT 1 FROM squad_members
      WHERE squad_id = feed_items.squad_id
      AND user_id = auth.uid()
      AND is_active = true
    )
  );

-- Feed items: Guild visibility
CREATE POLICY feed_items_select_guild ON feed_items
  FOR SELECT USING (
    visibility = 'GUILD' AND
    EXISTS (
      SELECT 1 FROM guild_members
      WHERE guild_id = feed_items.guild_id
      AND user_id = auth.uid()
      AND is_active = true
    )
  );

-- Duels: Participants can view their duels
CREATE POLICY duels_select_participant ON duels
  FOR SELECT USING (
    challenger_id = auth.uid() OR challenged_id = auth.uid()
  );

-- Duel stats: Users can view their own stats
CREATE POLICY duel_stats_select_own ON duel_stats
  FOR SELECT USING (user_id = auth.uid());

-- Leaderboard entries: Everyone can view
CREATE POLICY leaderboard_entries_select ON leaderboard_entries
  FOR SELECT USING (true);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_squads_is_public ON squads(is_public);
CREATE INDEX idx_squads_member_count ON squads(member_count);
CREATE INDEX idx_squad_members_user_id ON squad_members(user_id);
CREATE INDEX idx_squad_members_squad_id ON squad_members(squad_id);
CREATE INDEX idx_squad_invites_invited_user_id ON squad_invites(invited_user_id);
CREATE INDEX idx_guild_members_user_id ON guild_members(user_id);
CREATE INDEX idx_guilds_is_public ON guilds(is_public);
CREATE INDEX idx_feed_items_user_id ON feed_items(user_id);
CREATE INDEX idx_feed_items_created_at ON feed_items(created_at DESC);
CREATE INDEX idx_feed_items_visibility ON feed_items(visibility);
CREATE INDEX idx_feed_reactions_feed_item_id ON feed_reactions(feed_item_id);
CREATE INDEX idx_feed_comments_feed_item_id ON feed_comments(feed_item_id);
CREATE INDEX idx_duels_challenger_id ON duels(challenger_id);
CREATE INDEX idx_duels_challenged_id ON duels(challenged_id);
CREATE INDEX idx_duels_status ON duels(status);
CREATE INDEX idx_duel_sessions_duel_id ON duel_sessions(duel_id);
CREATE INDEX idx_duel_sessions_user_id ON duel_sessions(user_id);
CREATE INDEX idx_leaderboard_entries_leaderboard_id ON leaderboard_entries(leaderboard_id);
CREATE INDEX idx_leaderboard_entries_rank ON leaderboard_entries(rank);
