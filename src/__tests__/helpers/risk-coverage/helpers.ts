import {
  hasActiveStudyFollowUp,
  extractStudyContextFromSession,
} from '../../../features/session-completion/study-context';
import { buildPostSessionNextAction } from '../../../features/session-completion/post-session-next-action';
import {
  computeWeakTopics,
  computeWeeklyIntelligence,
  hasWeeklyIntelligenceData,
} from '../../../features/study-intelligence/service';
import type { StudyPlan } from '../../../features/study-os/schemas';
import { resolveFirstWeekExperience } from '../../../features/personalization/first-week-service';
import type { FirstWeekResolverInput } from '../../../features/personalization/first-week-schemas';
import { resolveCompletionExperiencePolicy } from '../../../features/session-completion/completion-experience-policy';
import type { CompletionExperiencePolicyInput } from '../../../features/session-completion/completion-experience-policy-schemas';
import { resolveLaneCopy } from '../../../features/personalization/first-week-lane-copy';
import { getLaneMechanicPolicy } from '../../../features/lane-engine/service';
import { decideNudge } from '../../../features/notification-policy/service';
import { decideHomeSurfaces } from '../../../features/home-experience/home-surface-decision';
import { buildLaneSessionBrief } from '../../../features/session-start/service';
import { SessionMode } from '../../../session/modes';
import type { Lane, LaneProfile } from '../../../features/lane-engine/types';

export {
  hasActiveStudyFollowUp,
  extractStudyContextFromSession,
  buildPostSessionNextAction,
  computeWeakTopics,
  computeWeeklyIntelligence,
  hasWeeklyIntelligenceData,
  resolveFirstWeekExperience,
  resolveCompletionExperiencePolicy,
  resolveLaneCopy,
  getLaneMechanicPolicy,
  decideNudge,
  decideHomeSurfaces,
  buildLaneSessionBrief,
  SessionMode,
};

export type {
  StudyPlan,
  FirstWeekResolverInput,
  CompletionExperiencePolicyInput,
  Lane,
  LaneProfile,
};

export const TEST_UUID = '550e8400-e29b-41d4-a716-446655440000';

export function baseLaneProfile(
  overrides: Partial<LaneProfile> = {},
): LaneProfile {
  return {
    primaryLane: overrides.primaryLane ?? 'minimal_normal',
    secondaryLane: overrides.secondaryLane ?? null,
    confidence: overrides.confidence ?? 0.8,
    confidenceBand: overrides.confidenceBand ?? 'high',
    source: overrides.source ?? 'onboarding',
    evidence: overrides.evidence ?? [],
    traits: overrides.traits ?? {
      needsStructure: 0.5,
      wantsPlay: 0.1,
      needsContinuity: 0.4,
      wantsQuiet: 0.9,
    },
    resolvedAt: overrides.resolvedAt ?? Date.now(),
  };
}

type SessionModeString = (typeof SessionMode)[keyof typeof SessionMode];

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
    userLevel: 1,
    bonuses: [],
  };
}

export function makeStudyPlan(overrides: Partial<StudyPlan> = {}): StudyPlan {
  const now = Date.now();
  return {
    blocks: [
      {
        id: 'block-1',
        title: 'Cell Biology',
        objective: 'Understand mitochondrial function',
        estimatedMinutes: 30,
        status: 'completed' as const,
        priority: 'medium' as const,
        studyPlanId: overrides.id ?? 'plan-1',
      },
    ],
    createdAt: now,
    deadlineAt: null,
    id: overrides.id ?? 'plan-1',
    reviewItems: [
      {
        id: 'review-1',
        prompt: 'Explain the Krebs cycle',
        confidence: 'weak' as const,
        studyPlanId: overrides.id ?? 'plan-1',
        answerHint: null,
        dueAt: now + 86400000,
      },
    ],
    source: {
      createdAt: now,
      extractedTextStatus: 'none' as const,
      id: 'source-1',
      title: overrides.title ?? 'Biology Review',
      type: 'manual' as const,
      userId: overrides.userId ?? TEST_UUID,
    },
    status: 'active' as const,
    title: overrides.title ?? 'Biology Review',
    userId: overrides.userId ?? TEST_UUID,
  };
}

export const baseStats = {
  bossEngagement: 'none' as const,
  studyUsageRatio: 0,
};
