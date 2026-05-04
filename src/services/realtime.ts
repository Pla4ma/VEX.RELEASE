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

export type PresenceStatus = 'online' | 'away' | 'offline' | 'in_session';

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
  type: 'activity' | 'notification' | 'sync' | 'typing';
  payload: unknown;
  senderId: string;
  timestamp: number;
}

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

/**
 * Initialize presence tracking for current user
 */
export async function initializePresence(userId: string): Promise<void> {
  currentUserId = userId;
  const client = getSupabaseClient();

  // Create personal presence channel
  const channel = client.channel(CHANNELS.user(userId), {
    config: {
      presence: {
        key: userId,
      },
    },
  });

  // Track presence state changes
  channel
    .on('presence', { event: 'sync' }, () => {
      const newState = channel.presenceState();
      debug.debug('Presence sync:', newState);
      handlePresenceSync(newState);
    })
    .on('presence', { event: 'join' }, ({ key, newPresences }) => {
      debug.debug('Join:', key, newPresences);
    })
    .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      debug.debug('Leave:', key, leftPresences);
    });

  await channel.subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      // Announce presence
      const trackStatus = await channel.track({
        userId,
        status: 'online',
        lastSeen: Date.now(),
        online_at: Date.now(),
      });
      if (trackStatus !== 'ok') {
        debug.debug('Failed to track presence:', trackStatus);
      }
    }
  });

  activeChannels.set('presence', channel);
}

/**
 * Update presence status
 */
export async function updatePresence(status: PresenceStatus, metadata?: Record<string, unknown>): Promise<void> {
  if (!currentUserId) {return;}

  const channel = activeChannels.get('presence');
  if (!channel) {return;}

  const trackStatus = await channel.track({
    userId: currentUserId,
    status,
    lastSeen: Date.now(),
    ...metadata,
  });
  if (trackStatus !== 'ok') {
    debug.debug('Failed to update presence:', trackStatus);
  }

  // Emit local event
  eventBus.publish('realtime:presence_update', {
    userId: currentUserId,
    status,
    timestamp: Date.now(),
  });
}

/**
 * Subscribe to squad presence
 */
export async function subscribeToSquadPresence(squadId: string, callback: (presence: SquadPresence) => void): Promise<() => void> {
  const client = getSupabaseClient();
  const channelName = CHANNELS.squad(squadId);

  const channel = client.channel(channelName, {
    config: {
      presence: {
        key: squadId,
      },
    },
  });

  channel
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const members = new Map<string, UserPresence>();
      let activeCount = 0;
      let inSessionCount = 0;

      Object.entries(state).forEach(([key, presences]) => {
        const presence = presences[0] as unknown as UserPresence;
        members.set(key, presence);
        if (presence.status !== 'offline') {activeCount++;}
        if (presence.status === 'in_session') {inSessionCount++;}
      });

      callback({
        squadId,
        members,
        activeCount,
        inSessionCount,
      });
    });

  await channel.subscribe();
  activeChannels.set(channelName, channel);

  return () => {
    channel.unsubscribe();
    activeChannels.delete(channelName);
  };
}

// ============================================================================
// Broadcast / Activity Signals
// ============================================================================

/**
 * Broadcast activity to a channel
 */
export async function broadcastActivity(
  channelName: string,
  type: BroadcastMessage['type'],
  payload: unknown
): Promise<void> {
  const client = getSupabaseClient();
  const fullChannelName = channelName.startsWith('squad:') ||
                          channelName.startsWith('guild:') ||
                          channelName.startsWith('user:')
    ? channelName
    : `activity:${channelName}`;

  let channel = activeChannels.get(fullChannelName);

  if (!channel) {
    const newChannel = client.channel(fullChannelName);
    await newChannel.subscribe();
    activeChannels.set(fullChannelName, newChannel);
    channel = newChannel;
  }

  if (channel) {
    await channel.send({
      type: 'broadcast',
      event: type,
      payload: {
        ...(payload as Record<string, unknown>),
        senderId: currentUserId,
        timestamp: Date.now(),
      },
    });
  }
}

