/**
 * Squad Events
 */

import type { SquadRaidEventDefinitions } from './squad-raid';

export type { SquadRaidEventDefinitions } from './squad-raid';

export interface SquadCoreEventDefinitions {
  'squad:created': {
    squadId: string;
    userId?: string;
    creatorId?: string;
    name: string;
  };
  'squad:updated': { squadId: string; userId: string; updates: unknown };
  'squad:deleted': { squadId: string; userId: string };
  'squad:member_joined': {
    squadId: string;
    userId: string;
    role: string;
    userName?: string;
    memberCount?: number;
  };
  'squad:joined': {
    squadId: string;
    userId: string;
    role: string;
    userName?: string;
    payload?: { squadId: string; userId: string; role: string };
  };
  'squad:member_left': {
    squadId: string;
    userId: string;
    wasFounder?: boolean;
    memberCount?: number;
  };
  'squad:member_kicked': {
    squadId: string;
    userId: string;
    kickedBy: string;
    reason?: string | null;
  };
  'squad:role_changed': {
    squadId: string;
    userId: string;
    newRole: string;
    changedBy: string;
  };
  'squad:session_started': {
    squadId: string;
    sessionId: string;
    startedBy: string;
  };
  'squad:session_completed': {
    squadId: string;
    userId: string;
    duration: number;
    xpContributed: number;
  };
  'squad:activity': {
    squadId: string;
    userId: string;
    activityType: string;
    data: Record<string, unknown>;
  };
  'squad:synergy_level_up': {
    squadId: string;
    newLevel: number;
    userId: string;
  };
  'help:request_created': {
    helpRequestId: string;
    squadId: string;
    requesterId: string;
    helpType: string;
    urgency: string;
  };
  'help:response_created': {
    helpRequestId: string;
    responderId: string;
    responseType: string;
    message: string;
  };
  'help:response_rated': {
    helpRequestId: string;
    rating: number;
    feedback: string;
  };
  'squad:encouragement_sent': {
    squadId: string;
    fromUserId: string;
    fromUserName: string;
    toUserId: string;
    toUserName: string;
    timestamp: number;
  };
  'squad:streak_updated': {
    squadId: string;
    userId: string;
    newStreak: number;
    milestone: boolean;
  };
  'squad:streak_milestone_reached': {
    squadId: string;
    milestone: number;
    members: string[];
  };
  'squad:boss_started': {
    squadId: string;
    encounterId: string;
    bossId: string;
    bossName?: string;
    memberCount: number;
  };
  'squad:boss_defeated': {
    squadId: string;
    encounterId: string;
    bossId: string;
    bossName?: string;
    totalDamage: number;
  };
  'squad:disbanded': {
    squadId: string;
    userId: string;
    memberCount: number;
  };
  'squad:goal_achieved': {
    squadId: string;
    goalId: string;
    goalType: string;
    achievedBy: string[];
  };
  'squad:streak_broken': {
    squadId: string;
    userId: string;
    previousStreak: number;
    reason?: string;
  };
  'squads:leaderboard_update': {
    squadId: string;
    leaderboardType?: string;
    userId?: string;
    score?: number;
  };
  'squads:challenge_update': {
    squadId: string;
    challengeId: string;
    type: string;
    progress: number;
    target: number;
    contributors: Array<{ userId: string; contribution: number }>;
  };
}

export type SquadEventDefinitions = SquadCoreEventDefinitions &
  SquadRaidEventDefinitions;
