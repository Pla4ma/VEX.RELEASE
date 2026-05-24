import { SessionMode } from '../../../session/modes';
import type { SessionSummary } from '../../../session/types';
import type { ChestResult } from '../../rewards/chest-engine';
import { buildPremiumCompletionReward } from '../premium-completion-reward';

const summary: SessionSummary = {
  actualDuration: 1500,
  baseScore: 100,
  bonuses: [],
  coinsEarned: 12,
  completionPercentage: 100,
  createdAt: 500000,
  damageTaken: 0,
  effectiveDuration: 1400,
  finalScore: 92,
  focusPurityScore: 95,
  focusQuality: 95,
  gemsEarned: 0,
  interruptions: 0,
  modeBonus: 0,
  pausedDuration: 0,
  pausedTime: 0,
  pauses: 0,
  penaltiesApplied: [],
  plannedDuration: 1500,
  sessionId: 'session-123',
  sessionMode: SessionMode.FLOW,
  status: 'COMPLETED',
  streakBonus: 10,
  streakDays: 4,
  streakIncreased: true,
  streakMaintained: true,
  timeBonus: 10,
  userId: 'user-123',
  userLevel: 2,
  vsAverage: 0,
  vsBest: 0,
  xpEarned: 120,
};

const chestResult: ChestResult = {
  bonusItemId: 'cosmetic-123',
  coinReward: 40,
  gemReward: 2,
  isNearMiss: false,
  nearMissSymbols: ['a', 'b', 'c'],
  tier: 'rare',
  xpReward: 180,
};

describe('buildPremiumCompletionReward', () => {
  it('uses XP-derived focus credits', () => {
    const reward = buildPremiumCompletionReward({ chestResult, summary });

    expect(reward.focusCredits).toBe(18);
    expect(reward.xp).toBe(180);
    expect(reward.tier).toBe('rare');
  });

  it('falls back to summary rewards without mutating input', () => {
    const before = { ...summary };
    const reward = buildPremiumCompletionReward({ chestResult: null, summary });

    expect(reward.focusCredits).toBe(12);
    expect(reward.xp).toBe(120);
    expect(summary).toEqual(before);
  });
});