/**
 * Subscribe to activity broadcasts
 */
export function subscribeToActivity(
  channelName: string,
  callback: (message: BroadcastMessage) => void
): () => void {
  const client = getSupabaseClient();
  const fullChannelName = channelName.startsWith('squad:') ||
                          channelName.startsWith('guild:') ||
                          channelName.startsWith('user:')
    ? channelName
    : `activity:${channelName}`;

  const channel = client
    .channel(fullChannelName)
    .on('broadcast', { event: '*' }, (payload) => {
      callback({
        type: payload.event as BroadcastMessage['type'],
        payload: payload.payload,
        senderId: payload.payload?.senderId,
        timestamp: payload.payload?.timestamp || Date.now(),
      });
    });

  channel.subscribe();
  activeChannels.set(fullChannelName, channel);

  return () => {
    channel.unsubscribe();
    activeChannels.delete(fullChannelName);
  };
}

// ============================================================================
// Postgres Changes (Feed Updates)
// ============================================================================

/**
 * Subscribe to feed item changes
 */
export function subscribeToFeedChanges(callback: (payload: unknown) => void): () => void {
  const client = getSupabaseClient();

  const channel = client
    .channel('feed:changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'feed_items',
      },
      (payload) => {
        callback(payload);

        // Emit to event bus for cross-feature handling
        const newRecord = payload.new as Record<string, unknown> | undefined;
        eventBus.publish('realtime:feed_update', {
          itemId: newRecord?.id as string || (payload.old as Record<string, unknown>)?.id as string,
          event: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          data: newRecord,
        });
      }
    );

  channel.subscribe();
  activeChannels.set('feed:changes', channel);

  return () => {
    channel.unsubscribe();
    activeChannels.delete('feed:changes');
  };
}

/**
 * Subscribe to squad member changes
 */
export function subscribeToSquadChanges(squadId: string, callback: (payload: unknown) => void): () => void {
  const client = getSupabaseClient();
  const channelName = `squad:${squadId}:changes`;

  const channel = client
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'squad_members',
        filter: `squad_id=eq.${squadId}`,
      },
      (payload) => {
        callback(payload);
        const newData = payload.new as Record<string, unknown> | undefined;
        eventBus.publish('realtime:squad_update', {
          squadId,
          event: payload.eventType === 'INSERT' ? 'member_joined' :
                 payload.eventType === 'DELETE' ? 'member_left' : 'progress_update',
          data: newData,
        });
      }
    );

  channel.subscribe();
  activeChannels.set(channelName, channel);

  return () => {
    channel.unsubscribe();
    activeChannels.delete(channelName);
  };
}

// ============================================================================
// Guild-specific Features
// ============================================================================

/**
 * Subscribe to guild quest updates
 */
export function subscribeToGuildQuests(guildId: string, callback: (payload: unknown) => void): () => void {
  const client = getSupabaseClient();
  const channelName = CHANNELS.guild(guildId);

  const channel = client
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'guild_quests',
        filter: `guild_id=eq.${guildId}`,
      },
      callback
    )
    .on('broadcast', { event: 'quest_progress' }, (payload) => {
      callback(payload);
    })
    .on('broadcast', { event: 'message' }, ({ payload }) => {
      debug.debug('Broadcast received:', payload);
    });

  channel.subscribe();
  activeChannels.set(channelName, channel);

  return () => {
    channel.unsubscribe();
    activeChannels.delete(channelName);
  };
}

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

/**
 * Subscribe to all presence changes
 */
export function onPresenceChange(callback: (presence: UserPresence[]) => void): () => void {
  presenceCallbacks.add(callback);
  return () => presenceCallbacks.delete(callback);
}

/**
 * Cleanup all realtime connections
 */
export async function cleanupRealtime(): Promise<void> {
  for (const [name, channel] of activeChannels) {
    await channel.unsubscribe();
    debug.info('[Realtime] Unsubscribed from:', name);
  }
  activeChannels.clear();
  currentUserId = null;
}

/**
 * Get active channel count (for debugging)
 */
export function getActiveChannelCount(): number {
  return activeChannels.size;
}
