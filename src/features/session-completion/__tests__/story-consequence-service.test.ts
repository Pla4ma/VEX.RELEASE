import { buildSessionCompletionConsequences } from '../story-consequence-service';
import { SessionMode } from '../../../session/modes';
import type { SessionSummary } from '../../../session/types';

const summary: SessionSummary = {
  actualDuration: 1500,
  baseScore: 80,
  coinsEarned: 20,
  completionPercentage: 100,
  createdAt: 1,
  damageTaken: 0,
  effectiveDuration: 1500,
  finalScore: 92,
  focusQuality: 92,
  focusPurityScore: 92,
  gemsEarned: 0,
  interruptions: 1,
  modeBonus: 0,
  pausedDuration: 0,
  pausedTime: 0,
  pauses: 0,
  penaltiesApplied: [],
  plannedDuration: 1500,
  sessionId: 'session-1',
  sessionMode: SessionMode.FLOW,
  status: 'COMPLETED',
  streakDays: 4,
  streakIncreased: true,
  streakMaintained: true,
  timeBonus: 12,
  userId: 'user-1',
  userLevel: 2,
  vsAverage: 8,
  vsBest: -2,
  xpEarned: 50,
};

describe('buildSessionCompletionConsequences', () => {
  it('builds boss, streak, and challenge consequences from fetched systems', () => {
    const result = buildSessionCompletionConsequences({
      activeBoss: {
        bossName: 'Distraction Wall',
        healthRemaining: 100,
        maxHealth: 200,
        status: 'ACTIVE',
      },
      activeChallenges: [
        {
          challenge: { targetValue: 3, title: 'Finish three sessions' },
          userChallenge: { currentValue: 3, status: 'COMPLETED' },
        },
      ],
      streakSummary: { currentDays: 4, isAtRisk: true },
      summary,
    });

    expect(result.boss?.damageDealt).toBe(23);
    expect(result.streak?.previousDays).toBe(3);
    expect(result.streak?.streakSaved).toBe(true);
    expect(result.challenge?.wasCompleted).toBe(true);
  });

  it('returns empty consequence sections when optional systems are absent', () => {
    const result = buildSessionCompletionConsequences({
      activeBoss: null,
      activeChallenges: [],
      streakSummary: null,
      summary,
    });

    expect(result.boss).toBeNull();
    expect(result.challenge).toBeNull();
    expect(result.streak).toBeNull();
  });
});
