import { getSupabaseClient } from '../config/supabase';
import { eventBus } from '../events/EventBus';
import { createDebugger } from '../utils/debug';
import {
  activeChannels,
  CHANNELS,
  getCurrentUserId,
  presenceCallbacks,
  resetCurrentUserId,
  setCurrentUserId,
  type PresenceStatus,
  type SquadPresence,
  type UserPresence,
} from './realtimeShared';
export {
  type BroadcastMessage,
  type PresenceStatus,
  type SquadPresence,
  type UserPresence,
  getCurrentUserId,
  activeChannels,
} from './realtimeShared';
export { broadcastActivity, subscribeToActivity, subscribeToFeedChanges, subscribeToSquadChanges, subscribeToGuildQuests } from './realtimeSubscriptions';
import { cancelPendingBroadcastCleanups } from './realtimeSubscriptions';
import { normalizePresenceEntry } from './realtime-presence';
const debug = createDebugger('realtime');
export async function initializePresence(userId: string): Promise<void> {
  const previousUserId = getCurrentUserId();
  if (previousUserId && previousUserId !== userId) {
    const previousKey = `presence:${previousUserId}`;
    const previousChannel = activeChannels.get(previousKey);
    if (previousChannel) {
      await previousChannel.unsubscribe();
      activeChannels.delete(previousKey);
    }
  }
  setCurrentUserId(userId);
  const presenceKey = `presence:${userId}`;
  const existingChannel = activeChannels.get(presenceKey);
  if (existingChannel) {
    await existingChannel.unsubscribe();
    activeChannels.delete(presenceKey);
  }
  const client = getSupabaseClient();
  const channel = client.channel(CHANNELS.user(userId), {
    config: { presence: { key: userId } },
  });
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
  activeChannels.set(presenceKey, channel);
}

export async function updatePresence(
  status: PresenceStatus,
  metadata?: Record<string, unknown>,
): Promise<void> {
  const currentUserId = getCurrentUserId();
  if (!currentUserId) {
    return;
  }
  const channel = activeChannels.get(`presence:${currentUserId}`);
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
  eventBus.publish('realtime:presence_update', {
    userId: currentUserId,
    status,
    timestamp: Date.now(),
  });
}

export async function subscribeToSquadPresence(
  squadId: string,
  callback: (presence: SquadPresence) => void,
): Promise<() => void> {
  const client = getSupabaseClient();
  const channelName = CHANNELS.squad(squadId);
  const channel = client.channel(channelName, {
    config: { presence: { key: squadId } },
  });
  channel.on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState();
    const members = new Map<string, UserPresence>();
    let activeCount = 0;
    let inSessionCount = 0;
    Object.entries(state).forEach(([key, presences]) => {
      const presence = normalizePresenceEntry(key, presences[0]);
      if (!presence) {
        return;
      }
      members.set(key, presence);
      if (presence.status !== 'offline') {
        activeCount++;
      }
      if (presence.status === 'in_session') {
        inSessionCount++;
      }
    });
    callback({ squadId, members, activeCount, inSessionCount });
  });
  await channel.subscribe();
  activeChannels.set(channelName, channel);
  return () => {
    channel.unsubscribe();
    activeChannels.delete(channelName);
  };
}

function handlePresenceSync(state: Record<string, unknown[]>): void {
  const presences: UserPresence[] = [];
  Object.entries(state).forEach(([key, entries]) => {
    entries.forEach((entry) => {
      const presence = normalizePresenceEntry(key, entry);
      if (presence) {
        presences.push(presence);
      }
    });
  });
  presenceCallbacks.forEach((cb) => cb(presences));
}


export function onPresenceChange(
  callback: (presence: UserPresence[]) => void,
): () => void {
  presenceCallbacks.add(callback);
  return () => presenceCallbacks.delete(callback);
}

export async function cleanupPresence(): Promise<void> {
  const userId = getCurrentUserId();
  const key = `presence:${userId}`;
  const channel = activeChannels.get(key);
  if (channel) {
    await channel.unsubscribe();
    activeChannels.delete(key);
  }
  resetCurrentUserId();
}

export async function cleanupRealtime(): Promise<void> {
  cancelPendingBroadcastCleanups();
  for (const [name, channel] of activeChannels) {
    await channel.unsubscribe();
    debug.info('[Realtime] Unsubscribed:', name);
  }
  activeChannels.clear();
  resetCurrentUserId();
}
export function getActiveChannelCount(): number { return activeChannels.size; }
