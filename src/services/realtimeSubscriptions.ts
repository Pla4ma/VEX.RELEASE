import { getSupabaseClient } from '../config/supabase';
import { eventBus } from '../events';
import { createDebugger } from '../utils/debug';
import {
  activeChannels,
  CHANNELS,
  getCurrentUserId,
  type BroadcastMessage,
} from './realtimeShared';

/** Shape of a broadcast payload from Supabase Presence/Broadcast. */
interface BroadcastPayload {
  senderId?: string;
  timestamp?: number;
  [key: string]: unknown;
}

/** Shape of a Supabase postgres_changes payload.new / payload.old row. */
interface RealtimeRow {
  id?: string;
  [key: string]: unknown;
}

const pendingTxTimeoutIds = new Set<ReturnType<typeof setTimeout>>();

export function cancelPendingBroadcastCleanups(): void {
  pendingTxTimeoutIds.forEach(clearTimeout);
  pendingTxTimeoutIds.clear();
}

function parseBroadcastPayload(
  event: string,
  rawPayload: unknown,
): BroadcastMessage {
  const validTypes = ['activity', 'notification', 'sync', 'typing'] as const;
  const type = validTypes.includes(event as typeof validTypes[number])
    ? (event as BroadcastMessage['type'])
    : 'activity';
  const payloadObj = rawPayload as BroadcastPayload | null;
  return {
    type,
    payload: rawPayload,
    senderId: payloadObj?.senderId ?? '',
    timestamp: payloadObj?.timestamp ?? Date.now(),
  };
}

const debug = createDebugger('realtime');

export async function broadcastActivity(
  channelName: string,
  type: BroadcastMessage['type'],
  payload: unknown,
): Promise<void> {
  const client = getSupabaseClient();
  const fullChannelName = getActivityChannelName(channelName);
  const txKey = `tx:${fullChannelName}`;
  let channel = activeChannels.get(txKey);
  if (!channel) {
    const newChannel = client.channel(`${fullChannelName}:tx:${Date.now()}`);
    await newChannel.subscribe();
    activeChannels.set(txKey, newChannel);
    channel = newChannel;
  }
  if (channel) {
    await channel.send({
      type: 'broadcast',
      event: type,
      payload: {
        ...(payload as BroadcastPayload),
        senderId: getCurrentUserId(),
        timestamp: Date.now(),
      },
    });
  }

  const channelToClean = channel;
  const timeoutId = setTimeout(() => {
    channelToClean?.unsubscribe();
    if (activeChannels.get(txKey) === channelToClean) {
      activeChannels.delete(txKey);
    }
    pendingTxTimeoutIds.delete(timeoutId);
  }, 5_000);
  pendingTxTimeoutIds.add(timeoutId);
}

export async function subscribeToActivity(
  channelName: string,
  callback: (message: BroadcastMessage) => void,
) {
  const client = getSupabaseClient();
  const fullChannelName = getActivityChannelName(channelName);
  const channel = client
    .channel(fullChannelName)
    .on('broadcast', { event: '*' }, (payload) => {
      callback(parseBroadcastPayload(payload.event as string, payload.payload));
    });
  await channel.subscribe();
  activeChannels.set(fullChannelName, channel);
  return () => {
    channel.unsubscribe();
    activeChannels.delete(fullChannelName);
  };
}

export async function subscribeToFeedChanges(
  userId: string,
  callback: (payload: unknown) => void,
) {
  const client = getSupabaseClient();
  const channelName = `feed:changes:${userId}`;
  const channel = client
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'feed_items',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        callback(payload);
        const newRecord = payload.new as RealtimeRow | undefined;
        eventBus.publish('realtime:feed_update', {
          itemId:
            newRecord?.id ||
            ((payload.old as RealtimeRow)?.id ?? ''),
          event: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          data: newRecord,
        });
      },
    );
  await channel.subscribe();
  activeChannels.set(channelName, channel);
  return () => {
    channel.unsubscribe();
    activeChannels.delete(channelName);
  };
}

export async function subscribeToSquadChanges(
  squadId: string,
  callback: (payload: unknown) => void,
) {
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
        const newData = payload.new as RealtimeRow | undefined;
        eventBus.publish('realtime:squad_update', {
          squadId,
          event:
            payload.eventType === 'INSERT'
              ? 'member_joined'
              : payload.eventType === 'DELETE'
                ? 'member_left'
                : 'progress_update',
          data: newData,
        });
      },
    );
  await channel.subscribe();
  activeChannels.set(channelName, channel);
  return () => {
    channel.unsubscribe();
    activeChannels.delete(channelName);
  };
}

export async function subscribeToGuildQuests(
  guildId: string,
  callback: (payload: unknown) => void,
) {
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
      callback,
    )
    .on('broadcast', { event: 'quest_progress' }, (payload) => {
      callback(payload);
    })
    .on('broadcast', { event: 'message' }, ({ payload }) => {
      debug.debug('Broadcast received:', payload);
    });
  await channel.subscribe();
  activeChannels.set(channelName, channel);
  return () => {
    channel.unsubscribe();
    activeChannels.delete(channelName);
  };
}

function getActivityChannelName(channelName: string): string {
  return channelName.startsWith('squad:') ||
    channelName.startsWith('guild:') ||
    channelName.startsWith('user:')
    ? channelName
    : `activity:${channelName}`;
}
