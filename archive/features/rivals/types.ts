/**
 * Rivals Feature Types
 * 
 * Types for competitive gameplay, rivalries, and leaderboard features.
 */

export interface Rival {
  id: string;
  userId: string;
  rivalId: string;
  status: RivalStatus;
  initiatedBy: string;
  initiatedAt: Date;
  acceptedAt?: Date;
  endedAt?: Date;
  endReason?: RivalEndReason;
  rivalryType: RivalType;
  stakes: RivalStakes;
  metrics: RivalryMetrics;
  history: RivalryEvent[];
  settings: RivalrySettings;
}

export type RivalStatus = 
  | 'pending'
  | 'active'
  | 'paused'
  | 'completed'
  | 'declined'
  | 'cancelled';

export type RivalEndReason = 
  | 'mutual_agreement'
  | 'timeout'
  | 'user_initiated'
  | 'rule_violation'
  | 'achievement_completed'
  | 'stake_fulfilled';

export type RivalType = 
  | 'friendly'
  | 'competitive'
  | 'tournament'
  | 'seasonal'
  | 'achievement_based'
  | 'skill_based'
  | 'time_based';

export interface RivalStakes {
  type: StakeType;
  amount: number;
  currency?: string;
  duration?: number; // in days
  conditions: StakeCondition[];
  rewards: StakeReward[];
  penalties: StakePenalty[];
}

export type StakeType = 
  | 'points'
  | 'currency'
  | 'badge'
  | 'feature_unlock'
  | 'bragging_rights'
  | 'custom';

export interface StakeCondition {
  metric: string;
  operator: 'greater_than' | 'less_than' | 'equals' | 'reaches';
  value: number;
  timeframe?: number; // in hours
}

export interface StakeReward {
  winner: string;
  reward: RewardDetails;
  condition: string;
}

export interface StakePenalty {
  loser: string;
  penalty: PenaltyDetails;
  condition: string;
}

export interface RewardDetails {
  type: 'points' | 'currency' | 'badge' | 'unlock' | 'title' | ' cosmetic';
  amount: number;
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon?: string;
}

export interface PenaltyDetails {
  type: 'points_loss' | 'currency_loss' | 'badge_loss' | 'restriction' | 'title_loss';
  amount: number;
  description: string;
  duration?: number; // in hours
}

export interface RivalryMetrics {
  duration: number; // in days
  totalEvents: number;
  wins: {
    user: number;
    rival: number;
    draws: number;
  };
  scores: {
    user: number;
    rival: number;
    difference: number;
  };
  achievements: {
    user: AchievementProgress[];
    rival: AchievementProgress[];
  };
  streaks: {
    user: number;
    rival: number;
  };
  momentum: {
    user: number; // -100 to 100
    rival: number; // -100 to 100
  };
}

export interface AchievementProgress {
  achievementId: string;
  name: string;
  progress: number; // 0-100
  completed: boolean;
  completedAt?: Date;
}

export interface RivalryEvent {
  id: string;
  type: RivalryEventType;
  timestamp: Date;
  userId: string;
  data: Record<string, any>;
  impact: EventImpact;
  description: string;
}

export type RivalryEventType = 
  | 'session_completed'
  | 'achievement_unlocked'
  | 'milestone_reached'
  | 'streak_updated'
  | 'challenge_completed'
  | 'leaderboard_position_change'
  | 'skill_improvement'
  | 'social_interaction'
  | 'trash_talk'
  | 'sportsmanship';

export interface EventImpact {
  scoreChange: number;
  momentumShift: number;
  psychologicalImpact: number; // 0-100
  strategicValue: number; // 0-100
}

export interface RivalrySettings {
  notifications: RivalryNotificationSettings;
  privacy: RivalryPrivacySettings;
  rules: RivalryRules;
  preferences: RivalryPreferences;
}

export interface RivalryNotificationSettings {
  enabled: boolean;
  types: RivalryEventType[];
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm
    end: string; // HH:mm
  };
}

export interface RivalryPrivacySettings {
  publicProfile: boolean;
  shareResults: boolean;
  allowSpectators: boolean;
  showRealNames: boolean;
  dataRetention: number; // in days
}

export interface RivalryRules {
  fairPlay: boolean;
  timeLimits: boolean;
  skillMatching: boolean;
  prohibitedActions: string[];
  disputeResolution: DisputeResolutionSettings;
}

export interface DisputeResolutionSettings {
  enabled: boolean;
  mediator: 'system' | 'community' | 'admin';
  evidenceRequired: boolean;
  appealProcess: boolean;
}

export interface RivalryPreferences {
  intensity: 'casual' | 'moderate' | 'intense' | 'extreme';
  communication: 'friendly' | 'competitive' | 'minimal' | 'none';
  celebration: 'subtle' | 'moderate' | 'elaborate' | 'none';
  trashTalk: 'allowed' | 'limited' | 'disabled';
  rematchPreference: 'automatic' | 'manual' | 'never';
}

