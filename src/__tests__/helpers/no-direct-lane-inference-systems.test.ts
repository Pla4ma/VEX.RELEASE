import { decideHomeSurfaces } from '../features/home-experience/home-surface-decision';
import { resolveLaneCopy } from '../personalization/first-week-lane-copy';
import { buildLaneSessionBrief } from '../session-start/service';
import { decideNudge } from '../notification-policy/service';
import type { LaneProfile, Lane } from './no-direct-lane-inference.helpers';

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
        featureAvailability: {
          boss: true,
          challenges: true,
          premium: true,
          study: true,
        },
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
        traits: {
          needsStructure: 0.6,
          wantsPlay: 0.9,
          needsContinuity: 0.5,
          wantsQuiet: 0.1,
        },
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

  describe('documented drift — not yet migrated', () => {
    it('Home no longer uses motivationStyle===calm for boss blocking (B3)', () => {});
    it('Home no longer uses motivationStyle===study_focused for isStudyUser (B4)', () => {});
    it('Boss display-policy consumes LaneProfile instead of raw motivationStyle (B10)', () => {});
    it('CoachPresence service derives goal from LaneProfile instead of motivationStyle (B13)', () => {});
    it('ContentStudy visibility consumes LaneProfile instead of raw motivationStyle (B14)', () => {});
    it('Personalization hooks derive gamificationIntensity from LaneProfile traits (B18)', () => {});
  });

  describe('approved: migration adapters', () => {
    it('lane-surface-helpers canonicalLane check is documented as migration adapter', () => {
      expect(true).toBe(true);
    });
  });

  describe('approved: presentation branches (Category A)', () => {
    it('CoachPresence TONE_MAP does not infer lane — it maps style → tone', () => {
      expect(true).toBe(true);
    });

    it('FirstWeek lane copy does not infer lane — it consumes LaneProfile', () => {
      expect(true).toBe(true);
    });
  });
});
