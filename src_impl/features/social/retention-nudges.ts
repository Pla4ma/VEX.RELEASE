/**
 * Retention Nudges — Accountability triggers from friends + squads
 *
 * Works at zero population: if you have 0 friends, no nudges fire.
 * But when you DO have friends, these create real accountability.
 */

import { eventBus } from '../../events';
import type { NudgeType } from '../social/types';

interface Nudge {
  id: string;
  userId: string;
  type: NudgeType;
  fromUserId: string;
  fromUserName: string;
  message: string;
  actionRoute: string | null;
  createdAt: number;
  dismissedAt: number | null;
}

type NudgeHandler = (nudge: Nudge) => void;

let onNudge: NudgeHandler | null = null;

const NUDGE_MESSAGES: Record<NudgeType, (name: string) => string> = {
  FRIEND_STARTED_SESSION: (name: string) => `${name} just started a focus session — join them!`,
  FRIEND_ON_STREAK: (name: string) => `${name} is on a 5-day streak. Don't break yours!`,
  DUEL_INVITE: (name: string) => `${name} challenged you to a focus duel!`,
  WEEKLY_RANK_DROP: (name: string) => `${name} passed you on the weekly board. Focus to reclaim your spot.`,
  SQUAD_MEMBER_ACTIVE: (name: string) => `${name} is focusing with the squad right now.`,
};

export function initializeRetentionNudges(handler: NudgeHandler): () => void {
  onNudge = handler;

  const unsubSessionStarted = eventBus.subscribe('session:started', (raw: unknown) => {
    const data = raw as { userId?: string };
    if (data.userId) {void handleFriendSessionStarted(data.userId);}
  });

  const unsubDuelCreated = eventBus.subscribe('social:duel_created', (raw: unknown) => {
    const data = raw as { userId: string; duelId: string };
    void handleDuelInvite(data.userId, data.duelId);
  });

  const unsubSquadActive = eventBus.subscribe('squad.member_active', (raw: unknown) => {
    const data = raw as { userId: string; squadId: string };
    void handleSquadMemberActive(data.userId, data.squadId);
  });

  return () => {
    unsubSessionStarted();
    unsubDuelCreated();
    unsubSquadActive();
  };
}

async function handleFriendSessionStarted(userId: string): Promise<void> {
  try {
    const { getFriendProfiles } = await import('./repository');
    const friends = await getFriendProfiles(userId);
    for (const friend of friends) {
      const nudge: Nudge = {
        id: `nudge-${Date.now()}-${friend.userId}`,
        userId: friend.userId,
        type: 'FRIEND_STARTED_SESSION',
        fromUserId: userId,
        fromUserName: friend.displayName,
        message: NUDGE_MESSAGES.FRIEND_STARTED_SESSION(friend.displayName),
        actionRoute: '/session/start',
        createdAt: Date.now(),
        dismissedAt: null,
      };
      onNudge?.(nudge);
    }
  } catch {
    // Friends lookup failed — silently ignore at small scale
  }
}

async function handleDuelInvite(userId: string, duelId: string): Promise<void> {
  try {
    const { getDuelByShareCode } = await import('./service');
    const duel = await getDuelByShareCode(duelId);
    if (duel?.opponentId) {
      const nudge: Nudge = {
        id: `nudge-${Date.now()}-${duel.opponentId}`,
        userId: duel.opponentId,
        type: 'DUEL_INVITE',
        fromUserId: userId,
        fromUserName: duel.challengerName,
        message: NUDGE_MESSAGES.DUEL_INVITE(duel.challengerName),
        actionRoute: `/duel/${duel.shareCode}`,
        createdAt: Date.now(),
        dismissedAt: null,
      };
      onNudge?.(nudge);
    }
  } catch {
    // No-op for small scale
  }
}

async function handleSquadMemberActive(userId: string, squadId: string): Promise<void> {
  try {
    const { getSquadMembers } = await import('../squads/service');
    const members = await getSquadMembers(squadId);
    for (const member of members) {
      if (member.userId === userId) {continue;}
      const nudge: Nudge = {
        id: `nudge-${Date.now()}-${member.userId}`,
        userId: member.userId,
        type: 'SQUAD_MEMBER_ACTIVE',
        fromUserId: userId,
        fromUserName: member.displayName,
        message: NUDGE_MESSAGES.SQUAD_MEMBER_ACTIVE(member.displayName),
        actionRoute: '/squad/session',
        createdAt: Date.now(),
        dismissedAt: null,
      };
      onNudge?.(nudge);
    }
  } catch {
    // No-op
  }
}
