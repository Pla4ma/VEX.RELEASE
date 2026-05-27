import {
  decideHomeSurfaces,
  resolveLaneCopy,
  buildLaneSessionBrief,
  decideNudge,
} from './helpers';
import type { LaneProfile, Lane } from './helpers';

describe('No direct lane inference', () => {
  describe('product systems consume Lane or LaneProfile as input', () => {
    it('Home (decideHomeSurfaces) accepts laneProfile in SurfaceDecisionInput', () => {
      const result = decideHomeSurfaces({
        behaviorStats: {
          bossChallengeEngagement: 'none',
          coachInteractions: 0,
          comebackSessions: 0,
          completionStreak: 0,
          ignoredFeatures: [],
          premiumFeatureAttempts: [],
          studyUsageRatio: 0,
          totalCompletedSessions: 3,
        },
        featureAvailability: { boss: true, challenges: true, premium: true, study: true },
        hasActiveBoss: false,
        hasActiveRecommendation: false,
        hasActiveStudyPlan: false,
        isFirstSession: false,
        personalizationProfile: {
          motivationStyle: 'coach_led',
          primaryGoal: 'work',
          gamificationIntensity: 'medium',
          studyLayerName: 'Deep Work Plan',
          userStage: 'engaged',
        },
        laneProfile: { primaryLane: 'student' },
      });

      expect(result).toBeDefined();
      expect(result.start_session).toBeDefined();
    });

    it('FirstWeek (resolveLaneCopy) accepts LaneProfile', () => {
      const profile: LaneProfile = {
        primaryLane: 'game_like',
        secondaryLane: null,
        confidence: 0.8,
        confidenceBand: 'high',
        source: 'onboarding',
        evidence: [],
        traits: { needsStructure: 0.6, wantsPlay: 0.9, needsContinuity: 0.5, wantsQuiet: 0.1 },
        resolvedAt: Date.now(),
      };

      const copy = resolveLaneCopy('DAY_0_NOT_STARTED', profile, 'fallback');
      expect(copy.primaryMessage).toBeDefined();
    });

    it('SessionStart (buildLaneSessionBrief) accepts Lane', () => {
      const lane: Lane = 'deep_creative';
      const brief = buildLaneSessionBrief({ lane, durationSeconds: 25 * 60 });

      expect(brief.lane).toBe('deep_creative');
      expect(brief.sessionMode).toBeDefined();
    });

    it('NotificationPolicy (decideNudge) accepts Lane in NudgePolicyInput', () => {
      const lane: Lane = 'minimal_normal';
      const decision = decideNudge({
        lane,
        completedSessions: 3,
        daysSinceOnboarding: 2,
      });

      expect(decision.lane).toBe('minimal_normal');
      expect(decision).toHaveProperty('allowed');
    });
  });
});
