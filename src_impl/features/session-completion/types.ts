/**
 * Session Completion Feature Types
 *
 * Types for session completion tracking, rewards, and post-session experiences.
 */

export interface SessionCompletion {
  id: string;
  sessionId: string;
  userId: string;
  completionType: CompletionType;
  status: CompletionStatus;
  startedAt: Date;
  completedAt: Date;
  duration: number; // in seconds
  performance: SessionPerformance;
  rewards: CompletionReward[];
  achievements: AchievementUnlock[];
  progress: ProgressUpdate[];
  experience: CompletionExperience;
  shareable: ShareableContent;
  analytics: CompletionAnalytics;
}

export type CompletionType = 'success' | 'failure' | 'timeout' | 'manual' | 'emergency' | 'interruption';

export type CompletionStatus = 'processing' | 'completed' | 'failed' | 'pending_review' | 'appealed';

export interface SessionPerformance {
  overall: PerformanceScore;
  categories: CategoryPerformance[];
  metrics: PerformanceMetric[];
  comparisons: PerformanceComparison[];
  highlights: PerformanceHighlight[];
  improvements: ImprovementArea[];
}

export interface PerformanceScore {
  value: number; // 0-100
  grade: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
  rank: number;
  percentile: number;
  change: number; // from previous session
  significance: 'low' | 'medium' | 'high';
}

export interface CategoryPerformance {
  category: PerformanceCategory;
  score: number; // 0-100
  grade: string;
  weight: number; // importance weight
  trend: 'improving' | 'stable' | 'declining';
  details: CategoryDetails;
}

export type PerformanceCategory = 'accuracy' | 'speed' | 'efficiency' | 'strategy' | 'consistency' | 'adaptability' | 'creativity' | 'teamwork' | 'leadership' | 'communication';

export interface CategoryDetails {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  recommendations: string[];
  nextSteps: string[];
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  target: number;
  achieved: boolean;
  change: number;
  significance: 'low' | 'medium' | 'high';
  context: string;
}

export interface PerformanceComparison {
  type: ComparisonType;
  target: ComparisonTarget;
  score: number;
  targetScore: number;
  difference: number;
  percentile: number;
  interpretation: string;
}

export type ComparisonType = 'personal_best' | 'personal_average' | 'peer_average' | 'global_average' | 'goal_target' | 'milestone';

export type ComparisonTarget = 'self' | 'peers' | 'global' | 'goals' | 'milestones';

export interface PerformanceHighlight {
  type: HighlightType;
  title: string;
  description: string;
  value: number;
  significance: 'low' | 'medium' | 'high' | 'legendary';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  shareable: boolean;
}

export type HighlightType = 'personal_best' | 'milestone_achieved' | 'streak_extended' | 'skill_improved' | 'perfect_performance' | 'comeback_victory' | 'speed_record' | 'accuracy_record' | 'strategy_mastery' | 'team_excellence';

export interface ImprovementArea {
  area: string;
  currentLevel: number; // 0-100
  targetLevel: number; // 0-100
  gap: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  resources: LearningResource[];
  estimatedTime: number; // in hours
}

export interface LearningResource {
  type: 'tutorial' | 'video' | 'article' | 'exercise' | 'course' | 'book';
  title: string;
  description: string;
  url?: string;
  duration?: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  rating: number; // 0-5
  relevance: number; // 0-100
}

export interface CompletionReward {
  id: string;
  type: RewardType;
  amount: number;
  source: RewardSource;
  condition: RewardCondition;
  claimed: boolean;
  claimedAt?: Date;
  expiresAt?: Date;
  metadata: RewardMetadata;
}

export type RewardType = 'experience_points' | 'currency' | 'skill_points' | 'streak_extension' | 'unlock' | 'badge' | 'title' | 'cosmetic' | 'boost' | 'consumable';

export type RewardSource = 'completion' | 'performance' | 'milestone' | 'streak' | 'achievement' | 'bonus' | 'event' | 'challenge';

export interface RewardCondition {
  type: 'score' | 'time' | 'accuracy' | 'streak' | 'achievement' | 'custom';
  operator: 'greater_than' | 'less_than' | 'equals' | 'reaches';
  value: number;
  description: string;
}

export interface RewardMetadata {
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: string;
  icon?: string;
  color?: string;
  animation?: string;
  sound?: string;
  description: string;
  lore?: string;
}

export interface AchievementUnlock {
  id: string;
  achievementId: string;
  name: string;
  description: string;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  progress: AchievementProgress;
  unlockedAt: Date;
  firstTime: boolean;
  shareable: boolean;
}

export interface AchievementProgress {
  current: number;
  total: number;
  percentage: number;
  completed: boolean;
  nextMilestone?: MilestoneProgress;
}

export interface MilestoneProgress {
  milestone: number;
  required: number;
  current: number;
  percentage: number;
  reward?: string;
}

