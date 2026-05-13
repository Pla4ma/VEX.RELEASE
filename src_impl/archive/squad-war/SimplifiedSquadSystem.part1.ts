import { eventBus } from "../../events";


export function createSquad(creatorId: string, creatorName: string, name: string, description: string, isPublic: boolean = false): SimplifiedSquad {
  const now = Date.now();
  const weekStart = getWeekStart(now);

  const squad: SimplifiedSquad = {
    id: `squad-${now}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    description,
    avatarUrl: null,
    createdAt: now,
    createdByUserId: creatorId,

    members: [
      {
        userId: creatorId,
        userName: creatorName,
        avatarUrl: null,
        role: 'LEADER',
        joinedAt: now,
        weeklyFocusMinutes: 0,
        lastSessionAt: null,
        streakContributing: false,
        isActive: true,
      },
    ],
    maxMembers: 10,

    weeklyGoal: {
      targetFocusHours: 10, // 10 hours for small squad, scales with members
      currentTotalHours: 0,
      weekStartsAt: weekStart,
      weekEndsAt: weekStart + 7 * 24 * 60 * 60 * 1000,
      achieved: false,
    },

    streak: {
      currentWeeks: 0,
      longestWeeks: 0,
      lastAchievedAt: null,
      requiresAllMembers: true,
    },

    recentActivity: [],
    activeBossEncounter: null,

    isPublic,
    joinCode: isPublic ? null : generateJoinCode(),
  };

  squads.set(squad.id, squad);

  eventBus.publish('squad:created', {
    squadId: squad.id,
    creatorId,
    name,
  });

  return squad;
}

export function joinSquad(squadId: string, userId: string, userName: string, joinCode?: string): { success: boolean; squad?: SimplifiedSquad; error?: string } {
  const squad = squads.get(squadId);
  if (!squad) {
    return { success: false, error: 'Squad not found' };
  }

  // Check if private and code required
  if (!squad.isPublic && squad.joinCode !== joinCode) {
    return { success: false, error: 'Invalid join code' };
  }

  // Check capacity
  if (squad.members.length >= squad.maxMembers) {
    return { success: false, error: 'Squad is full (max 10 members)' };
  }

  // Check if already member
  if (squad.members.some((m) => m.userId === userId)) {
    return { success: false, error: 'Already a member' };
  }

  // Add member
  squad.members.push({
    userId,
    userName,
    avatarUrl: null,
    role: 'MEMBER',
    joinedAt: Date.now(),
    weeklyFocusMinutes: 0,
    lastSessionAt: null,
    streakContributing: false,
    isActive: true,
  });

  // Update goal target based on member count
  squad.weeklyGoal.targetFocusHours = Math.round(squad.members.length * 8); // 8 hours avg per member

  eventBus.publish('squad:member_joined', {
    squadId,
    userId,
    role: 'member',
    userName,
    memberCount: squad.members.length,
  });

  return { success: true, squad };
}

export function leaveSquad(squadId: string, userId: string): boolean {
  const squad = squads.get(squadId);
  if (!squad) {
    return false;
  }

  const memberIndex = squad.members.findIndex((m) => m.userId === userId);
  if (memberIndex === -1) {
    return false;
  }

  const wasLeader = squad.members[memberIndex].role === 'LEADER';
  squad.members.splice(memberIndex, 1);

  // If leader left, assign new leader
  if (wasLeader && squad.members.length > 0) {
    squad.members[0].role = 'LEADER';
  }

  // Disband if empty
  if (squad.members.length === 0) {
    squads.delete(squadId);
    eventBus.publish('squad:disbanded', { squadId, userId, memberCount: 0 });
    return true;
  }

  // Update goal target
  squad.weeklyGoal.targetFocusHours = Math.round(squad.members.length * 8);

  eventBus.publish('squad:member_left', {
    squadId,
    userId,
    wasFounder: userId === (squad as any).founderId,
    memberCount: squad.members.length,
  });

  return true;
}

export function recordMemberActivity(squadId: string, userId: string, durationMinutes: number): SimplifiedSquad {
  const squad = squads.get(squadId);
  if (!squad) {
    throw new Error('Squad not found');
  }

  const member = squad.members.find((m) => m.userId === userId);
  if (!member) {
    throw new Error('Not a squad member');
  }

  // Update member stats
  member.weeklyFocusMinutes += durationMinutes;
  member.lastSessionAt = Date.now();
  member.isActive = true;
  member.streakContributing = true;

  // Recalculate squad goal progress
  const totalMinutes = squad.members.reduce((sum, m) => sum + m.weeklyFocusMinutes, 0);
  squad.weeklyGoal.currentTotalHours = Math.round((totalMinutes / 60) * 10) / 10;
  squad.weeklyGoal.achieved = squad.weeklyGoal.currentTotalHours >= squad.weeklyGoal.targetFocusHours;

  // Add to activity feed
  addActivity(squad, {
    id: `act-${Date.now()}`,
    userId,
    userName: member.userName,
    type: 'SESSION_COMPLETE',
    description: `${member.userName} focused for ${Math.round(durationMinutes)} minutes`,
    timestamp: Date.now(),
    metadata: { duration: durationMinutes },
  });

  // Check if goal was just achieved
  if (squad.weeklyGoal.achieved && !squad.streak.lastAchievedAt) {
    handleGoalAchieved(squad);
  }

  return squad;
}