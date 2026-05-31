import type { VexExperience } from './schemas';
import type { FirstWeekExperience } from './first-week-schemas';
import type { HomeSurfaceMap } from '../home-experience/surface-decision-schemas';

export interface VexRuntimeInput {
  completedSessions: number;
  daysSinceOnboarding: number;
  daysSinceLastSession: number | null;
  motivationStyle?: string;
  primaryGoal?: string;
  bossEngagement: 'none' | 'low' | 'medium' | 'high';
  studyUsageRatio: number;
  coachInteractions: number;
  completionStreak: number;
  isPremium: boolean;
  featureAvailable: {
    boss: boolean;
    premium: boolean;
    social: boolean;
    study: boolean;
  };
}

export interface NotificationPolicyDetails {
  maxPerDay: number;
  allowedTypes: string[];
  isQuietHours: boolean;
  quietStartHour: number;
  quietEndHour: number;
}

export interface CompletionSequenceDetails {
  emphasis: string;
  steps: string[];
  showProgressProof: boolean;
  showCoachReflection: boolean;
  showNextAction: boolean;
  showWeeklyInsight: boolean;
}

export interface PremiumMomentDetails {
  canShow: boolean;
  triggerMoment: 'none' | 'soft_tease' | 'weekly_value' | 'session_value';
  delayDays: number;
  requiresBillingReady: boolean;
}

export interface CoachPresenceDetails {
  tone: string;
  primaryMessage: string;
  isComeback: boolean;
  isDayZero: boolean;
  studyLayerLabel: string;
  bossIntensity: string;
}

export interface VexRuntimeExperience {
  resolvedExperience: VexExperience;
  firstWeekExperience: FirstWeekExperience;
  surfaceMap: HomeSurfaceMap | null;
  premiumMoment: PremiumMomentDetails;
  notificationPolicy: NotificationPolicyDetails;
  completionSequence: CompletionSequenceDetails;
  coachPresenceTone: CoachPresenceDetails;
  studyLayerLabel: string;
  bossIntensity: string;
}
