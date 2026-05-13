import { getSupabaseClient } from "../config/supabase";
import { eventBus } from "../events";
import { createDebugger } from "../utils/debug";
import type { RealtimeChannel } from "@supabase/supabase-js";


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