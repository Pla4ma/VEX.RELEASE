import { eventBus } from "../../events";
import { featureFlags } from "../../feature-flags/FeatureFlagEngine";


export const SQUAD_BOSS_HEALTH_MULTIPLIER = 1.5;

export const SQUAD_BOSS_DURATION_MULTIPLIER = 1.5;

export const MVP_BONUS_MULTIPLIER = 1.5;

export const PARTICIPATION_THRESHOLD = 0.05;

export function calculateSquadBossHealth(baseHealth: number, squadSize: number): number {
  const squadMultiplier = 1 + (squadSize - 1) * 0.3; // +30% per additional member
  return Math.floor(baseHealth * SQUAD_BOSS_HEALTH_MULTIPLIER * squadMultiplier);
}

export function createSquadBossEncounter(bossId: string, squadId: string, baseHealth: number, baseDuration: number, members: Array<{ userId: string; userName: string; avatarUrl: string | null }>): SquadBossEncounter {
  assertSquadBossEnabled();
  const scaledHealth = calculateSquadBossHealth(baseHealth, members.length);
  const scaledDuration = baseDuration * SQUAD_BOSS_DURATION_MULTIPLIER;

  const now = Date.now();

  const encounter: SquadBossEncounter = {
    id: generateEncounterId(),
    bossId,
    squadId,
    healthRemaining: scaledHealth,
    maxHealth: scaledHealth,
    status: 'ACTIVE',
    startedAt: now,
    expiresAt: now + scaledDuration,
    defeatedAt: null,
    memberContributions: members.map((m) => ({
      userId: m.userId,
      userName: m.userName,
      avatarUrl: m.avatarUrl,
      damageDealt: 0,
      sessionsContributed: 0,
      lastContributionAt: 0,
      largestSingleHit: 0,
      criticalHits: 0,
      bountyPlaced: false,
    })),
    squadDamageTotal: 0,
    lastActivityAt: now,
  };

  // Publish event
  eventBus.publish('boss:squad_encounter_created', {
    encounterId: encounter.id,
    squadId,
    bossId,
    memberCount: members.length,
  });

  return encounter;
}

export function applySquadMemberDamage(
  encounter: SquadBossEncounter,
  userId: string,
  damage: number,
  sessionId: string,
  wasCritical: boolean = false,
): {
  encounter: SquadBossEncounter;
  contribution: SquadMemberContribution;
  isDefeated: boolean;
} {
  // Find or create contribution record
  let contribution = encounter.memberContributions.find((c) => c.userId === userId);

  if (!contribution) {
    contribution = {
      userId,
      userName: 'Unknown',
      avatarUrl: null,
      damageDealt: 0,
      sessionsContributed: 0,
      lastContributionAt: 0,
      largestSingleHit: 0,
      criticalHits: 0,
      bountyPlaced: false,
    };
    encounter.memberContributions.push(contribution);
  }

  // Update contribution stats
  contribution.damageDealt += damage;
  contribution.sessionsContributed += 1;
  contribution.lastContributionAt = Date.now();
  contribution.largestSingleHit = Math.max(contribution.largestSingleHit, damage);
  if (wasCritical) {
    contribution.criticalHits += 1;
  }

  // Update encounter stats
  encounter.healthRemaining = Math.max(0, encounter.healthRemaining - damage);
  encounter.squadDamageTotal += damage;
  encounter.lastActivityAt = Date.now();

  // Check for defeat
  const isDefeated = encounter.healthRemaining === 0;
  if (isDefeated) {
    encounter.status = 'DEFEATED';
    encounter.defeatedAt = Date.now();
  }

  // Publish event
  eventBus.publish('boss:squad_damage_dealt', {
    encounterId: encounter.id,
    userId,
    damage,
    healthRemaining: encounter.healthRemaining,
  });

  return { encounter, contribution, isDefeated };
}

export function calculateMVP(contributions: SquadMemberContribution[]): SquadMemberContribution | null {
  if (contributions.length === 0) {
    return null;
  }

  // Score based on multiple factors
  const scored = contributions.map((c) => ({
    contribution: c,
    score: c.damageDealt * 1 + c.sessionsContributed * 10 + c.criticalHits * 50 + (c.bountyPlaced ? 100 : 0),
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored[0].contribution;
}

export function getMemberRanking(contributions: SquadMemberContribution[]): Array<SquadMemberContribution & { rank: number; damagePercent: number }> {
  const totalDamage = contributions.reduce((sum, c) => sum + c.damageDealt, 0);

  return contributions
    .map((c) => ({
      ...c,
      rank: 0, // Will be set below
      damagePercent: totalDamage > 0 ? (c.damageDealt / totalDamage) * 100 : 0,
    }))
    .sort((a, b) => b.damageDealt - a.damageDealt)
    .map((c, index) => ({ ...c, rank: index + 1 }));
}

export function createVictoryCeremony(encounter: SquadBossEncounter, bossName: string): SquadVictoryCeremony {
  const mvp = calculateMVP(encounter.memberContributions);
  const ranking = getMemberRanking(encounter.memberContributions);

  // Generate rewards
  const sharedRewards: SquadSharedReward[] = encounter.memberContributions
    .filter((c) => c.damageDealt > 0) // Only participants who dealt damage
    .map((c) => {
      const isMVP = mvp?.userId === c.userId;
      const baseXP = 100;
      const baseCoins = 50;

      return {
        userId: c.userId,
        xpAmount: isMVP ? Math.floor(baseXP * MVP_BONUS_MULTIPLIER) : baseXP,
        coinAmount: isMVP ? Math.floor(baseCoins * MVP_BONUS_MULTIPLIER) : baseCoins,
        cosmeticId: isMVP ? 'mvp-badge' : null,
        bonusReward: isMVP,
      };
    });

  const ceremony: SquadVictoryCeremony = {
    encounterId: encounter.id,
    bossId: encounter.bossId,
    bossName,
    defeatedAt: encounter.defeatedAt || Date.now(),
    squadId: encounter.squadId,
    mvp,
    contributions: ranking,
    totalSquadDamage: encounter.squadDamageTotal,
    victoryMessage: generateVictoryMessage(encounter, mvp),
    sharedRewards,
  };

  // Publish event
  eventBus.publish('boss:squad_victory', {
    encounterId: encounter.id,
    squadId: encounter.squadId,
    bossId: encounter.bossId,
    totalDamage: encounter.squadDamageTotal,
  });

  return ceremony;
}