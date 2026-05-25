import { fetchBossTemplate, fetchActiveEncounter } from '../boss/repository';
import { fetchActiveChallengeDetails } from '../challenges/repository';
import { fetchStreak } from '../streaks/repository';
import { SessionStakeSchema, type SessionStake } from './schemas';

type StakeMode = 'LIGHT_FOCUS' | 'DEEP_WORK' | 'SPRINT' | 'CREATIVE' | 'STUDY' | 'RECOVERY' | 'STARTER';

function normalizeStakeMode(mode: string): StakeMode {
  switch (mode) {
    case 'DEEP_WORK': return 'DEEP_WORK';
    case 'SPRINT': return 'SPRINT';
    case 'CREATIVE': return 'CREATIVE';
    case 'STUDY': return 'STUDY';
    case 'RECOVERY': return 'RECOVERY';
    case 'STARTER': return 'STARTER';
    default: return 'LIGHT_FOCUS';
  }
}

function calculateBossDamageEstimate(durationSeconds: number, streakDays: number): {
  max: number;
  min: number;
} {
  const baseDamage = Math.floor(durationSeconds / 60);
  const streakMultiplier = streakDays >= 7 ? 1.5 : 1;
  return {
    max: Math.floor(baseDamage * streakMultiplier),
    min: Math.floor(baseDamage * 0.8 * streakMultiplier),
  };
}

function calculateStreakRisk(streak: {
  currentDays: number;
  lastQualifyingSessionAt: number | null;
  shieldsAvailable: number;
}): 'SAFE' | 'AT_RISK' | 'CRITICAL' {
  if (streak.currentDays === 0 || !streak.lastQualifyingSessionAt) return 'SAFE';
  const hoursRemaining = Math.floor((streak.lastQualifyingSessionAt + 86400000 - Date.now()) / 3600000);
  if (hoursRemaining <= 0) return streak.shieldsAvailable > 0 ? 'AT_RISK' : 'CRITICAL';
  if (hoursRemaining <= 4) return 'CRITICAL';
  return hoursRemaining <= 12 ? 'AT_RISK' : 'SAFE';
}

function calculateHoursRemaining(streak: { lastQualifyingSessionAt: number | null }): number | undefined {
  if (!streak.lastQualifyingSessionAt) return undefined;
  const hoursRemaining = Math.floor((streak.lastQualifyingSessionAt + 86400000 - Date.now()) / 3600000);
  return hoursRemaining > 0 ? hoursRemaining : undefined;
}

function estimateChallengeProgress(durationSeconds: number): number {
  return Math.floor(durationSeconds / 600);
}

export async function buildSessionStake(
  userId: string,
  durationSeconds: number,
  mode: string,
  selectedLoadout?: string[],
): Promise<SessionStake> {
  const [bossEncounter, streak, challenges] = await Promise.all([
    fetchActiveEncounter(userId).catch(() => null),
    fetchStreak(userId).catch(() => null),
    fetchActiveChallengeDetails(userId).catch(() => []),
  ]);
  const bossDamage = bossEncounter ? calculateBossDamageEstimate(durationSeconds, streak?.currentDays ?? 0) : null;
  const bossTemplate = bossEncounter ? await fetchBossTemplate(bossEncounter.bossId).catch(() => null) : null;
  return SessionStakeSchema.parse({
    boss: bossEncounter && bossDamage ? {
      bountyAvailable: false,
      encounterId: bossEncounter.id,
      estimatedDamageMax: bossDamage.max,
      estimatedDamageMin: bossDamage.min,
      healthRemaining: bossEncounter.healthRemaining,
      isFinalStrike: bossDamage.max >= bossEncounter.healthRemaining,
      maxHealth: bossEncounter.maxHealth,
      name: bossTemplate?.name ?? 'The Procrastinator',
    } : undefined,
    challenges: challenges.map((c) => {
      const progressDelta = estimateChallengeProgress(durationSeconds);
      const current = c.userChallenge.currentValue ?? 0;
      return {
        id: c.challenge.id,
        progressAfter: Math.min(c.challenge.targetValue, current + progressDelta),
        progressBefore: current,
        reward: `${c.xpReward} XP`,
        title: c.challenge.title,
        willComplete: current + progressDelta >= c.challenge.targetValue,
      };
    }),
    offlineLimitations: [],
    rival: undefined,
    selectedDurationSeconds: durationSeconds,
    selectedLoadout,
    selectedMode: normalizeStakeMode(mode),
    streak: {
      currentDays: streak?.currentDays ?? 0,
      hoursRemaining: streak ? calculateHoursRemaining(streak) : undefined,
      insuranceAvailable: false,
      status: streak ? calculateStreakRisk(streak) : 'SAFE',
    },
    userId,
  });
}
