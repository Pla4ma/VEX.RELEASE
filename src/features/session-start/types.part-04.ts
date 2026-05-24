export interface ErgonomicImprovement {
  area: string;
  improvement: string;
  impact: number; // 0-100
  effort: 'low' | 'medium' | 'high';
}

export interface DistractionManagement {
  currentLevel: number; // 0-100
  sources: DistractionSource[];
  strategies: DistractionStrategy[];
  effectiveness: number; // 0-100
}

export interface DistractionSource {
  type: 'digital' | 'physical' | 'social' | 'environmental';
  source: string;
  frequency: 'rare' | 'occasional' | 'frequent' | 'constant';
  impact: number; // 0-100
}

export interface DistractionStrategy {
  strategy: string;
  effectiveness: number; // 0-100
  ease: number; // 0-100
  recommended: boolean;
}

export interface SessionConfiguration {
  mode: SessionMode;
  difficulty: DifficultyLevel;
  duration: DurationConfig;
  objectives: ObjectiveConfig;
  accessibility: AccessibilityConfig;
  privacy: PrivacyConfig;
  social: SocialConfig;
}

export type SessionMode = 'focus' | 'learning' | 'practice' | 'challenge' | 'creative' | 'social' | 'relaxation' | 'custom';

export type DifficultyLevel = 'beginner' | 'easy' | 'medium' | 'hard' | 'expert' | 'adaptive';

export interface DurationConfig {
  target: number; // in minutes
  minimum: number; // in minutes
  maximum: number; // in minutes
  flexible: boolean;
  autoExtend: boolean;
}

export interface ObjectiveConfig {
  primary: string;
  secondary: string[];
  measurable: boolean;
  timeBound: boolean;
  realistic: boolean;
  specific: boolean;
}

export interface AccessibilityConfig {
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  highContrast: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  subtitles: boolean;
  keyboardNavigation: boolean;
  voiceControl: boolean;
}

export interface PrivacyConfig {
  dataCollection: boolean;
  analytics: boolean;
  socialSharing: boolean;
  leaderboards: boolean;
  publicProfile: boolean;
  recording: boolean;
}

export interface SocialConfig {
  multiplayer: boolean;
  voiceChat: boolean;
  textChat: boolean;
  screenSharing: boolean;
  spectating: boolean;
  invitations: boolean;
}

export interface SessionGoal {
  id: string;
  title: string;
  description: string;
  type: GoalType;
  priority: GoalPriority;
  measurable: boolean;
  target?: number;
  unit?: string;
  timeframe?: number; // in seconds
  progress: GoalProgress;
  milestones: GoalMilestone[];
}

export type GoalType = 'performance' | 'learning' | 'completion' | 'time' | 'accuracy' | 'speed' | 'engagement' | 'social' | 'custom';

export type GoalPriority = 'low' | 'medium' | 'high' | 'critical';

export interface GoalProgress {
  current: number;
  target: number;
  percentage: number;
  rate: number; // per minute
  estimatedCompletion?: Date;
}

export interface GoalMilestone {
  id: string;
  title: string;
  value: number;
  achieved: boolean;
  achievedAt?: Date;
  reward?: string;
}

export interface SessionMood {
  current: MoodState;
  target: MoodState;
  assessment: MoodAssessment;
  strategies: MoodStrategy[];
  tracking: Record<string, unknown>;
}

export interface MoodState {
  energy: number; // 0-100
  focus: number; // 0-100
  motivation: number; // 0-100
  confidence: number; // 0-100
  stress: number; // 0-100
  excitement: number; // 0-100
}

export interface MoodAssessment {
  method: AssessmentMethod;
  accuracy: number; // 0-100
  confidence: number; // 0-100
  factors: Record<string, unknown>[];
  recommendations: string[];
}

export type AssessmentMethod = 'self_report' | 'behavioral' | 'physiological' | 'performance' | 'hybrid';

export interface MoodStrategy {
  strategy: string;
  type: StrategyType;
  effectiveness: number; // 0-100
  duration: number; // in minutes
  instructions: string[];
}

export type StrategyType = 'breathing' | 'visualization' | 'music' | 'exercise' | 'meditation' | 'social' | 'environment' | 'cognitive';

