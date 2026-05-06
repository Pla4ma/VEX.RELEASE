/**
 * Squad Analytics Events
 *
 * Comprehensive tracking for squad engagement and health metrics.
 */

import { eventBus } from "../../events";
import { type Squad, type SquadMember, type SquadRole } from "./schemas";

export const SquadAnalytics = {
  // Lifecycle events
  squadCreated: (squad: Squad, founderId: string) => {
    eventBus.publish("analytics:track", {
      event: "squad_created",
      properties: {
        squad_id: squad.id,
        squad_name: squad.name,
        founder_id: founderId,
        max_members: squad.maxMembers,
        is_public: squad.isPublic,
        join_requirements: squad.joinRequirements,
        timestamp: Date.now(),
      },
    });
  },

  squadJoined: (squadId: string, userId: string, role: SquadRole, method: "invite" | "request" | "open") => {
    eventBus.publish("analytics:track", {
      event: "squad_member_joined",
      properties: {
        squad_id: squadId,
        user_id: userId,
        role,
        join_method: method,
        timestamp: Date.now(),
      },
    });
  },

  squadLeft: (squadId: string, userId: string, wasFounder: boolean, durationMs: number) => {
    eventBus.publish("analytics:track", {
      event: "squad_member_left",
      properties: {
        squad_id: squadId,
        user_id: userId,
        was_founder: wasFounder,
        membership_duration_ms: durationMs,
        timestamp: Date.now(),
      },
    });
  },

  // Engagement events
  sessionStarted: (squadId: string, sessionId: string, participantCount: number, config: unknown) => {
    eventBus.publish("analytics:track", {
      event: "squad_session_started",
      properties: {
        squad_id: squadId,
        session_id: sessionId,
        participant_count: participantCount,
        session_config: config,
        timestamp: Date.now(),
      },
    });
  },

  sessionCompleted: (squadId: string, sessionId: string, duration: number, totalFocusTime: number, participantResults: Array<{ userId: string; focusTime: number; completed: boolean }>) => {
    eventBus.publish("analytics:track", {
      event: "squad_session_completed",
      properties: {
        squad_id: squadId,
        session_id: sessionId,
        duration_seconds: duration,
        total_focus_time_seconds: totalFocusTime,
        participant_count: participantResults.length,
        completion_rate: participantResults.filter((p) => p.completed).length / participantResults.length,
        avg_focus_time: totalFocusTime / participantResults.length,
        timestamp: Date.now(),
      },
    });
  },

  contributionMade: (squadId: string, userId: string, points: number, source: string, newTotal: number) => {
    eventBus.publish("analytics:track", {
      event: "squad_contribution",
      properties: {
        squad_id: squadId,
        user_id: userId,
        points,
        source,
        new_total: newTotal,
        timestamp: Date.now(),
      },
    });
  },

  synergyLevelUp: (squadId: string, newLevel: number, previousLevel: number, totalPoints: number) => {
    eventBus.publish("analytics:track", {
      event: "squad_synergy_level_up",
      properties: {
        squad_id: squadId,
        new_level: newLevel,
        previous_level: previousLevel,
        total_points: totalPoints,
        levels_gained: newLevel - previousLevel,
        timestamp: Date.now(),
      },
    });
  },

  // Role management events
  roleChanged: (squadId: string, userId: string, previousRole: SquadRole, newRole: SquadRole, changedBy: string) => {
    eventBus.publish("analytics:track", {
      event: "squad_role_changed",
      properties: {
        squad_id: squadId,
        user_id: userId,
        previous_role: previousRole,
        new_role: newRole,
        changed_by: changedBy,
        is_promotion: isPromotion(previousRole, newRole),
        is_demotion: isDemotion(previousRole, newRole),
        timestamp: Date.now(),
      },
    });
  },

  memberKicked: (squadId: string, userId: string, kickedBy: string, reason?: string | null) => {
    eventBus.publish("analytics:track", {
      event: "squad_member_kicked",
      properties: {
        squad_id: squadId,
        user_id: userId,
        kicked_by: kickedBy,
        has_reason: !!reason,
        timestamp: Date.now(),
      },
    });
  },

  // Invite flow events
  inviteSent: (squadId: string, invitedBy: string, invitedUserId: string, roleOffered: SquadRole) => {
    eventBus.publish("analytics:track", {
      event: "squad_invite_sent",
      properties: {
        squad_id: squadId,
        invited_by: invitedBy,
        invited_user_id: invitedUserId,
        role_offered: roleOffered,
        timestamp: Date.now(),
      },
    });
  },

  inviteResponded: (squadId: string, inviteId: string, invitedUserId: string, response: "accepted" | "declined" | "expired", responseTimeMs?: number) => {
    eventBus.publish("analytics:track", {
      event: "squad_invite_responded",
      properties: {
        squad_id: squadId,
        invite_id: inviteId,
        invited_user_id: invitedUserId,
        response,
        response_time_ms: responseTimeMs,
        timestamp: Date.now(),
      },
    });
  },

  // Error events
  errorOccurred: (squadId: string | undefined, operation: string, errorCode: string, errorMessage: string, context: Record<string, unknown>) => {
    eventBus.publish("analytics:track", {
      event: "squad_error",
      properties: {
        squad_id: squadId,
        operation,
        error_code: errorCode,
        error_message: errorMessage,
        ...context,
        timestamp: Date.now(),
      },
    });
  },

  // Health metrics
  healthCheck: (
    squadId: string,
    metrics: {
      memberCount: number;
      activeToday: number;
      activeThisWeek: number;
      avgSessionDuration: number;
      totalContributions: number;
      synergyLevel: number;
    },
  ) => {
    eventBus.publish("analytics:track", {
      event: "squad_health_check",
      properties: {
        squad_id: squadId,
        ...metrics,
        engagement_score: calculateEngagementScore(metrics),
        timestamp: Date.now(),
      },
    });
  },

  squadWarViewed: (squadId: string, warId: string, bossName: string, memberCount: number) => {
    eventBus.publish("analytics:track", {
      event: "squad_war_viewed",
      properties: {
        squad_id: squadId,
        war_id: warId,
        boss_name: bossName,
        member_count: memberCount,
        timestamp: Date.now(),
      },
    });
  },

  squadWarStartTapped: (squadId: string, warId: string) => {
    eventBus.publish("analytics:track", {
      event: "squad_war_start_session_tapped",
      properties: {
        squad_id: squadId,
        war_id: warId,
        timestamp: Date.now(),
      },
    });
  },

  squadWarDamageRecorded: (squadId: string, userId: string, damage: number, sessionId: string) => {
    eventBus.publish("analytics:track", {
      event: "squad_war_damage_recorded",
      properties: {
        squad_id: squadId,
        user_id: userId,
        damage,
        session_id: sessionId,
        timestamp: Date.now(),
      },
    });
  },

  squadWarRealtimeDegraded: (squadId: string, reason: string) => {
    eventBus.publish("analytics:track", {
      event: "squad_war_realtime_degraded",
      properties: {
        squad_id: squadId,
        reason,
        timestamp: Date.now(),
      },
    });
  },
};

