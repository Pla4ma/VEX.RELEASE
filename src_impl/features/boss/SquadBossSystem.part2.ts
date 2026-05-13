import { eventBus } from "../../events";
import { featureFlags } from "../../feature-flags/FeatureFlagEngine";


export function getSquadProgressSummary(encounter: SquadBossEncounter): {
  healthPercent: number;
  timeRemaining: number;
  topContributor: SquadMemberContribution | null;
  totalParticipants: number;
  recentActivity: boolean;
} {
  const healthPercent = (encounter.healthRemaining / encounter.maxHealth) * 100;
  const timeRemaining = Math.max(0, encounter.expiresAt - Date.now());
  const topContributor = encounter.memberContributions.reduce((top, c) => (c.damageDealt > (top?.damageDealt || 0) ? c : top), null as SquadMemberContribution | null);
  const totalParticipants = encounter.memberContributions.filter((c) => c.damageDealt > 0).length;
  const recentActivity = Date.now() - encounter.lastActivityAt < 60 * 60 * 1000; // 1 hour

  return {
    healthPercent,
    timeRemaining,
    topContributor,
    totalParticipants,
    recentActivity,
  };
}

export function canMemberJoin(encounter: SquadBossEncounter, userId: string): boolean {
  // Check if encounter is active
  if (encounter.status !== 'ACTIVE') {
    return false;
  }

  // Check if not expired
  if (encounter.expiresAt < Date.now()) {
    return false;
  }

  // Check if already a member
  if (encounter.memberContributions.some((c) => c.userId === userId)) {
    return true;
  }

  // New members can join if encounter is recent (< 1 hour old)
  const isRecent = Date.now() - encounter.startedAt < 60 * 60 * 1000;
  return isRecent;
}

export function addMemberToEncounter(encounter: SquadBossEncounter, userId: string, userName: string, avatarUrl: string | null): SquadBossEncounter {
  if (!canMemberJoin(encounter, userId)) {
    throw new Error('Cannot join this encounter');
  }

  // Check if already exists
  if (encounter.memberContributions.some((c) => c.userId === userId)) {
    return encounter;
  }

  encounter.memberContributions.push({
    userId,
    userName,
    avatarUrl,
    damageDealt: 0,
    sessionsContributed: 0,
    lastContributionAt: 0,
    largestSingleHit: 0,
    criticalHits: 0,
    bountyPlaced: false,
  });

  // Scale health for new member
  const newHealth = calculateSquadBossHealth(encounter.maxHealth, encounter.memberContributions.length);
  const healthDelta = newHealth - encounter.maxHealth;
  encounter.maxHealth = newHealth;
  encounter.healthRemaining += healthDelta;

  eventBus.publish('boss:squad_member_joined', {
    encounterId: encounter.id,
    userId,
    displayName: userName,
  });

  return encounter;
}

export function recordBountyPlaced(encounter: SquadBossEncounter, userId: string): void {
  const contribution = encounter.memberContributions.find((c) => c.userId === userId);
  if (contribution) {
    contribution.bountyPlaced = true;
  }
}

export function getActiveBountyCount(encounter: SquadBossEncounter): number {
  return encounter.memberContributions.filter((c) => c.bountyPlaced).length;
}