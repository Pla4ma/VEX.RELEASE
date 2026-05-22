/**
 * TASK 6 tests: Personalization v3 — product-level experience resolver
 *
 * Verifies:
 * - calm work user gets soft tone, minimal gamification, subtle boss
 * - study-focused student gets study_centered layout, study_tutor coach
 * - game-like user gets game_centered layout, game_guide coach, game-like boss
 * - intense user gets tactical coach, direct tone, intense boss
 * - coach-led user gets mentor coach, strategic tone
 * - user who ignores boss → adaptations include 'boss_ignored'
 * - user who uses study heavily → adaptations include 'study_heavy'
 * - user who abandons long sessions → adaptations include 'abandonment_aware'
 */
import { describe, it, expect } from '@jest/globals';
import { resolveVexExperience } from '../service';
import type { VexPersonalizationProfile, BehaviorStats, FeatureAvailabilitySnapshot } from '../schemas';

function makeProfile(overrides: Partial<VexPersonalizationProfile> = {}): VexPersonalizationProfile {
  return {
    primaryGoal: 'work',
    motivationStyle: 'calm',
    preferredTone: 'soft',
    gamificationIntensity: 'minimal',
    coachMode: 'reflection',
    studyLayerName: 'Deep Work Plan',
    defaultSessionDuration: 25,
    defaultSessionMode: 'FOCUS',
    userStage: 'new',
    ...overrides,
  };
}

function makeStats(overrides: Partial<BehaviorStats> = {}): BehaviorStats {
  return {
    abandonedSessionDurations: [],
    bossChallengeEngagement: 'none',
    coachInteractions: 0,
    comebackSessions: 0,
    completedSessionDurations: [],
    completionStreak: 0,
    ignoredFeatures: [],
    mostSuccessfulTimeOfDay: null,
    preferredSessionMode: null,
    premiumFeatureAttempts: [],
    studyUsageRatio: 0,
    totalCompletedSessions: 0,
    ...overrides,
  };
}

const defaultAvailability: FeatureAvailabilitySnapshot = {
  boss: false,
  challenges: false,
  premium: false,
  study: false,
};