export interface ProgressUpdate {
  type: ProgressType;
  area: string;
  previous: number;
  current: number;
  change: number;
  percentage: number;
  significance: 'low' | 'medium' | 'high';
  context: string;
}

export type ProgressType = 'skill_level' | 'experience' | 'streak' | 'rank' | 'title' | 'unlock' | 'reputation' | 'currency' | 'achievement' | 'milestone';

export interface CompletionExperience {
  flow: FlowExperience;
  satisfaction: SatisfactionScore;
  engagement: EngagementMetrics;
  motivation: MotivationState;
  emotions: EmotionalState;
  feedback: UserFeedback;
}

export interface FlowExperience {
  achieved: boolean;
  duration: number; // in seconds
  intensity: number; // 0-100
  quality: number; // 0-100
  triggers: string[];
  barriers: string[];
  factors: FlowFactor[];
}

export interface FlowFactor {
  factor: string;
  impact: number; // -100 to 100
  description: string;
  category: 'positive' | 'negative' | 'neutral';
}

export interface SatisfactionScore {
  overall: number; // 0-100
  components: SatisfactionComponent[];
  trend: 'improving' | 'stable' | 'declining';
  drivers: SatisfactionDriver[];
}

export interface SatisfactionComponent {
  aspect: 'challenge' | 'skill' | 'control' | 'goals' | 'feedback' | 'immersion';
  score: number; // 0-100
  weight: number;
  importance: number;
}

export interface SatisfactionDriver {
  driver: string;
  impact: number; // -100 to 100
  description: string;
  actionable: boolean;
}

export interface EngagementMetrics {
  attention: number; // 0-100
  interest: number; // 0-100
  involvement: number; // 0-100
  enthusiasm: number; // 0-100
  focus: number; // 0-100
  persistence: number; // 0-100
  quality: number; // 0-100
}

export interface MotivationState {
  intrinsic: number; // 0-100
  extrinsic: number; // 0-100
  competence: number; // 0-100
  autonomy: number; // 0-100
  relatedness: number; // 0-100
  mastery: number; // 0-100
  purpose: number; // 0-100
}

export interface EmotionalState {
  primary: Emotion;
  secondary?: Emotion;
  intensity: number; // 0-100
  valence: number; // -100 to 100 (negative to positive)
  arousal: number; // 0-100 (calm to excited)
  stability: number; // 0-100
}

export interface Emotion {
  type: EmotionType;
  confidence: number; // 0-100
  triggers: string[];
  duration: number; // in seconds
}

export type EmotionType = 'joy' | 'excitement' | 'pride' | 'satisfaction' | 'relief' | 'frustration' | 'anger' | 'disappointment' | 'anxiety' | 'boredom' | 'confusion' | 'surprise';

export interface UserFeedback {
  rating: number; // 1-5
  difficulty: number; // 1-5
  enjoyment: number; // 1-5
  comments?: string;
  suggestions?: string[];
  bugs?: string[];
  wouldRecommend: boolean;
  wouldPlayAgain: boolean;
}

export interface ShareableContent {
  type: ShareableType;
  title: string;
  description: string;
  image?: string;
  data: ShareableData;
  platforms: SocialPlatform[];
  template: ShareableTemplate;
  customizations: ShareableCustomization[];
}

export type ShareableType = 'achievement' | 'performance' | 'milestone' | 'streak' | 'rank_up' | 'unlock' | 'completion' | 'story';

export interface ShareableData {
  score: number;
  rank: number;
  achievement?: string;
  milestone?: string;
  streak?: number;
  time?: string;
  difficulty?: string;
  highlights: string[];
}

export type SocialPlatform = 'twitter' | 'facebook' | 'instagram' | 'linkedin' | 'reddit' | 'discord' | 'slack' | 'whatsapp' | 'telegram';

export interface ShareableTemplate {
  id: string;
  name: string;
  layout: TemplateLayout;
  style: TemplateStyle;
  text: TemplateText;
  branding: TemplateBranding;
}

export type TemplateLayout = 'centered' | 'left_aligned' | 'right_aligned' | 'split' | 'card' | 'banner' | 'story';

export interface TemplateStyle {
  theme: 'light' | 'dark' | 'colorful' | 'minimal' | 'bold';
  colors: ColorScheme;
  fonts: FontScheme;
  animations: AnimationScheme;
}

export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface FontScheme {
  heading: string;
  body: string;
  accent: string;
}

export interface AnimationScheme {
  enabled: boolean;
  type: 'fade' | 'slide' | 'bounce' | 'zoom' | 'none';
  duration: number; // in seconds
}

export interface TemplateText {
  title: string;
  subtitle?: string;
  body?: string;
  callToAction?: string;
  hashtags?: string[];
}

export interface TemplateBranding {
  logo?: string;
  watermark?: boolean;
  attribution?: boolean;
  customMessage?: string;
}

export interface ShareableCustomization {
  field: string;
  type: 'text' | 'color' | 'image' | 'layout';
  options: CustomizationOption[];
  selected?: unknown;
}

