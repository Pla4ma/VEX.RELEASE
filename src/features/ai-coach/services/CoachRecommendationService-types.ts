import type { BehaviorProfile } from '../types';

type ActiveStudyPlan = {
  id?: string;
  title: string;
  progress?: number;
  nextSession?: string | null;
  totalTasks?: number;
  completedTasks?: number;
  contentId?: string;
  generationId?: string;
};

export type CoachRecommendationType =
  | 'focus_session'
  | 'study_plan'
  | 'comeback'
  | 'protect_streak'
  | 'boss_battle'
  | 'study_behind'
  | 'boss_opportunity'
  | 'momentum_building'
  | 'study_plan_complete';

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

export interface CoachRecommendation {
  id: string;
  type: CoachRecommendationType;
  priority: number;
  urgency: UrgencyLevel;
  headline: string;
  subtext: string;
  ctaText: string;
  ctaAction:
    | 'start_focus'
    | 'start_study'
    | 'view_boss'
    | 'view_streak'
    | 'view_progress';
  ctaParams?: Record<string, unknown>;
  coachMessage: string;
  reasoning: string;
  visualCue: 'none' | 'pulse' | 'glow' | 'urgent';
  expiresAt?: number;
  evidence?: {
    memoryIds?: string[];
    fallbackReason?: string;
    confidence?: number;
  };
}

export interface RecommendationContext {
  userId: string;
  currentTime: Date;
  streakDays: number;
  hasCompletedSessionToday: boolean;
  hoursUntilStreakBreak: number | null;
  activeStudyPlan: ActiveStudyPlan | null;
  studyPlanProgress: number;
  studyPlanDaysBehind: number;
  activeBoss: {
    id: string;
    name: string;
    healthRemaining: number;
    maxHealth: number;
    timeRemaining: number;
  } | null;
  totalSessions: number;
  currentLevel: number;
  lastSessionTimestamp?: number;
  daysSinceLastSession: number;
  behaviorProfile: BehaviorProfile | null;
  coachPersonaId: string;
}

export type CoachPersonaId = 'mentor' | 'trainer' | 'peer' | 'professor';

export interface CoachPersona {
  id: CoachPersonaId;
  name: string;
  voiceTone:
    | 'ENCOURAGING'
    | 'STERN'
    | 'PLAYFUL'
    | 'WISE'
    | 'COMPETITIVE'
    | 'GENTLE';
  vocabularyTraits: string[];
  sentenceStructure: 'SHORT_DIRECT' | 'CONVERSATIONAL' | 'MEASURED';
  guidelines: {
    maxSentences: number;
    alwaysActionable: boolean;
    emotionalIntelligence: boolean;
    contextAware: boolean;
  };
}
