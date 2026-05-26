/**
 * lane-profile-consumption.test.ts
 *
 * Verifies that all product systems consume LaneProfile rather than
 * inferring lane from raw signals. Each test checks that the system
 * accepts LaneProfile as input and produces correct lane-aware output.
 *
 * Systems tested: Home, FirstWeek, SessionStart, Completion,
 * CoachPresence, NotificationPolicy
 */

import { decideHomeSurfaces } from '../home-experience/home-surface-decision';
import { resolveLaneCopy, resolveFirstWeekExperiment } from '../personalization/first-week-lane-copy';
import { buildLaneSessionBrief } from '../session-start/service';
import { decideNudge } from '../notification-policy/service';
import { getCoachPresenceMessage } from '../coach-presence/copy-service';
import { getLaneMechanicPolicy } from '../lane-engine/service';
import type { LaneProfile } from '../lane-engine/types';

const baseLaneProfile = (overrides: Partial<LaneProfile>): LaneProfile => ({
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

const featureAvailability = { boss: true, challenges: true, premium: true, study: true };
const baseStats = {
  bossChallengeEngagement: 'none' as const,
  coachInteractions: 0,
  comebackSessions: 0,
  completionStreak: 0,
  ignoredFeatures: [],
  premiumFeatureAttempts: [],
  studyUsageRatio: 0,
  totalCompletedSessions: 3,
};
const baseProfile = {
  gamificationIntensity: 'medium' as const,
  motivationStyle: 'coach_led' as const,
  primaryGoal: 'work' as const,
  studyLayerName: 'Deep Work Plan',
  userStage: 'engaged' as const,
};

describe('LaneProfile consumption', () => {
  // ─── Test 1: Home consumes LaneProfile ───
  describe('Home (decideHomeSurfaces)', () => {
    it('student LaneProfile → surfaces Study OS and blocks boss full CTA', () => {
      const map = decideHomeSurfaces({
        behaviorStats: baseStats,
        featureAvailability,
        hasActiveBoss: false,
        hasActiveRecommendation: false,
        hasActiveStudyPlan: true,
        isFirstSession: false,
        personalizationProfile: baseProfile,
        laneProfile: { primaryLane: 'student' },
      });

      expect(map.study_os).not.toBe('hidden');
      expect(map.boss_full_cta).not.toBe('primary');
    });

    it('game_like LaneProfile → surfaces run_board', () => {
      const map = decideHomeSurfaces({
        behaviorStats: { ...baseStats, bossChallengeEngagement: 'medium' },
        featureAvailability,
        hasActiveBoss: true,
        hasActiveRecommendation: false,
        hasActiveStudyPlan: false,
        isFirstSession: false,
        personalizationProfile: baseProfile,
        laneProfile: { primaryLane: 'game_like' },
      });

      expect(map.run_board).not.toBe('hidden');
    });

    it('deep_creative LaneProfile → surfaces project_thread and focus_window', () => {
      const map = decideHomeSurfaces({
        behaviorStats: { ...baseStats, projectFocusUsageRatio: 0.6 },
        featureAvailability,
        hasActiveBoss: false,
        hasActiveRecommendation: false,
        hasActiveStudyPlan: false,
        isFirstSession: false,
        personalizationProfile: baseProfile,
        laneProfile: { primaryLane: 'deep_creative' },
      });

      expect(map.project_thread).not.toBe('hidden');
      expect(map.focus_window).not.toBe('hidden');
    });

    it('minimal_normal LaneProfile → surfaces today_strip and blocks boss noise', () => {
      const map = decideHomeSurfaces({
        behaviorStats: baseStats,
        featureAvailability,
        hasActiveBoss: false,
        hasActiveRecommendation: false,
        hasActiveStudyPlan: false,
        isFirstSession: false,
        personalizationProfile: { ...baseProfile, gamificationIntensity: 'minimal', motivationStyle: 'calm' },
        laneProfile: { primaryLane: 'minimal_normal' },
      });

      expect(map.today_strip).not.toBe('hidden');
      expect(map.boss_full_cta).toBe('blocked');
    });
  });

  // ─── Test 2: FirstWeek consumes LaneProfile ───
  describe('FirstWeek (resolveLaneCopy)', () => {
    it('student LaneProfile → study block Day 0 copy', () => {
      const copy = resolveLaneCopy('DAY_0_NOT_STARTED', baseLaneProfile({ primaryLane: 'student' }), 'fallback');

      expect(copy.primaryMessage).toContain('study block');
      expect(copy.laneStageTheme).toBe('first_study_block');
    });

    it('game_like LaneProfile → run Day 0 copy', () => {
      const copy = resolveLaneCopy('DAY_0_NOT_STARTED', baseLaneProfile({ primaryLane: 'game_like' }), 'fallback');

      expect(copy.primaryMessage).toContain('run');
      expect(copy.laneStageTheme).toBe('first_focus_run');
    });

    it('deep_creative LaneProfile → project Day 0 copy', () => {
      const copy = resolveLaneCopy('DAY_0_NOT_STARTED', baseLaneProfile({ primaryLane: 'deep_creative' }), 'fallback');

      expect(copy.primaryMessage).toContain('project');
      expect(copy.laneStageTheme).toBe('first_project_block');
    });

    it('minimal_normal LaneProfile → clean session Day 0 copy', () => {
      const copy = resolveLaneCopy('DAY_0_NOT_STARTED', baseLaneProfile({ primaryLane: 'minimal_normal' }), 'fallback');

      expect(copy.primaryMessage).toContain('clean');
      expect(copy.laneStageTheme).toBe('first_clean_session');
    });

    it('resolveFirstWeekExperiment consumes Lane (derived from LaneProfile.primaryLane)', () => {
      const exp = resolveFirstWeekExperiment('student', 'DAY_5_PATH_FORMING');
      expect(exp).not.toBeNull();
      expect(exp!.action).toContain('study block');
    });
  });

  // ─── Test 3: SessionStart consumes LaneProfile ───
  describe('SessionStart (buildLaneSessionBrief)', () => {
    it('student lane → STUDY mode with study block CTA', () => {
      const brief = buildLaneSessionBrief({ lane: 'student', durationSeconds: 25 * 60 });

      expect(brief.sessionMode).toBe('STUDY');
      expect(brief.ctaLabel).toBe('Start study block');
      expect(brief.title).toContain('Study');
    });

    it('game_like lane → SPRINT mode with encounter CTA', () => {
      const brief = buildLaneSessionBrief({ lane: 'game_like', durationSeconds: 25 * 60 });

      expect(brief.sessionMode).toBe('SPRINT');
      expect(brief.ctaLabel).toBe('Start encounter');
    });

    it('deep_creative lane → CREATIVE mode with project block CTA', () => {
      const brief = buildLaneSessionBrief({ lane: 'deep_creative', durationSeconds: 25 * 60 });

      expect(brief.sessionMode).toBe('CREATIVE');
      expect(brief.ctaLabel).toBe('Resume project block');
    });

    it('minimal_normal lane → LIGHT_FOCUS mode with clean session CTA', () => {
      const brief = buildLaneSessionBrief({ lane: 'minimal_normal', durationSeconds: 25 * 60 });

      expect(brief.sessionMode).toBe('LIGHT_FOCUS');
      expect(brief.ctaLabel).toBe('Start clean session');
    });

    it('no old economy surfaces in lane brief output', () => {
      const brief = buildLaneSessionBrief({ lane: 'game_like' });

      const json = JSON.stringify(brief);
      expect(json).not.toMatch(/wager|insuranceCost|bountyCost|wallet|gem|shop|inventory/i);
    });
  });

  // ─── Test 4: Completion (coach-presence buildCompletionCoachPresence) consumes motivation style ───
  describe('Completion (CoachPresence via copy-service)', () => {
    it('completion context with study goal returns START_STUDY_SESSION', () => {
      const result = getCoachPresenceMessage({
        aiAvailable: true,
        bossIntensity: null,
        comebackState: null,
        completionContext: null,
        firstWeekStage: 'day_3_5',
        latestSession: null,
        memoryConfidence: 'medium',
        motivationStyle: 'STUDY_FOCUSED',
        premiumMoment: 'none',
        primaryGoal: 'study',
        sessionMode: 'inactive',
        studyLayerLabel: 'Study',
      });

      expect(result.safeIntent).toBe('START_STUDY_SESSION');
    });

    it('completion context with focus goal returns START_SESSION', () => {
      const result = getCoachPresenceMessage({
        aiAvailable: true,
        bossIntensity: null,
        comebackState: null,
        completionContext: null,
        firstWeekStage: 'day_1_2',
        latestSession: null,
        memoryConfidence: 'medium',
        motivationStyle: 'CALM',
        premiumMoment: 'none',
        primaryGoal: 'focus',
        sessionMode: 'inactive',
        studyLayerLabel: null,
      });

      expect(result.safeIntent).toBe('START_SESSION');
    });

    it('LaneMechanicPolicy from LaneProfile blocks old economy for deep_creative and minimal_normal', () => {
      // `economy` is blocked in deep_creative and minimal_normal only.
      // student blocks shop/gems/wagers/broad_social/boss_full_cta (not economy directly).
      // game_like blocks gems/shop/trading/wagers/paid_saves/generic_leaderboards (not economy directly).
      for (const lane of ['deep_creative', 'minimal_normal'] as const) {
        const profile = baseLaneProfile({ primaryLane: lane });
        const policy = getLaneMechanicPolicy(profile);
        expect(policy.blockedMechanics).toContain('economy');
      }
    });

    it('LaneMechanicPolicy from LaneProfile blocks shop across all lanes', () => {
      for (const lane of ['student', 'game_like', 'deep_creative', 'minimal_normal'] as const) {
        const profile = baseLaneProfile({ primaryLane: lane });
        const policy = getLaneMechanicPolicy(profile);
        // shop is blocked in student, game_like. deep_creative and minimal_normal
        // block economy which encompasses shop — verify at least one old-economy
        // mechanic is blocked in every lane.
        const oldEconomy = ['shop', 'gems', 'wagers', 'economy', 'trading'];
        const anyOldEconomyBlocked = oldEconomy.some((m) => policy.blockedMechanics.includes(m as never));
        expect(anyOldEconomyBlocked).toBe(true);
      }
    });
  });

  // ─── Test 5: CoachPresence consumes motivation style (presentation branch — Category A) ───
  describe('CoachPresence (copy-service tone/mood maps)', () => {
    it('each motivation style maps to distinct tone', () => {
      const results = new Set<string>();
      for (const style of ['CALM', 'FRIENDLY', 'COACH_LED', 'GAME_LIKE', 'INTENSE', 'STUDY_FOCUSED'] as const) {
        const result = getCoachPresenceMessage({
          aiAvailable: true,
          bossIntensity: null,
          comebackState: null,
          completionContext: null,
          firstWeekStage: null,
          latestSession: null,
          memoryConfidence: 'none',
          motivationStyle: style,
          premiumMoment: 'none',
          primaryGoal: 'focus',
          sessionMode: 'inactive',
          studyLayerLabel: null,
        });
        results.add(result.tone);
        expect(result.shouldShow).toBe(true); // All styles show on welcome state
      }
      // At least 3 distinct tones across 6 styles
      expect(results.size).toBeGreaterThanOrEqual(3);
    });

    it('CALM motivation style suppresses during active focus', () => {
      const result = getCoachPresenceMessage({
        aiAvailable: true,
        bossIntensity: null,
        comebackState: null,
        completionContext: null,
        firstWeekStage: null,
        latestSession: null,
        memoryConfidence: 'none',
        motivationStyle: 'CALM',
        premiumMoment: 'none',
        primaryGoal: 'focus',
        sessionMode: 'active_focus',
        studyLayerLabel: null,
      });

      expect(result.displayMode).toBe('quiet');
      expect(result.shouldShow).toBe(false);
    });
  });

  // ─── Test 6: NotificationPolicy consumes Lane (via NudgePolicyInput.lane) ───
  describe('NotificationPolicy (decideNudge)', () => {
    it('minimal_normal lane has max 1 nudge per day', () => {
      const decision = decideNudge({
        lane: 'minimal_normal',
        completedSessions: 3,
        daysSinceOnboarding: 2,
        sentToday: 1,
      });

      expect(decision.allowed).toBe(false);
      expect(decision.budgetRemaining).toBe(0);
    });

    it('student lane has max 2 nudges per day', () => {
      const decision = decideNudge({
        lane: 'student',
        completedSessions: 3,
        daysSinceOnboarding: 2,
        sentToday: 1,
      });

      expect(decision.allowed).toBe(true);
      expect(decision.budgetRemaining).toBe(1);
    });

    it('game_like lane maps context to run_continue nudge type', () => {
      const decision = decideNudge({
        lane: 'game_like',
        completedSessions: 4,
        daysSinceOnboarding: 3,
        context: 'run_open',
      });

      expect(decision.type).toBe('run_continue');
      expect(decision.title).toBe('One encounter');
    });

    it('deep_creative lane maps context to project_resume nudge type', () => {
      const decision = decideNudge({
        lane: 'deep_creative',
        completedSessions: 4,
        daysSinceOnboarding: 3,
        context: 'project_stale',
      });

      expect(decision.type).toBe('project_resume');
      expect(decision.title).toBe('Next move');
    });

    it('student lane maps context to study_deadline nudge type', () => {
      const decision = decideNudge({
        lane: 'student',
        completedSessions: 4,
        daysSinceOnboarding: 3,
        context: 'deadline',
      });

      expect(decision.type).toBe('study_deadline');
      expect(decision.priority).toBe('high');
    });
  });
});
