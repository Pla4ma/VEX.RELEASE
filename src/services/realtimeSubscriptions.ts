import { getSupabaseClient } from "../config/supabase";
import { eventBus } from "../events";
import { createDebugger } from "../utils/debug";
import {
  activeChannels,
  CHANNELS,
  getCurrentUserId,
  type BroadcastMessage,
} from "./realtimeShared";

const debug = createDebugger("realtime");

export async function broadcastActivity(
  channelName: string,
  type: BroadcastMessage["type"],
  payload: unknown,
): Promise<void> {
  const client = getSupabaseClient();
  const fullChannelName = getActivityChannelName(channelName);
  let channel = activeChannels.get(fullChannelName);
  if (!channel) {
    const newChannel = client.channel(fullChannelName);
    await newChannel.subscribe();
    activeChannels.set(fullChannelName, newChannel);
    channel = newChannel;
  }
  if (channel) {
    await channel.send({
      type: "broadcast",
      event: type,
      payload: {
        ...(payload as Record<string, unknown>),
        senderId: getCurrentUserId(),
        timestamp: Date.now(),
      },
    });
  }
}

export function subscribeToActivity(
  channelName: string,
  callback: (message: BroadcastMessage) => void,
): () => void {
  const client = getSupabaseClient();
  const fullChannelName = getActivityChannelName(channelName);
  const channel = client
    .channel(fullChannelName)
    .on("broadcast", { event: "*" }, (payload) => {
      callback({
        type: payload.event as BroadcastMessage["type"],
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

export function subscribeToFeedChanges(
  userId: string,
  callback: (payload: unknown) => void,
): () => void {
  const client = getSupabaseClient();
  const channelName = `feed:changes:${userId}`;
  const channel = client
    .channel(channelName)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "feed_items",
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        callback(payload);
        const newRecord = payload.new as Record<string, unknown> | undefined;
        eventBus.publish("realtime:feed_update", {
          itemId:
            (newRecord?.id as string) ||
            ((payload.old as Record<string, unknown>)?.id as string),
          event: payload.eventType as "INSERT" | "UPDATE" | "DELETE",
          data: newRecord,
        });
      },
    );
  channel.subscribe();
  activeChannels.set(channelName, channel);
  return () => {
    channel.unsubscribe();
    activeChannels.delete(channelName);
  };
}

export function subscribeToSquadChanges(
  squadId: string,
  callback: (payload: unknown) => void,
): () => void {
  const client = getSupabaseClient();
  const channelName = `squad:${squadId}:changes`;
  const channel = client
    .channel(channelName)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "squad_members",
        filter: `squad_id=eq.${squadId}`,
      },
      (payload) => {
        callback(payload);
        const newData = payload.new as Record<string, unknown> | undefined;
        eventBus.publish("realtime:squad_update", {
          squadId,
          event:
            payload.eventType === "INSERT"
              ? "member_joined"
              : payload.eventType === "DELETE"
                ? "member_left"
                : "progress_update",
          data: newData,
        });
      },
    );
  channel.subscribe();
  activeChannels.set(channelName, channel);
  return () => {
    channel.unsubscribe();
    activeChannels.delete(channelName);
  };
}

export function subscribeToGuildQuests(
  guildId: string,
  callback: (payload: unknown) => void,
): () => void {
  const client = getSupabaseClient();
  const channelName = CHANNELS.guild(guildId);
  const channel = client
    .channel(channelName)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "guild_quests",
        filter: `guild_id=eq.${guildId}`,
      },
      callback,
    )
    .on("broadcast", { event: "quest_progress" }, (payload) => {
      callback(payload);
    })
    .on("broadcast", { event: "message" }, ({ payload }) => {
      debug.debug("Broadcast received:", payload);
    });
  channel.subscribe();
  activeChannels.set(channelName, channel);
  return () => {
    channel.unsubscribe();
    activeChannels.delete(channelName);
  };
}

function getActivityChannelName(channelName: string): string {
  return channelName.startsWith("squad:") ||
    channelName.startsWith("guild:") ||
    channelName.startsWith("user:")
    ? channelName
    : `activity:${channelName}`;
}
