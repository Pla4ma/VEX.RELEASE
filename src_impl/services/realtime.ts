/**
 * Supabase Realtime Service
 *
 * Real-time features for social, squads, guilds, and feed:
 * - Presence (who's online, squad activity)
 * - Broadcast (activity signals, notifications)
 * - Postgres Changes (feed updates, challenge progress)
 */

import { getSupabaseClient } from '../config/supabase';
import { eventBus } from '../events';
import { createDebugger } from '../utils/debug';

const debug = createDebugger('realtime');

// ============================================================================
// Types
// ============================================================================
// ============================================================================
// Channel Names
// ============================================================================

const CHANNELS = {
  global: 'global:activity',
  user: (userId: string) => `user:${userId}`,
  squad: (squadId: string) => `squad:${squadId}`,
  guild: (guildId: string) => `guild:${guildId}`,
  feed: 'feed:public',
  challenges: 'challenges:active',
} as const;

// ============================================================================
// State
// ============================================================================

import type { RealtimeChannel } from '@supabase/supabase-js';

const activeChannels = new Map<string, RealtimeChannel>();
const presenceCallbacks = new Set<(presence: UserPresence[]) => void>();
let currentUserId: string | null = null;

// ============================================================================
// Presence Management
// ============================================================================
// ============================================================================
// Broadcast / Activity Signals
// ============================================================================
// ============================================================================
// Postgres Changes (Feed Updates)
// ============================================================================
// ============================================================================
// Guild-specific Features
// ============================================================================
// ============================================================================
// Helper Functions
// ============================================================================

function handlePresenceSync(state: Record<string, unknown[]>): void {
  const presences: UserPresence[] = [];

  Object.entries(state).forEach(([key, entries]) => {
    entries.forEach((entry) => {
      presences.push({
        userId: key,
        status: (entry as Record<string, string>).status as PresenceStatus,
        lastSeen: Date.now(),
        metadata: entry as Record<string, unknown>,
      });
    });
  });

  presenceCallbacks.forEach((cb) => cb(presences));
}

export * from "./realtime.types";
export * from "./realtime.part1";
export * from "./realtime.part2";
