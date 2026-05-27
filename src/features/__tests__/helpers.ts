import { decideHomeSurfaces } from '../home-experience/home-surface-decision';
import { resolveLaneCopy, resolveFirstWeekExperiment } from '../personalization/first-week-lane-copy';
import { buildLaneSessionBrief } from '../session-start/service';
import { decideNudge } from '../notification-policy/service';
import { getCoachPresenceMessage } from '../coach-presence/copy-service';
import { getLaneMechanicPolicy } from '../lane-engine/service';
import type { LaneProfile } from '../lane-engine/types';

export const baseLaneProfile = (overrides: Partial<LaneProfile>): LaneProfile => ({
  primaryLane: 'minimal_normal',
  secondaryLane: null,
  confidence: 0.8,
  confidenceBand: 'high',
  source: 'onboarding',
  evidence: [],
  traits: { needsStructure: 0.5, wantsPlay: 0.1, needsContinuity: 0.4, wantsQuiet: 0.9 },
  resolvedAt: Date.now(),
  ...overrides,
});

export const featureAvailability = { boss: true, challenges: true, premium: true, study: true };

export const baseStats = {
  bossChallengeEngagement: 'none' as const,
  coachInteractions: 0,
  comebackSessions: 0,
  completionStreak: 0,
  ignoredFeatures: [],
  premiumFeatureAttempts: [],
  studyUsageRatio: 0,
  totalCompletedSessions: 3,
};

export const baseProfile = {
  gamificationIntensity: 'medium' as const,
  motivationStyle: 'coach_led' as const,
  primaryGoal: 'work' as const,
  studyLayerName: 'Deep Work Plan',
  userStage: 'engaged' as const,
};

export {
  decideHomeSurfaces,
  resolveLaneCopy,
  resolveFirstWeekExperiment,
  buildLaneSessionBrief,
  decideNudge,
  getCoachPresenceMessage,
  getLaneMechanicPolicy,
};