// Helper functions
function isPromotion(previous: SquadRole, current: SquadRole): boolean {
  const hierarchy = ["GUEST", "MEMBER", "MODERATOR", "ADMIN", "FOUNDER"];
  return hierarchy.indexOf(current) > hierarchy.indexOf(previous);
}

function isDemotion(previous: SquadRole, current: SquadRole): boolean {
  const hierarchy = ["GUEST", "MEMBER", "MODERATOR", "ADMIN", "FOUNDER"];
  return hierarchy.indexOf(current) < hierarchy.indexOf(previous);
}

function calculateEngagementScore(metrics: { memberCount: number; activeToday: number; activeThisWeek: number; avgSessionDuration: number; totalContributions: number; synergyLevel: number }): number {
  const dailyActivity = metrics.activeToday / Math.max(1, metrics.memberCount);
  const weeklyActivity = metrics.activeThisWeek / Math.max(1, metrics.memberCount);
  const sessionQuality = Math.min(1, metrics.avgSessionDuration / 3600); // Normalize to 1 hour
  const contributionRate = Math.min(1, metrics.totalContributions / Math.max(1, metrics.memberCount * 100));
  const synergyBonus = Math.min(1, metrics.synergyLevel / 10);

  return Math.round((dailyActivity * 0.3 + weeklyActivity * 0.2 + sessionQuality * 0.2 + contributionRate * 0.15 + synergyBonus * 0.15) * 100);
}

// Batch analytics for periodic reporting
export async function generateSquadAnalyticsReport(squadId: string): Promise<{
  period: string;
  memberGrowth: number;
  activityRate: number;
  avgSessionTime: number;
  topContributors: Array<{ userId: string; points: number }>;
  synergyProgress: number;
}> {
  // This would aggregate data from the analytics events
  // For now, returning placeholder structure
  return {
    period: "7d",
    memberGrowth: 0,
    activityRate: 0,
    avgSessionTime: 0,
    topContributors: [],
    synergyProgress: 0,
  };
}