export interface RivalMatchmaking {
  userId: string;
  preferences: MatchmakingPreferences;
  criteria: MatchmakingCriteria;
  pool: MatchmakingPool;
  suggestions: RivalSuggestion[];
  blacklist: string[]; // user IDs to avoid
}

export interface MatchmakingPreferences {
  skillRange: {
    min: number; // percentage
    max: number; // percentage
  };
  activityLevel: 'low' | 'medium' | 'high';
  rivalryType: RivalType[];
  timezone: 'any' | 'similar' | 'specific';
  language: string[];
  ageRange?: {
    min: number;
    max: number;
  };
}

export interface MatchmakingCriteria {
  skillScore: number;
  activityScore: number;
  sportsmanshipScore: number;
  reliabilityScore: number;
  experienceLevel: number;
  preferredRivalryTypes: RivalType[];
  availability: AvailabilityWindow[];
}

export interface AvailabilityWindow {
  day: number; // 0-6 (Sunday-Saturday)
  start: string; // HH:mm
  end: string; // HH:mm
  timezone: string;
}

export interface MatchmakingPool {
  totalCandidates: number;
  suitableCandidates: number;
  filteredCandidates: number;
  lastUpdated: Date;
  poolQuality: number; // 0-100
}

export interface RivalSuggestion {
  userId: string;
  username: string;
  avatar?: string;
  compatibilityScore: number; // 0-100
  reasons: SuggestionReason[];
  estimatedIntensity: 'casual' | 'moderate' | 'intense' | 'extreme';
  predictedDuration: number; // in days
  riskLevel: 'low' | 'medium' | 'high';
}

export interface SuggestionReason {
  type: 'skill_match' | 'activity_level' | 'similar_goals' | 'complementary_styles' | 'history' | 'mutual_friends';
  description: string;
  weight: number; // 0-1
}

export interface RivalLeaderboard {
  id: string;
  name: string;
  type: LeaderboardType;
  scope: LeaderboardScope;
  timeframe: LeaderboardTimeframe;
  criteria: LeaderboardCriteria;
  entries: LeaderboardEntry[];
  userRank?: UserRankInfo;
  lastUpdated: Date;
  refreshInterval: number; // in minutes
}

export type LeaderboardType = 
  | 'rivalry_wins'
  | 'rivalry_points'
  | 'rivalry_duration'
  | 'sportsmanship'
  | 'most_active'
  | 'most_improved'
  | 'comeback_king';

export type LeaderboardScope = 
  | 'global'
  | 'regional'
  | 'friends'
  | 'skill_level'
  | 'rivalry_type'
  | 'custom';

export type LeaderboardTimeframe = 
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'yearly'
  | 'all_time';

export interface LeaderboardCriteria {
  primary: string;
  secondary?: string;
  tertiary?: string;
  tieBreaker: 'random' | 'recent_activity' | 'historical_performance';
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  avatar?: string;
  rank: number;
  score: number;
  metrics: Record<string, number>;
  change: number; // rank change
  trend: 'up' | 'down' | 'stable';
  activity: {
    lastActive: Date;
    sessionsThisPeriod: number;
    totalRivalries: number;
  };
}

export interface UserRankInfo {
  rank: number;
  score: number;
  change: number;
  percentile: number;
  nextRank?: {
    rank: number;
    score: number;
    difference: number;
  };
  previousRank?: {
    rank: number;
    score: number;
    difference: number;
  };
}

export interface RivalTournament {
  id: string;
  name: string;
  description: string;
  type: TournamentType;
  format: TournamentFormat;
  rules: TournamentRules;
  participants: TournamentParticipant[];
  brackets: TournamentBracket[];
  schedule: TournamentSchedule;
  prizes: TournamentPrize[];
  status: TournamentStatus;
  createdAt: Date;
  startsAt: Date;
  endsAt: Date;
}

export type TournamentType = 
  | 'elimination'
  | 'round_robin'
  | 'swiss'
  | 'double_elimination'
  | 'league'
  | 'custom';

export type TournamentFormat = 
  | '1v1'
  | '2v2'
  | 'team'
  | 'free_for_all'
  | 'custom';

export interface TournamentRules {
  scoring: ScoringRules;
  timing: TimingRules;
  conduct: ConductRules;
  disputes: DisputeRules;
}

export interface ScoringRules {
  win: number;
  loss: number;
  draw: number;
  bonus: Record<string, number>;
  penalties: Record<string, number>;
}

export interface TimingRules {
  matchDuration: number; // in minutes
  breakDuration: number; // in minutes
  maxDelay: number; // in minutes
  forfeitTime: number; // in minutes
}

export interface ConductRules {
  sportsmanship: boolean;
  communication: CommunicationRules;
  fairPlay: boolean;
  antiCheat: boolean;
}

export interface CommunicationRules {
  allowed: boolean;
  moderated: boolean;
  preMatch: boolean;
  duringMatch: boolean;
  postMatch: boolean;
}

