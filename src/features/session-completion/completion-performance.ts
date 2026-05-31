/**
 * Session Completion — Performance Types
 *
 * Types for session performance scoring, comparisons, and highlights.
 */

import type {
  AchievementUnlock,
  CompletionAnalytics,
  CompletionExperience,
  ProgressUpdate,
  ShareableContent,
} from './types';
import type { CompletionReward } from './completion-rewards';

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

export type CompletionType =
  | 'success'
  | 'failure'
  | 'timeout'
  | 'manual'
  | 'emergency'
  | 'interruption';

export type CompletionStatus =
  | 'processing'
  | 'completed'
  | 'failed'
  | 'pending_review'
  | 'appealed';

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

export type PerformanceCategory =
  | 'accuracy'
  | 'speed'
  | 'efficiency'
  | 'strategy'
  | 'consistency'
  | 'adaptability'
  | 'creativity'
  | 'teamwork'
  | 'leadership'
  | 'communication';

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

export type ComparisonType =
  | 'personal_best'
  | 'personal_average'
  | 'peer_average'
  | 'global_average'
  | 'goal_target'
  | 'milestone';

export type ComparisonTarget =
  | 'self'
  | 'peers'
  | 'global'
  | 'goals'
  | 'milestones';

export interface PerformanceHighlight {
  type: HighlightType;
  title: string;
  description: string;
  value: number;
  significance: 'low' | 'medium' | 'high' | 'legendary';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  shareable: boolean;
}

export type HighlightType =
  | 'personal_best'
  | 'milestone_achieved'
  | 'streak_extended'
  | 'skill_improved'
  | 'perfect_performance'
  | 'comeback_victory'
  | 'speed_record'
  | 'accuracy_record'
  | 'strategy_mastery'
  | 'team_excellence';

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
