import { eventBus } from "../../events";


export function resetWeeklyProgress(squadId: string): SimplifiedSquad {
  const squad = squads.get(squadId);
  if (!squad) {
    throw new Error('Squad not found');
  }

  const now = Date.now();
  const weekStart = getWeekStart(now);

  // Check if streak continues
  const allMembersActive = squad.members.every((m) => m.streakContributing);

  if (!allMembersActive) {
    // Streak broken
    squad.streak.currentWeeks = 0;
    eventBus.publish('squad:streak_broken', {
      squadId: squad.id,
      userId: 'system',
      previousStreak: squad.streak.currentWeeks,
    });
  }

  // Reset all member weekly stats
  for (const member of squad.members) {
    member.weeklyFocusMinutes = 0;
    member.streakContributing = false;
    // Check if still active (session in last 7 days)
    member.isActive = member.lastSessionAt ? now - member.lastSessionAt < 7 * 24 * 60 * 60 * 1000 : false;
  }

  // Reset goal
  squad.weeklyGoal = {
    targetFocusHours: Math.round(squad.members.length * 8),
    currentTotalHours: 0,
    weekStartsAt: weekStart,
    weekEndsAt: weekStart + 7 * 24 * 60 * 60 * 1000,
    achieved: false,
  };

  return squad;
}

export function getActivityFeed(squadId: string, limit: number = 20): SquadActivity[] {
  const squad = squads.get(squadId);
  if (!squad) {
    return [];
  }
  return squad.recentActivity.slice(0, limit);
}

export function recordBossDamageActivity(squadId: string, userId: string, damage: number): void {
  const squad = squads.get(squadId);
  if (!squad) {
    return;
  }

  const member = squad.members.find((m) => m.userId === userId);
  if (!member) {
    return;
  }

  addActivity(squad, {
    id: `act-${Date.now()}`,
    userId,
    userName: member.userName,
    type: 'BOSS_DAMAGE',
    description: `${member.userName} dealt ${damage} damage to the boss`,
    timestamp: Date.now(),
    metadata: { damage },
  });
}

export function startSquadBoss(squadId: string, bossId: string, bossName: string, baseHealth: number): { success: boolean; encounter?: SquadBossEncounter; error?: string } {
  const squad = squads.get(squadId);
  if (!squad) {
    return { success: false, error: 'Squad not found' };
  }

  // Check if already has active boss
  if (squad.activeBossEncounter?.status === 'ACTIVE') {
    return { success: false, error: 'Squad already has an active boss' };
  }

  const now = Date.now();
  const scaledHealth = Math.floor(baseHealth * (1 + squad.members.length * 0.2)); // +20% per member

  const encounter: SquadBossEncounter = {
    encounterId: `encounter-${now}`,
    bossId,
    bossName,
    startedAt: now,
    expiresAt: now + 48 * 60 * 60 * 1000, // 48 hours
    healthRemaining: scaledHealth,
    maxHealth: scaledHealth,
    participantDamage: {},
    status: 'ACTIVE',
  };

  squad.activeBossEncounter = encounter;

  // Add activity
  addActivity(squad, {
    id: `act-${now}-boss`,
    userId: 'system',
    userName: 'Squad',
    type: 'BOSS_DAMAGE',
    description: `Squad boss ${bossName} has appeared! Defeat it together!`,
    timestamp: now,
  });

  eventBus.publish('squad:boss_started', {
    squadId,
    encounterId: encounter.encounterId,
    bossId,
    bossName,
    memberCount: squad.members.length,
  });

  return { success: true, encounter };
}

export function damageSquadBoss(squadId: string, userId: string, damage: number): { success: boolean; isDefeated: boolean; encounter?: SquadBossEncounter } {
  const squad = squads.get(squadId);
  if (!squad || !squad.activeBossEncounter) {
    return { success: false, isDefeated: false };
  }

  const encounter = squad.activeBossEncounter;
  if (encounter.status !== 'ACTIVE') {
    return { success: false, isDefeated: false };
  }

  // Apply damage
  encounter.healthRemaining = Math.max(0, encounter.healthRemaining - damage);
  encounter.participantDamage[userId] = (encounter.participantDamage[userId] || 0) + damage;

  // Check defeat
  const isDefeated = encounter.healthRemaining === 0;
  if (isDefeated) {
    encounter.status = 'DEFEATED';
    handleBossDefeated(squad, encounter);
  }

  return { success: true, isDefeated, encounter };
}

export function discoverPublicSquads(limit: number = 20, excludeFull: boolean = true): SimplifiedSquad[] {
  const allSquads = Array.from(squads.values());
  return allSquads
    .filter((s) => s.isPublic && (!excludeFull || s.members.length < s.maxMembers))
    .sort((a, b) => b.members.length - a.members.length) // Most active first
    .slice(0, limit);
}

export function getUserSquads(userId: string): SimplifiedSquad[] {
  return Array.from(squads.values()).filter((s) => s.members.some((m) => m.userId === userId));
}