describe('Personalization v3 — resolveVexExperience', () => {
  describe('Calm work user', () => {
    it('gets soft tone and minimal gamification', () => {
      const profile = makeProfile({
        primaryGoal: 'work',
        motivationStyle: 'calm',
        preferredTone: 'soft',
        gamificationIntensity: 'minimal',
      });
      const result = resolveVexExperience(profile, makeStats(), defaultAvailability);
      expect(result.coachTone).toBe('soft');
      expect(result.bossIntensity).toBe('subtle');
    });

    it('gets compact_starter layout at 0 sessions', () => {
      const profile = makeProfile({ motivationStyle: 'calm' });
      const result = resolveVexExperience(profile, makeStats({ totalCompletedSessions: 0 }), defaultAvailability);
      expect(result.homeLayoutVariant).toBe('compact_starter');
      expect(result.userStage).toBe('new_user');
      expect(result.primaryHomeCTA.intent).toBe('START_SESSION');
      expect(result.homeSpotlight).toBe('none');
    });
  });

  describe('Study-focused student', () => {
    it('gets study_centered layout', () => {
      const profile = makeProfile({
        primaryGoal: 'study',
        motivationStyle: 'study_focused',
        preferredTone: 'strategic',
        gamificationIntensity: 'minimal',
        coachMode: 'study_tutor',
        studyLayerName: 'Study OS',
      });
      const result = resolveVexExperience(
        profile,
        makeStats({ totalCompletedSessions: 3, studyUsageRatio: 0.6 }),
        { boss: true, challenges: true, premium: false, study: true },
      );
      expect(result.homeLayoutVariant).toBe('study_centered');
      expect(result.studyLayerLabel).toBe('Study OS');
      expect(result.studyLayerProminence).toBe('spotlight');
      expect(result.allowedRoutes).toContain('SessionStack.SessionSetup');
      expect(result.allowedRoutes).not.toContain('Guild');
    });

    it('home sections include study_layer', () => {
      const profile = makeProfile({ primaryGoal: 'study', motivationStyle: 'study_focused' });
      const result = resolveVexExperience(
        profile,
        makeStats({ totalCompletedSessions: 3, studyUsageRatio: 0.5 }),
        { boss: true, challenges: true, premium: false, study: true },
      );
      expect(result.home.sections).toContain('study_layer');
    });
  });

  describe('Game-like user', () => {
    it('gets game_centered layout and game-like boss', () => {
      const profile = makeProfile({
        motivationStyle: 'game_like',
        gamificationIntensity: 'strong',
        coachMode: 'game_guide',
      });
      const result = resolveVexExperience(
        profile,
        makeStats({ totalCompletedSessions: 5 }),
        { boss: true, challenges: true, premium: false, study: false },
      );
      expect(result.bossIntensity).toBe('game-like');
      expect(result.homeLayoutVariant).toBe('game_centered');
    });

    it('boss is visible and has session_damage effect', () => {
      const profile = makeProfile({ motivationStyle: 'game_like' });
      const result = resolveVexExperience(
        profile,
        makeStats({ totalCompletedSessions: 5 }),
        { boss: true, challenges: true, premium: false, study: false },
      );
      expect(result.boss.isVisible).toBe(true);
      expect(result.boss.completionEffect).toBe('session_damage');
    });
  });

  describe('Intense user', () => {
    it('gets tactical coach and direct tone', () => {
      const profile = makeProfile({
        motivationStyle: 'intense',
        preferredTone: 'direct',
        coachMode: 'tactical',
      });
      const result = resolveVexExperience(profile, makeStats({ totalCompletedSessions: 10 }), { boss: true, challenges: true, premium: true, study: false });
      expect(result.coachTone).toBe('direct');
      expect(result.bossIntensity).toBe('intense');
    });
  });

  describe('Coach-led user', () => {
    it('gets mentor coach and strategic tone', () => {
      const profile = makeProfile({
        motivationStyle: 'coach_led',
        preferredTone: 'strategic',
        coachMode: 'mentor',
      });
      const result = resolveVexExperience(profile, makeStats({ totalCompletedSessions: 3 }), defaultAvailability);
      expect(result.coachTone).toBe('strategic');
      expect(result.homeLayoutVariant).toBe('coach_first');
    });
  });

  describe('Behavior-based adaptations', () => {
    it('user who ignores boss → boss_ignored in adaptations', () => {
      const profile = makeProfile({ motivationStyle: 'game_like' });
      const result = resolveVexExperience(
        profile,
        makeStats({
          totalCompletedSessions: 8,
          completedSessionDurations: [25, 30, 25],
          ignoredFeatures: ['boss_tab'],
        }),
        { boss: true, challenges: true, premium: false, study: false },
      );
      expect(result.behaviorAdaptations).toContain('boss_ignored');
    });

    it('user who uses study heavily → study_heavy in adaptations', () => {
      const profile = makeProfile({ primaryGoal: 'study', motivationStyle: 'study_focused' });
      const result = resolveVexExperience(
        profile,
        makeStats({
          totalCompletedSessions: 5,
          completedSessionDurations: [30, 45, 30, 25, 30],
          studyUsageRatio: 0.7,
        }),
        { boss: true, challenges: true, premium: false, study: true },
      );
      expect(result.behaviorAdaptations).toContain('study_heavy');
    });

    it('user who abandons sessions → abandonment_aware in adaptations', () => {
      const profile = makeProfile({ motivationStyle: 'calm' });
      const result = resolveVexExperience(
        profile,
        makeStats({
          totalCompletedSessions: 5,
          completedSessionDurations: [25, 30, 25],
          abandonedSessionDurations: [10, 5],
        }),
        defaultAvailability,
      );
      expect(result.behaviorAdaptations).toContain('abandonment_aware');
    });

    it('user with comeback sessions → comeback_adaptive in adaptations', () => {
      const profile = makeProfile({ motivationStyle: 'calm' });
      const result = resolveVexExperience(
        profile,
        makeStats({
          totalCompletedSessions: 5,
          completedSessionDurations: [25, 30, 25],
          comebackSessions: 2,
        }),
        defaultAvailability,
      );
      expect(result.behaviorAdaptations).toContain('comeback_adaptive');
    });

    it('user with coach interactions → coach_responsive in adaptations', () => {
      const profile = makeProfile({ motivationStyle: 'coach_led' });
      const result = resolveVexExperience(
        profile,
        makeStats({
          totalCompletedSessions: 5,
          completedSessionDurations: [25, 30, 25],
          coachInteractions: 5,
        }),
        defaultAvailability,
      );
      expect(result.behaviorAdaptations).toContain('coach_responsive');
    });
  });

  describe('Premium moment resolution', () => {
    it('no premium when < 5 sessions', () => {
      const profile = makeProfile({ motivationStyle: 'calm' });
      const result = resolveVexExperience(
        profile,
        makeStats({ totalCompletedSessions: 3 }),
        { boss: false, challenges: false, premium: true, study: false },
      );
      expect(result.premium.trigger).toBe('none');
      expect(result.premium.shouldTease).toBe(false);
    });
  });

  describe('Adaptive Study OS naming', () => {
    it('student user sees Study OS', () => {
      const profile = makeProfile({
        primaryGoal: 'study',
        motivationStyle: 'study_focused',
        studyLayerName: 'Study OS',
      });
      const result = resolveVexExperience(profile, makeStats(), defaultAvailability);
      expect(result.studyLayerLabel).toBe('Study OS');
      expect(result.home.studyName).toBe('Study OS');
    });

    it('work user sees Deep Work Plan, never school wording', () => {
      const profile = makeProfile({
        primaryGoal: 'work',
        motivationStyle: 'coach_led',
        studyLayerName: 'Deep Work Plan',
      });
      const result = resolveVexExperience(
        profile,
        makeStats({ totalCompletedSessions: 5 }),
        { boss: true, challenges: true, premium: false, study: true },
      );
      expect(result.studyLayerLabel).toBe('Deep Work Plan');
      expect(result.home.studyName).toBe('Deep Work Plan');
      const joinedCopy = [result.home.coachCopy, result.home.studyName].join(' ');
      expect(joinedCopy.toLowerCase()).not.toMatch(/quiz|homework|chapter|study streak/i);
    });

    it('creative user sees Project Focus Path', () => {
      const profile = makeProfile({
        primaryGoal: 'creative',
        motivationStyle: 'friendly',
        studyLayerName: 'Project Focus Path',
        coachMode: 'mentor',
      });
      const result = resolveVexExperience(profile, makeStats(), defaultAvailability);
      expect(result.studyLayerLabel).toBe('Project Focus Path');
      expect(result.home.studyName).toBe('Project Focus Path');
    });

    it('learning user sees Learning OS', () => {
      const profile = makeProfile({
        primaryGoal: 'learning',
        motivationStyle: 'study_focused',
        studyLayerName: 'Learning OS',
      });
      const result = resolveVexExperience(profile, makeStats(), defaultAvailability);
      expect(result.studyLayerLabel).toBe('Learning OS');
      expect(result.home.studyName).toBe('Learning OS');
    });

    it('personal growth user sees Growth Plan', () => {
      const profile = makeProfile({
        primaryGoal: 'personal',
        motivationStyle: 'calm',
        studyLayerName: 'Growth Plan',
      });
      const result = resolveVexExperience(profile, makeStats(), defaultAvailability);
      expect(result.studyLayerLabel).toBe('Growth Plan');
      expect(result.home.studyName).toBe('Growth Plan');
    });
  });
});