export interface DisputeRules {
  evidenceRequired: boolean;
  reviewProcess: 'automatic' | 'manual' | 'community';
  appealAllowed: boolean;
  timeLimit: number; // in hours
}

export interface TournamentParticipant {
  userId: string;
  username: string;
  avatar?: string;
  seed: number;
  status: ParticipantStatus;
  stats: ParticipantStats;
  history: MatchHistory[];
}

export type ParticipantStatus = 
  | 'registered'
  | 'confirmed'
  | 'active'
  | 'eliminated'
  | 'disqualified'
  | 'withdrawn';

export interface ParticipantStats {
  wins: number;
  losses: number;
  draws: number;
  points: number;
  differential: number;
  averageScore: number;
  bestScore: number;
  currentStreak: number;
  bestStreak: number;
}

export interface MatchHistory {
  opponentId: string;
  opponentName: string;
  result: 'win' | 'loss' | 'draw';
  score: {
    user: number;
    opponent: number;
  };
  duration: number; // in minutes
  timestamp: Date;
  round: number;
}

export interface TournamentBracket {
  id: string;
  name: string;
  round: number;
  matches: TournamentMatch[];
  status: BracketStatus;
}

export type BracketStatus = 
  | 'pending'
  | 'active'
  | 'completed';

export interface TournamentMatch {
  id: string;
  round: number;
  matchNumber: number;
  participants: [string, string]; // user IDs
  status: MatchStatus;
  result?: MatchResult;
  scheduledAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  duration?: number; // in minutes
}

export type MatchStatus = 
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'postponed';

export interface MatchResult {
  winner: string;
  loser?: string;
  score: {
    winner: number;
    loser: number;
  };
  method: 'score' | 'forfeit' | 'disqualification' | 'draw';
  notes?: string;
}

export interface TournamentSchedule {
  registrationStart: Date;
  registrationEnd: Date;
  checkInStart: Date;
  checkInEnd: Date;
  start: Date;
  end: Date;
  rounds: RoundSchedule[];
}

export interface RoundSchedule {
  round: number;
  start: Date;
  end: Date;
  matches: number;
}

export interface TournamentPrize {
  position: number;
  prize: PrizeDetails;
  description: string;
  claimed: boolean;
  claimedBy?: string;
  claimedAt?: Date;
}

export interface PrizeDetails {
  type: 'currency' | 'points' | 'badge' | 'title' | 'unlock' | 'physical';
  value: number;
  name: string;
  description: string;
  icon?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export type TournamentStatus = 
  | 'announced'
  | 'registration'
  | 'check_in'
  | 'active'
  | 'paused'
  | 'completed'
  | 'cancelled';

export interface RivalAnalytics {
  userId: string;
  timeframe: 'daily' | 'weekly' | 'monthly' | 'yearly';
  overview: RivalryOverview;
  performance: RivalryPerformance;
  trends: RivalryTrends;
  insights: RivalryInsight[];
  recommendations: RivalryRecommendation[];
}

export interface RivalryOverview {
  totalRivalries: number;
  activeRivalries: number;
  completedRivalries: number;
  winRate: number;
  averageRivalryDuration: number;
  totalScore: number;
  averageScore: number;
  bestStreak: number;
  currentStreak: number;
  sportsmanshipScore: number;
}

export interface RivalryPerformance {
  byType: Record<RivalType, PerformanceMetrics>;
  byStakeType: Record<StakeType, PerformanceMetrics>;
  byTimeframe: Record<string, PerformanceMetrics>;
  againstSkillLevel: Record<string, PerformanceMetrics>;
}

export interface PerformanceMetrics {
  winRate: number;
  averageScore: number;
  averageDuration: number;
  satisfaction: number;
  intensity: number;
  fairness: number;
}

export interface RivalryTrends {
  winRate: TrendData[];
  score: TrendData[];
  activity: TrendData[];
  satisfaction: TrendData[];
  intensity: TrendData[];
}

export interface RivalryInsight {
  type: 'strength' | 'weakness' | 'opportunity' | 'threat' | 'pattern';
  description: string;
  significance: 'low' | 'medium' | 'high';
  confidence: number;
  data: Record<string, any>;
  actionable: boolean;
}

export interface RivalryRecommendation {
  type: RecommendationType;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  action: string;
  expectedOutcome: string;
  effort: 'low' | 'medium' | 'high';
  timeline: string;
  evidence: string[];
}

export type RecommendationType = 
  | 'rival_suggestion'
  | 'skill_improvement'
  | 'strategy_adjustment'
  | 'communication_style'
  | 'stake_adjustment'
  | 'break_suggestion'
  | 'tournament_participation'
  | 'sportsmanship_improvement';

// Event Types
export interface RivalEvent {
  type: 'rivalry_started' | 'rivalry_ended' | 'match_completed' | 'tournament_joined' | 'leaderboard_updated' | 'achievement_unlocked';
  userId: string;
  rivalId?: string;
  data: Record<string, any>;
  timestamp: Date;
}