export interface CustomizationOption {
  value: unknown;
  label: string;
  preview?: string;
}

export interface CompletionAnalytics {
  userId: string;
  sessionId: string;
  completionId: string;
  metrics: CompletionMetrics;
  trends: CompletionTrends;
  insights: CompletionInsight[];
  predictions: CompletionPrediction[];
  benchmarks: CompletionBenchmark[];
}

export interface CompletionMetrics {
  completionRate: number; // 0-100
  averageScore: number;
  averageTime: number;
  satisfactionScore: number;
  engagementScore: number;
  retentionRate: number;
  churnRisk: number;
  lifetimeValue: number;
  sessionCount: number;
  totalPlaytime: number;
}

export interface CompletionTrends {
  performance: TrendData[];
  satisfaction: TrendData[];
  engagement: TrendData[];
  retention: TrendData[];
  improvement: TrendData[];
}

export interface TrendData {
  date: Date;
  value: number;
  change: number;
  significance: 'low' | 'medium' | 'high';
  prediction?: number;
}

export interface CompletionInsight {
  type: InsightType;
  title: string;
  description: string;
  significance: 'low' | 'medium' | 'high';
  confidence: number;
  actionable: boolean;
  priority: 'low' | 'medium' | 'high';
  recommendations: string[];
  evidence: EvidenceData[];
}

export type InsightType = 'strength' | 'weakness' | 'opportunity' | 'threat' | 'pattern' | 'anomaly' | 'correlation' | 'prediction';

export interface EvidenceData {
  type: 'metric' | 'event' | 'behavior' | 'feedback';
  value: unknown;
  timestamp: Date;
  context: string;
}

export interface CompletionPrediction {
  type: PredictionType;
  prediction: unknown;
  confidence: number;
  timeframe: string;
  factors: PredictionFactor[];
  actions: PredictionAction[];
}

export type PredictionType = 'next_session_score' | 'churn_probability' | 'achievement_timeline' | 'skill_progression' | 'engagement_level' | 'retention_probability';

export interface PredictionFactor {
  factor: string;
  impact: number; // -100 to 100
  weight: number; // 0-1
  description: string;
}

export interface PredictionAction {
  action: string;
  expectedImpact: number;
  effort: 'low' | 'medium' | 'high';
  timeline: string;
  resources: string[];
}

export interface CompletionBenchmark {
  type: BenchmarkType;
  category: string;
  userScore: number;
  benchmarkScore: number;
  percentile: number;
  rank: number;
  totalParticipants: number;
  comparison: BenchmarkComparison;
}

export type BenchmarkType = 'personal_best' | 'peer_average' | 'global_average' | 'expert_level' | 'goal_target' | 'industry_standard';

export interface BenchmarkComparison {
  difference: number;
  significance: 'low' | 'medium' | 'high';
  interpretation: string;
  improvement: ImprovementPotential;
}

export interface ImprovementPotential {
  potential: number; // 0-100
  timeframe: string;
  effort: 'low' | 'medium' | 'high';
  strategies: string[];
  resources: LearningResource[];
}

export interface CompletionSettings {
  userId: string;
  preferences: CompletionPreferences;
  notifications: CompletionNotifications;
  privacy: CompletionPrivacy;
  accessibility: CompletionAccessibility;
  automation: CompletionAutomation;
}

export interface CompletionPreferences {
  showDetailedResults: boolean;
  autoShareAchievements: boolean;
  celebrationEffects: boolean;
  soundEffects: boolean;
  vibration: boolean;
  screenEffects: boolean;
  resultDuration: number; // in seconds
  skipDelay: boolean;
}

export interface CompletionNotifications {
  achievements: boolean;
  milestones: boolean;
  rankUps: boolean;
  unlocks: boolean;
  streaks: boolean;
  summaries: boolean;
  reminders: boolean;
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
}

export interface CompletionPrivacy {
  shareResults: boolean;
  shareAchievements: boolean;
  shareProgress: boolean;
  shareAnalytics: boolean;
  publicProfile: boolean;
  leaderboards: boolean;
  socialFeatures: boolean;
  dataRetention: number; // in days
}

export interface CompletionAccessibility {
  highContrast: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  subtitles: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  simplifiedUI: boolean;
}

export interface CompletionAutomation {
  autoClaimRewards: boolean;
  autoShareMilestones: boolean;
  autoScheduleNextSession: boolean;
  autoAdjustDifficulty: boolean;
  autoGenerateInsights: boolean;
  autoSendReminders: boolean;
  smartRecommendations: boolean;
}

// Event Types
export interface CompletionEvent {
  type: 'session_completed' | 'achievement_unlocked' | 'reward_claimed' | 'progress_updated' | 'milestone_reached' | 'rank_up' | 'streak_extended';
  userId: string;
  sessionId: string;
  completionId: string;
  data: Record<string, unknown>;
  timestamp: Date;
}
