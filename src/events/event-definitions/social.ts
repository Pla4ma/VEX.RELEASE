/**
 * Social Event Definitions
 *
 * Event interfaces for social features: activity feed, squad activity,
 * guild activity, friend requests, messages, and duel challenges.
 */

export type SocialEventType =
  | "social:activity"
  | "social:feed_post"
  | "social:squad_activity"
  | "social:guild_activity"
  | "social:friend_request"
  | "social:message"
  | "social:duel_challenge";

export interface SocialActivityEvent {
  userId: string;
  activityType:
    | "session_completed"
    | "level_up"
    | "achievement_unlocked"
    | "item_crafted"
    | "boss_defeated"
    | "streak_milestone";
  visibility: "PRIVATE" | "FRIENDS" | "SQUAD" | "GUILD" | "PUBLIC";
  data: {
    id: string;
    content: string;
    timestamp: number;
    metadata?: Record<string, unknown>;
    mediaUrl?: string;
  };
}

export interface SocialSquadActivityEvent {
  userId: string;
  squadId: string;
  activity: {
    type: string;
    duration?: number;
    xpEarned?: number;
    damageDealt?: number;
    timestamp: number;
  };
}

export interface SocialGuildActivityEvent {
  userId: string;
  guildId: string;
  activity: { type: string; value: number; timestamp: number };
}

export interface SocialDuelChallengeEvent {
  userId: string;
  targetUserId: string;
  duelId: string;
  challenge: {
    type: string;
    duration: number;
    wager?: { currency: string; amount: number };
    expiresAt: number;
  };
}
