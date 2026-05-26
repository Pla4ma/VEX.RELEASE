/**
 * VEX Phase 17 — Journeys: Day 3 Memory gating (Category 6)
 */
import { describe, expect, it } from '@jest/globals';
import { decideHomeSurfaces } from '../../features/home-experience/home-surface-decision';

const featureAvailability = { boss: true, challenges: true, premium: true, study: true };

function stats(sessions: number, coach: number, overrides: Record<string, unknown> = {}) {
  return {
    totalCompletedSessions: sessions, coachInteractions: coach,
    studyUsageRatio: (overrides.studyUsageRatio as number) ?? 0,
    bossChallengeEngagement: 'none' as const, comebackSessions: 0,
    ignoredFeatures: [], premiumFeatureAttempts: [], completionStreak: 0,
  };
}

function map(sessions: number, coach: number, stage: 'new' | 'activating' | 'engaged', firstSession = false) {
  return decideHomeSurfaces({
    featureAvailability,
    personalizationProfile: {
      motivationStyle: 'study_focused', primaryGoal: 'study',
      gamificationIntensity: 'medium', studyLayerName: 'Study OS', userStage: stage,
    },
    behaviorStats: stats(sessions, coach),
    hasActiveStudyPlan: false, hasActiveRecommendation: false,
    hasActiveBoss: false, isFirstSession: firstSession,
    laneProfile: { primaryLane: 'student' },
  });
}

describe('Phase 17 — Day 3 memory gating', () => {
  it('memory_insight hidden before 3 sessions', () => {
    expect(map(2, 1, 'activating').memory_insight).toBe('hidden');
  });

  it('memory_insight appears as tiny_tease at >= 3 sessions', () => {
    expect(map(3, 2, 'engaged').memory_insight).toBe('tiny_tease');
  });

  it('memory_insight only appears when coach interactions >= 2', () => {
    expect(map(5, 0, 'activating').memory_insight).toBe('hidden');
  });

  it('no fake memory — gated by real session count, not synthetic coach interactions', () => {
    // Day 0 with high coach interactions should still block memory
    expect(map(0, 5, 'new', true).memory_insight).toMatch(/hidden|blocked/);
  });
});
