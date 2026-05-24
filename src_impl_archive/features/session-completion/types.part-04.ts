import type { LearningResource } from './types';

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
