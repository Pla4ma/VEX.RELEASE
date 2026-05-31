import { describe, it, expect } from '@jest/globals';
import { ALL_ACHIEVEMENTS, RARITY_CONFIG } from '../definitions';
import { ACHIEVEMENT_FEATURE_UNLOCKS } from '../feature-unlocks';
import { STUDY_ACHIEVEMENTS } from '../study-achievements';
import {
  BOSS_PHASE3_ACHIEVEMENTS,
  STREAK_EVOLUTION_ACHIEVEMENTS,
} from '../boss-streak-achievements';
import { DEDICATION_ACHIEVEMENTS } from '../types';

describe('Definitions Index', () => {
  it('ALL_ACHIEVEMENTS contains achievements from all categories', () => {
    expect(ALL_ACHIEVEMENTS.length).toBeGreaterThan(0);
    const cats = new Set(ALL_ACHIEVEMENTS.map((a) => a.category));
    expect(cats.has('SESSION')).toBe(true);
    expect(cats.has('STREAK')).toBe(true);
    expect(cats.has('BOSS')).toBe(true);
  });

  it('each achievement has required fields', () => {
    for (const a of ALL_ACHIEVEMENTS) {
      expect(a.id).toBeTruthy();
      expect(a.title).toBeTruthy();
      expect(a.description).toBeTruthy();
      expect(a.category).toBeTruthy();
      expect(a.rarity).toBeTruthy();
      expect(typeof a.progressMax).toBe('number');
      expect(a.progressMax).toBeGreaterThan(0);
      expect(a.unlockCondition).toBeDefined();
      expect(typeof a.pointValue).toBe('number');
      expect(a.shareText).toBeTruthy();
    }
  });

  it('RARITY_CONFIG has entries for all 5 rarities', () => {
    for (const r of ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY']) {
      expect(RARITY_CONFIG[r as keyof typeof RARITY_CONFIG]).toBeDefined();
    }
  });

  it('STUDY_ACHIEVEMENTS is non-empty and all STUDY', () => {
    expect(STUDY_ACHIEVEMENTS.length).toBeGreaterThan(0);
    expect(STUDY_ACHIEVEMENTS.every((a) => a.category === 'STUDY')).toBe(true);
  });

  it('BOSS_PHASE3_ACHIEVEMENTS is non-empty and all BOSS', () => {
    expect(BOSS_PHASE3_ACHIEVEMENTS.length).toBeGreaterThan(0);
    expect(BOSS_PHASE3_ACHIEVEMENTS.every((a) => a.category === 'BOSS')).toBe(true);
  });

  it('STREAK_EVOLUTION_ACHIEVEMENTS is non-empty and all STREAK', () => {
    expect(STREAK_EVOLUTION_ACHIEVEMENTS.length).toBeGreaterThan(0);
    expect(STREAK_EVOLUTION_ACHIEVEMENTS.every((a) => a.category === 'STREAK')).toBe(true);
  });

  it('ACHIEVEMENT_FEATURE_UNLOCKS has required fields', () => {
    expect(ACHIEVEMENT_FEATURE_UNLOCKS.length).toBeGreaterThan(0);
    for (const u of ACHIEVEMENT_FEATURE_UNLOCKS) {
      expect(u.achievementId).toBeTruthy();
      expect(u.featureId).toBeTruthy();
      expect(u.featureName).toBeTruthy();
    }
  });

  it('DEDICATION_ACHIEVEMENTS has session achievements', () => {
    expect(DEDICATION_ACHIEVEMENTS.length).toBeGreaterThan(0);
    expect(DEDICATION_ACHIEVEMENTS.every((a) => a.category === 'SESSION')).toBe(true);
  });

  it('ALL_ACHIEVEMENTS has no duplicate IDs', () => {
    const ids = ALL_ACHIEVEMENTS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
