import { decideHomeSurfaces } from '../../../../features/home-experience/home-surface-decision';
import { BLOCKED_ON_DAY0 } from '../../../../features/home-experience/day0-surface-constants';
import type { HomeSurfaceDecision } from '../../../../features/home-experience/surface-decision-schemas';
import {
  ONBOARDING_PROGRESS_PHASES,
  ONBOARDING_PROMISE_COPY,
  STEP_TITLES,
} from '../onboarding-flow-data';
import { LANE_LABELS } from '../LaneConfirmationStep';
import { LANE_DESCRIPTIONS } from '../LaneChoiceStep';

const day0Map = decideHomeSurfaces({
  featureAvailability: {
    boss: true,
    challenges: true,
    premium: true,
    study: true,
  },
  personalizationProfile: {
    motivationStyle: 'friendly',
    primaryGoal: 'focus',
    gamificationIntensity: 'medium',
    studyLayerName: 'Study Mode',
    userStage: 'new',
  },
  behaviorStats: {
    bossChallengeEngagement: 'none',
    coachInteractions: 0,
    comebackSessions: 0,
    completionStreak: 0,
    ignoredFeatures: [],
    premiumFeatureAttempts: [],
    studyUsageRatio: 0,
    totalCompletedSessions: 0,
  },
  hasActiveBoss: false,
  hasActiveRecommendation: false,
  hasActiveStudyPlan: false,
  isFirstSession: true,
});

function isVisible(value: HomeSurfaceDecision): boolean {
  return value !== 'hidden' && value !== 'blocked';
}

describe('first 10 seconds clarity', () => {
  it('intro contains adaptive promise', () => {
    expect(ONBOARDING_PROMISE_COPY.primary).toBe(
      'VEX changes based on how you work.',
    );
    expect(ONBOARDING_PROMISE_COPY.secondary).toBe(
      'Answer a few questions and VEX will open around how you work.',
    );
  });

  it('first session is reachable within acceptable screens', () => {
    expect(STEP_TITLES).toHaveLength(3);
    expect(STEP_TITLES[STEP_TITLES.length - 1]).toBe('Confirm your focus mode');
  });

  it('minimal progression uses Understand, Match, Open', () => {
    expect(ONBOARDING_PROGRESS_PHASES).toEqual([
      'Understand',
      'Match',
      'Open',
    ]);
  });

  it('lane recommendation copy appears', () => {
    expect(LANE_LABELS.student).toBe('Study Mode');
    expect(LANE_LABELS.game_like).toBe('Run Mode');
    expect(LANE_LABELS.deep_creative).toBe('Project Mode');
    expect(LANE_LABELS.minimal_normal).toBe('Clean Mode');
  });

  it('Day 0 has at most five visible surfaces', () => {
    expect(Object.values(day0Map).filter(isVisible).length).toBeLessThanOrEqual(
      5,
    );
  });

  it('Day 0 has no dead or hidden systems exposed', () => {
    for (const surface of BLOCKED_ON_DAY0) {
      expect(day0Map[surface]).toMatch(/hidden|blocked/);
    }
  });

  it('Day 0 does not show premium', () => {
    expect(day0Map.premium_tease).toBe('hidden');
  });

  it('Day 0 does not explain all four lanes at once', () => {
    const laneCopy = Object.values(LANE_DESCRIPTIONS).join(' ');
    expect(laneCopy).not.toMatch(
      /Study OS|Run Board|Project Thread|Clean Mode/,
    );
  });
});
