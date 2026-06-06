import { resolveFirstWeekExperience } from '../../personalization/first-week-service';
import type { FirstWeekResolverInput } from '../../personalization/first-week-schemas';
import { resolveCompletionExperiencePolicy } from '../../session-completion/completion-experience-policy';
import type { CompletionExperiencePolicyInput } from '../../session-completion/completion-experience-policy-schemas';
import { resolveLaneCopy } from '../../personalization/first-week-lane-copy';
import { getLaneMechanicPolicy } from '../../lane-engine/service';
import { decideNudge } from '../../notification-policy/service';
import { decideHomeSurfaces } from '../../home-experience/home-surface-decision';
import { buildLaneSessionBrief } from '../../session-start/service';
import { SessionMode } from '../../../session/modes';
import type { Lane, LaneProfile } from '../../lane-engine/types';

export const TEST_UUID = '550e8400-e29b-41d4-a716-446655440000';

export type SessionModeString = (typeof SessionMode)[keyof typeof SessionMode];

export const baseLaneProfile = (
  overrides: Partial<LaneProfile>,
): LaneProfile => ({
  primaryLane: 'minimal_normal',
  secondaryLane: null,
  confidence: 0.8,
  confidenceBand: 'high',
  source: 'onboarding',
  evidence: [],
  traits: {
    needsStructure: 0.5,
    wantsPlay: 0.1,
    needsContinuity: 0.4,
    wantsQuiet: 0.9,
  },
  resolvedAt: Date.now(),
  ...overrides,
});

export function sess(overrides: {
  sessionId?: string;
  userId?: string;
  sessionMode?: SessionModeString;
  plannedDuration?: number;
  effectiveDuration?: number;
}) {
  const now = Date.now();
  return {
    sessionId: overrides.sessionId ?? TEST_UUID,
    userId: overrides.userId ?? TEST_UUID,
    status: 'COMPLETED' as const,
    sessionMode: overrides.sessionMode ?? SessionMode.LIGHT_FOCUS,
    plannedDuration: overrides.plannedDuration ?? 1500,
    actualDuration: 1500,
    effectiveDuration: overrides.effectiveDuration ?? 1500,
    pausedDuration: 0,
    completionPercentage: 100,
    focusQuality: 90,
    focusPurityScore: 90,
    interruptions: 0,
    pauses: 0,
    pausedTime: 0,
    streakMaintained: true,
    modeBonus: 0,
    baseScore: 80,
    timeBonus: 5,
    finalScore: 90,
    createdAt: now,
    streakIncreased: true,
    streakDays: 3,
    xpEarned: 100,
    coinsEarned: 0,
    gemsEarned: 0,
    damageTaken: 0,
    vsAverage: 10,
    vsBest: -5,
    penaltiesApplied: [],
  };
}

export const baseStats = {
  bossEngagement: 'none' as const,
  studyUsageRatio: 0,
};

export {
  resolveFirstWeekExperience,
  resolveCompletionExperiencePolicy,
  resolveLaneCopy,
  getLaneMechanicPolicy,
  decideNudge,
  decideHomeSurfaces,
  buildLaneSessionBrief,
  SessionMode,
  type Lane,
  type LaneProfile,
  type FirstWeekResolverInput,
  type CompletionExperiencePolicyInput,
};
