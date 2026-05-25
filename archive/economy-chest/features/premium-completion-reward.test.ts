import { SessionMode } from '../../../session/modes';
import type { SessionSummary } from '../../../session/types';
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

describe('buildPremiumCompletionReward', () => {
  it('derives focus credits from summary xpEarned', () => {
    const reward = buildPremiumCompletionReward(summary);

    expect(reward.focusCredits).toBe(12);
    expect(reward.xp).toBe(120);
  });

  it('returns coach memory copy for non-strong sessions', () => {
    const reward = buildPremiumCompletionReward({
      ...summary,
      xpEarned: 80,
    });

    expect(reward.title).toBe('Save this rhythm to Coach Memory');
    expect(reward.cta).toBe('Save to Coach Memory');
    expect(reward.description).toContain('Coach Memory');
  });

  it('uses deeper insight copy for strong sessions (>=100 xp)', () => {
    const reward = buildPremiumCompletionReward({
      ...summary,
      xpEarned: 150,
    });

    expect(reward.title).toBe('Unlock deeper weekly insight');
    expect(reward.cta).toBe('Generate next study path');
    expect(reward.focusCredits).toBe(15);
  });

  it('does not reference chest, shop, or inventory', () => {
    const reward = buildPremiumCompletionReward(summary);
    const copy = `${reward.title} ${reward.description} ${reward.cta}`.toLowerCase();

    for (const banned of ['chest', 'shop', 'inventory', 'coins', 'gems']) {
      expect(copy).not.toContain(banned);
    }
  });
});
