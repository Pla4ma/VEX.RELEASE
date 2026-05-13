import { eventBus } from "../../events";


export function getSquad(squadId: string): SimplifiedSquad | null {
  return squads.get(squadId) || null;
}

export function getSquadSummary(squadId: string, userId: string): SquadSummary | null {
  const squad = squads.get(squadId);
  if (!squad) {
    return null;
  }

  const member = squad.members.find((m) => m.userId === userId);
  const progress = squad.weeklyGoal.targetFocusHours > 0 ? Math.min(100, (squad.weeklyGoal.currentTotalHours / squad.weeklyGoal.targetFocusHours) * 100) : 0;

  return {
    id: squad.id,
    name: squad.name,
    memberCount: squad.members.length,
    maxMembers: squad.maxMembers,
    isFull: squad.members.length >= squad.maxMembers,
    streakWeeks: squad.streak.currentWeeks,
    weeklyProgress: Math.round(progress),
    recentActivityCount: squad.recentActivity.length,
    hasActiveBoss: squad.activeBossEncounter?.status === 'ACTIVE',
    isMember: !!member,
    userRole: member?.role,
  };
}