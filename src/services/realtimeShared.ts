import type { RealtimeChannel } from "@supabase/supabase-js";

export type PresenceStatus = "online" | "away" | "offline" | "in_session";

export interface UserPresence {
  userId: string;
  status: PresenceStatus;
  currentSquadId?: string | null;
  currentSessionId?: string | null;
  lastSeen: number;
  metadata?: Record<string, unknown>;
}

export interface SquadPresence {
  squadId: string;
  members: Map<string, UserPresence>;
  activeCount: number;
  inSessionCount: number;
}

export interface BroadcastMessage {
  type: "activity" | "notification" | "sync" | "typing";
  payload: unknown;
  senderId: string;
  timestamp: number;
}

export const CHANNELS = {
  global: "global:activity",
  user: (userId: string) => `user:${userId}`,
  squad: (squadId: string) => `squad:${squadId}`,
  guild: (guildId: string) => `guild:${guildId}`,
  feed: "feed:public",
  challenges: "challenges:active",
} as const;

export const activeChannels = new Map<string, RealtimeChannel>();
export const presenceCallbacks = new Set<(presence: UserPresence[]) => void>();

let currentUserId: string | null = null;

export function setCurrentUserId(userId: string): void {
  currentUserId = userId;
}

export function getCurrentUserId(): string | null {
  return currentUserId;
}

export function resetCurrentUserId(): void {
  currentUserId = null;
}
