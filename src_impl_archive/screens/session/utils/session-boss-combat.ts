import type { BossEncounterSummary } from '../../../features/boss/schemas';
import type { RealTimeBossEncounter } from '../../../features/boss-realtime/types';

type SessionBossCombatContext = {
  elapsedSeconds: number;
  sessionDurationSeconds: number;
  sessionId: string;
  userId: string;
};

export function buildSessionBossCombatEncounter(
  boss: BossEncounterSummary,
  context: SessionBossCombatContext,
): RealTimeBossEncounter {
  const sessionDurationSeconds = Math.max(1, context.sessionDurationSeconds);
  const timeRemainingSeconds = Math.max(0, Math.floor(boss.timeRemaining / 1000));
  const bossHealthPercent = boss.healthRemaining / boss.maxHealth;
  const combatState = bossHealthPercent <= 0.1 ? 'NEAR_DEATH' : bossHealthPercent <= 0.25 ? 'BOSS_RAGE' : 'COMBAT_ACTIVE';

  return {
    id: boss.id,
    bossId: boss.bossId,
    userId: context.userId,
    bossName: boss.bossName,
    bossAvatar: boss.bossAvatarUrl ?? '',
    maxHealth: boss.maxHealth,
    currentHealth: boss.healthRemaining,
    combatState,
    damageDealtThisSession: 0,
    attacksLanded: 0,
    criticalHits: 0,
    longestCombo: 0,
    currentCombo: 0,
    sessionId: context.sessionId,
    sessionStartTime: Date.now() - Math.max(0, context.elapsedSeconds) * 1000,
    sessionDuration: sessionDurationSeconds,
    timeLimit: Math.max(sessionDurationSeconds, timeRemainingSeconds),
    timeRemaining: timeRemainingSeconds,
    lastAttackTime: null,
    lastAttackDamage: 0,
    lastAttackType: null,
    bossIsFlashing: false,
    bossIsShaking: false,
    xpReward: Math.max(50, Math.floor(sessionDurationSeconds / 60) * 20),
    coinReward: Math.max(10, Math.floor(sessionDurationSeconds / 60) * 5),
    gemReward: sessionDurationSeconds >= 1500 ? 1 : 0,
    createdAt: Date.now(),
  };
}
