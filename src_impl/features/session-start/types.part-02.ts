import type { BriefingStrategy, BriefingTip, ChallengeInfo } from './types';

export interface OrientationContent {
  sections: OrientationSection[];
  interactive: boolean;
  skippable: boolean;
  estimatedDuration: number; // in seconds
}

export interface OrientationSection {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'video' | 'interactive' | 'demonstration';
  duration: number; // in seconds
  required: boolean;
  completed: boolean;
}

export interface OrientationProgress {
  currentSection: number;
  totalSections: number;
  completedSections: string[];
  timeSpent: number; // in seconds
  engagement: number; // 0-100
}

export interface BriefingSession {
  enabled: boolean;
  type: BriefingType;
  objectives: BriefingObjective[];
  context: BriefingContext;
  strategy: BriefingStrategy;
  tips: BriefingTip[];
  completed: boolean;
}

export type BriefingType = 'mission' | 'goals' | 'strategy' | 'tips' | 'motivation' | 'comprehensive';

export interface BriefingObjective {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  measurable: boolean;
  target?: number;
  unit?: string;
  timeframe?: number; // in seconds
}

export interface BriefingContext {
  previousSession: SessionContext;
  currentStreak: number;
  recentPerformance: PerformanceSummary;
  upcomingChallenges: ChallengeInfo[];
  socialContext: SocialContext;
}

export interface SessionContext {
  environment: EnvironmentContext;
  time: TimeContext;
  social: SocialContext;
  performance: PerformanceContext;
  goals: GoalContext;
  mood: MoodContext;
}

export interface EnvironmentContext {
  location: string;
  noiseLevel: number; // 0-100
  lighting: number; // 0-100
  temperature: number; // 0-100
  comfort: number; // 0-100
  distractions: number; // 0-100
}

export interface TimeContext {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek: number; // 0-6
  season: 'spring' | 'summer' | 'fall' | 'winter';
  timezone: string;
  availableTime: number; // in minutes
  preferredDuration: number; // in minutes
}

export interface SocialContext {
  alone: boolean;
  friendsOnline: number;
  activeRivalries: number;
  teamMembers: number;
  socialMood: 'energetic' | 'calm' | 'competitive' | 'collaborative';
}

export interface PerformanceContext {
  recentTrend: 'improving' | 'stable' | 'declining';
  averageScore: number;
  bestScore: number;
  consistency: number; // 0-100
  fatigue: number; // 0-100
  motivation: number; // 0-100
}

export interface GoalContext {
  activeGoals: GoalInfo[];
  completedGoals: number;
  progressTowardsGoals: number; // 0-100
  upcomingDeadlines: DeadlineInfo[];
}

export interface GoalInfo {
  id: string;
  title: string;
  progress: number; // 0-100
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface DeadlineInfo {
  goalId: string;
  title: string;
  deadline: Date;
  daysRemaining: number;
  progress: number; // 0-100
}

export interface MoodContext {
  current: EmotionState;
  expected: EmotionState;
  factors: MoodFactor[];
  stability: number; // 0-100
}

export interface EmotionState {
  primary: EmotionType;
  intensity: number; // 0-100
  valence: number; // -100 to 100
  arousal: number; // 0-100
}

export type EmotionType = 'excited' | 'calm' | 'focused' | 'creative' | 'energetic' | 'relaxed' | 'competitive' | 'collaborative' | 'curious' | 'confident';

export interface MoodFactor {
  factor: string;
  impact: number; // -100 to 100
  description: string;
  category: 'positive' | 'negative' | 'neutral';
}

export interface PerformanceSummary {
  lastSession: SessionSummary;
  recentAverage: number;
  improvementRate: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export interface SessionSummary {
  score: number;
  duration: number;
  completion: boolean;
  satisfaction: number;
  achievements: string[];
}

