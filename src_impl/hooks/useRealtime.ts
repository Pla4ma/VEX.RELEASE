/**
 * useRealtime Hook
 *
 * React hook for Supabase Realtime features.
 * Simplifies presence, broadcast, and postgres changes subscriptions.
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import {
  initializePresence,
  updatePresence,
  subscribeToSquadPresence,
  subscribeToActivity,
  subscribeToFeedChanges,
  subscribeToSquadChanges,
  subscribeToGuildQuests,
  broadcastActivity,
  type PresenceStatus,
  type UserPresence,
  type SquadPresence,
  type BroadcastMessage,
} from '../services/realtime';
import { eventBus } from '../events';
import { createDebugger } from '../utils/debug';

const debug = createDebugger('hooks:realtime');

// ============================================================================
// Presence Hook
// ============================================================================

interface UsePresenceOptions {
  userId: string;
  initialStatus?: PresenceStatus;
  onStatusChange?: (status: PresenceStatus) => void;
}

// ============================================================================
// Squad Presence Hook
// ============================================================================

interface UseSquadPresenceOptions {
  squadId: string | undefined;
}

// ============================================================================
// Activity Broadcast Hook
// ============================================================================

interface UseActivityBroadcastOptions {
  channelName: string;
  onMessage?: (message: BroadcastMessage) => void;
}

// ============================================================================
// Feed Updates Hook
// ============================================================================

interface UseFeedUpdatesOptions {
  onUpdate?: (payload: unknown) => void;
}

// ============================================================================
// Squad Changes Hook
// ============================================================================

interface UseSquadChangesOptions {
  squadId: string | undefined;
  onChange?: (payload: unknown) => void;
}

// ============================================================================
// Guild Quests Hook
// ============================================================================

interface UseGuildQuestsOptions {
  guildId: string | undefined;
  onQuestUpdate?: (payload: unknown) => void;
}

// ============================================================================
// Online Status Hook (using event bus)
// ============================================================================
export * from "./useRealtime.types";
export * from "./useRealtime.types";
export * from "./useRealtime.part1";
export * from "./useRealtime.part2";
