import { getSupabaseClient } from "../config/supabase";
import { eventBus } from "../events";
import { createDebugger } from "../utils/debug";
import type { RealtimeChannel } from "@supabase/supabase-js";


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

export function onPresenceChange(callback: (presence: UserPresence[]) => void): () => void {
  presenceCallbacks.add(callback);
  return () => presenceCallbacks.delete(callback);
}

export async function cleanupRealtime(): Promise<void> {
  for (const [name, channel] of activeChannels) {
    await channel.unsubscribe();
    debug.info('[Realtime] Unsubscribed from:', name);
  }
  activeChannels.clear();
  currentUserId = null;
}

export function getActiveChannelCount(): number {
  return activeChannels.size;
}