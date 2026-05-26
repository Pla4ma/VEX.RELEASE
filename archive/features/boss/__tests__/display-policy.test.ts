import { describe, it, expect } from '@jest/globals';
import {
  resolveBossDisplayPolicy,
  isBossVisibleAtSurface,
  isCombatAllowed,
  isBossScreenUnlocked,
  type BossDisplayPolicy,
} from '../display-policy';

describe('resolveBossDisplayPolicy', () => {
  describe('feature availability gates', () => {
    it('hidden when feature not available', () => {
      const result = resolveBossDisplayPolicy({
        motivationStyle: 'game_like',
        bossEngagement: 'high',
        firstWeekStage: 'day_6_plus',
        surface: 'boss_screen',
        featureAvailability: false,
      });
      expect(result).toBe('hidden');
    });
  });

  describe('Day 0 calm user', () => {
    it('sees no full boss on boss_screen', () => {
      const result = resolveBossDisplayPolicy({
        motivationStyle: 'calm',
        bossEngagement: 'high',
        firstWeekStage: 'day_0',
        surface: 'boss_screen',
        featureAvailability: true,
      });
      expect(result).toBe('subtle');
    });

    it('sees subtle home_indicator', () => {
      const result = resolveBossDisplayPolicy({
        motivationStyle: 'calm',
        bossEngagement: 'none',
        firstWeekStage: 'day_0',
        surface: 'home_indicator',
        featureAvailability: true,
      });
      expect(result).toBe('subtle');
    });

    it('active_session is hidden', () => {
      const result = resolveBossDisplayPolicy({
        motivationStyle: 'calm',
        bossEngagement: 'high',
        firstWeekStage: 'day_6_plus',
        surface: 'active_session',
        featureAvailability: true,
      });
      expect(result).toBe('hidden');
    });

    it('completion is subtle', () => {
      const result = resolveBossDisplayPolicy({
        motivationStyle: 'calm',
        bossEngagement: 'high',
        firstWeekStage: 'day_0',
        surface: 'completion',
        featureAvailability: true,
      });
      expect(result).toBe('subtle');
    });
  });

  describe('Day 0 game-like user', () => {
    it('boss_screen is completionOnly on day 0', () => {
      const result = resolveBossDisplayPolicy({
        motivationStyle: 'game_like',
        bossEngagement: 'none',
        firstWeekStage: 'day_0',
        surface: 'boss_screen',
        featureAvailability: true,
      });
      expect(result).toBe('completionOnly');
    });

    it('active_session is hidden on day 0', () => {
      const result = resolveBossDisplayPolicy({
        motivationStyle: 'game_like',
        bossEngagement: 'high',
        firstWeekStage: 'day_0',
        surface: 'active_session',
        featureAvailability: true,
      });
      expect(result).toBe('hidden');
    });

    it('home_indicator is subtle (day 0 tiny tease)', () => {
      const result = resolveBossDisplayPolicy({
        motivationStyle: 'game_like',
        bossEngagement: 'none',
        firstWeekStage: 'day_0',
        surface: 'home_indicator',
        featureAvailability: true,
      });
      expect(result).toBe('subtle');
    });
  });

  describe('game-like user after day 0', () => {
    it('active_session is subtle for low engagement', () => {
      const result = resolveBossDisplayPolicy({
        motivationStyle: 'game_like',
        bossEngagement: 'low',
        firstWeekStage: 'day_6_plus',
        surface: 'active_session',
        featureAvailability: true,
      });
      expect(result).toBe('subtle');
    });

    it('active_session is standard for medium engagement', () => {
      const result = resolveBossDisplayPolicy({
        motivationStyle: 'game_like',
        bossEngagement: 'medium',
        firstWeekStage: 'day_6_plus',
        surface: 'active_session',
        featureAvailability: true,
      });
      expect(result).toBe('standard');
    });

    it('boss_screen is full for high engagement', () => {
      const result = resolveBossDisplayPolicy({
        motivationStyle: 'game_like',
        bossEngagement: 'high',
        firstWeekStage: 'day_6_plus',
        surface: 'boss_screen',
        featureAvailability: true,
      });
      expect(result).toBe('full');
    });

    it('completion damage reveal for game-like after day 0', () => {
      const result = resolveBossDisplayPolicy({
        motivationStyle: 'game_like',
        bossEngagement: 'medium',
        firstWeekStage: 'day_3_5',
        surface: 'completion',
        featureAvailability: true,
      });
      expect(result).toBe('standard');
    });
  });

  describe('intense user', () => {
    it('active_session hidden on day 0', () => {
      const result = resolveBossDisplayPolicy({
        motivationStyle: 'intense',
        bossEngagement: 'high',
        firstWeekStage: 'day_0',
        surface: 'active_session',
        featureAvailability: true,
      });
      expect(result).toBe('hidden');
    });

    it('active_session hidden with no engagement', () => {
      const result = resolveBossDisplayPolicy({
        motivationStyle: 'intense',
        bossEngagement: 'none',
        firstWeekStage: 'day_6_plus',
        surface: 'active_session',
        featureAvailability: true,
      });
      expect(result).toBe('hidden');
    });

    it('active_session standard when engaged', () => {
      const result = resolveBossDisplayPolicy({
        motivationStyle: 'intense',
        bossEngagement: 'medium',
        firstWeekStage: 'day_6_plus',
        surface: 'active_session',
        featureAvailability: true,
      });
      expect(result).toBe('standard');
    });

    it('boss_screen completionOnly on day 0', () => {
      const result = resolveBossDisplayPolicy({
        motivationStyle: 'intense',
        bossEngagement: 'high',
        firstWeekStage: 'day_0',
        surface: 'boss_screen',
        featureAvailability: true,
      });
      expect(result).toBe('completionOnly');
    });
  });

  describe('engagement-driven (friendly/coach_led)', () => {
    it('active_session hidden with none engagement', () => {
      const result = resolveBossDisplayPolicy({
        motivationStyle: 'coach_led',
        bossEngagement: 'none',
        firstWeekStage: 'day_6_plus',
        surface: 'active_session',
        featureAvailability: true,
      });
      expect(result).toBe('hidden');
    });

    it('active_session subtle with medium engagement', () => {
      const result = resolveBossDisplayPolicy({
        motivationStyle: 'friendly',
        bossEngagement: 'medium',
        firstWeekStage: 'day_6_plus',
        surface: 'active_session',
        featureAvailability: true,
      });
      expect(result).toBe('subtle');
    });

    it('home_indicator always subtle', () => {
      const result = resolveBossDisplayPolicy({
        motivationStyle: 'coach_led',
        bossEngagement: 'none',
        firstWeekStage: 'day_0',
        surface: 'home_indicator',
        featureAvailability: true,
      });
      expect(result).toBe('subtle');
    });
  });

  describe('study_focused user', () => {
    it('active_session is always hidden', () => {
      const result = resolveBossDisplayPolicy({
        motivationStyle: 'study_focused',
        bossEngagement: 'high',
        firstWeekStage: 'day_6_plus',
        surface: 'active_session',
        featureAvailability: true,
      });
      expect(result).toBe('hidden');
    });

    it('boss_screen is subtle', () => {
      const result = resolveBossDisplayPolicy({
        motivationStyle: 'study_focused',
        bossEngagement: 'high',
        firstWeekStage: 'day_6_plus',
        surface: 'boss_screen',
        featureAvailability: true,
      });
      expect(result).toBe('subtle');
    });
  });
});

describe('helper functions', () => {
  const testCases: Array<{ policy: BossDisplayPolicy; visible: boolean; combat: boolean; unlocked: boolean }> = [
    { policy: 'hidden', visible: false, combat: false, unlocked: false },
    { policy: 'subtle', visible: true, combat: false, unlocked: true },
    { policy: 'standard', visible: true, combat: true, unlocked: true },
    { policy: 'full', visible: true, combat: true, unlocked: true },
    { policy: 'completionOnly', visible: true, combat: false, unlocked: false },
  ];

  testCases.forEach(({ policy, visible, combat, unlocked }) => {
    it(`${policy} has visible:${visible} combat:${combat} unlocked:${unlocked}`, () => {
      expect(isBossVisibleAtSurface(policy)).toBe(visible);
      expect(isCombatAllowed(policy)).toBe(combat);
      expect(isBossScreenUnlocked(policy)).toBe(unlocked);
    });
  });
});
