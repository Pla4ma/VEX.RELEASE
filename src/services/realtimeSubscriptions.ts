import { getSupabaseClient } from '../config/supabase';
import { eventBus } from '../events';
import {
  activeChannels,
  CHANNELS,
  type BroadcastMessage,
} from './realtimeShared';
import {
  broadcastActivity,
  cancelPendingBroadcastCleanups,
  subscribeToActivity,
} from './realtimeBroadcast';
import { createDebugger } from '../utils/debug';

const debug = createDebugger('realtime');

// Re-export for backward compatibility
export {
  broadcastActivity,
  cancelPendingBroadcastCleanups,
  subscribeToActivity,
} from './realtimeBroadcast';

/** Shape of a Supabase postgres_changes payload.new / payload.old row. */
interface RealtimeRow {
  id?: string;
  [key: string]: unknown;
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
