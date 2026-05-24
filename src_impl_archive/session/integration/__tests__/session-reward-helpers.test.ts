import { SessionMode } from '../../modes';
import type { SessionSummary } from '../../types';
import { calculateRewards } from '../session-reward-helpers';

function createSummary(overrides: Partial<SessionSummary> = {}): SessionSummary {
  return {
    sessionId: '123e4567-e89b-12d3-a456-426614174002',
    userId: '123e4567-e89b-12d3-a456-426614174003',
    status: 'COMPLETED',
    plannedDuration: 30 * 60000,
    actualDuration: 30 * 60000,
    effectiveDuration: 30 * 60000,
    pausedDuration: 0,
    completionPercentage: 100,
    focusQuality: 96,
    focusPurityScore: 96,
    interruptions: 0,
    pauses: 0,
    baseScore: 100,
    timeBonus: 0,
    streakBonus: 0,
    finalScore: 100,
    xpEarned: 100,
    coinsEarned: 20,
    gemsEarned: 1,
    streakMaintained: true,
    streakIncreased: true,
    streakDays: 7,
    userLevel: 1,
    damageTaken: 0,
    penaltiesApplied: [],
    bonuses: [],
    vsAverage: 0,
    vsBest: 0,
    sessionMode: SessionMode.LIGHT_FOCUS,
    modeBonus: 0,
    createdAt: Date.now(),
    ...overrides,
  };
}

describe('session reward helpers', () => {
  it('uses millisecond session durations for base rewards', () => {
    const rewards = calculateRewards(0, createSummary());

    expect(rewards.baseXP).toBe(300);
    expect(rewards.baseCoins).toBe(30);
  });

  it('makes demanding session modes materially more rewarding when executed well', () => {
    const lightRewards = calculateRewards(7, createSummary({
      createdAt: new Date('2026-04-28T12:00:00-04:00').getTime(),
    }));
    const deepWorkRewards = calculateRewards(7, createSummary({
      createdAt: new Date('2026-04-28T12:00:00-04:00').getTime(),
      sessionMode: SessionMode.DEEP_WORK,
    }));

    expect(deepWorkRewards.baseXP).toBeGreaterThan(lightRewards.baseXP);
    expect(deepWorkRewards.difficultyBonus.xp).toBeGreaterThan(0);
    expect(deepWorkRewards.totalXP).toBeGreaterThan(lightRewards.totalXP);
  });

  it('withholds quality bonuses when disruptions drag focus below the threshold', () => {
    const rewards = calculateRewards(3, createSummary({
      focusQuality: 76,
      focusPurityScore: 76,
      interruptions: 2,
      pauses: 4,
    }));

    expect(rewards.qualityBonus.xp).toBe(0);
  });

  it('adds the daily modifier bonus when the mode matches today selection', () => {
    const rewards = calculateRewards(0, createSummary({
      createdAt: new Date('2026-04-29T12:00:00-04:00').getTime(),
      sessionMode: SessionMode.SPRINT,
    }));

    expect(rewards.dailyModifierBonus.modifierId).toBe('midweek-sprint');
    expect(rewards.dailyModifierBonus.xp).toBeGreaterThan(0);
    expect(rewards.finalMultiplier).toBeGreaterThan(1);
  });
});
