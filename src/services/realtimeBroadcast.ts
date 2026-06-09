/**
 * Realtime broadcast logic
 * Extracted from realtimeSubscriptions to keep it under 200 lines
 */
import { getSupabaseClient } from '../config/supabase';
import { createDebugger } from '../utils/debug';
import {
  activeChannels,
  getCurrentUserId,
  type BroadcastMessage,
} from './realtimeShared';

/** Shape of a broadcast payload from Supabase Presence/Broadcast. */
interface BroadcastPayload {
  senderId?: string;
  timestamp?: number;
  [key: string]: unknown;
}

const pendingTxTimeoutIds = new Set<ReturnType<typeof setTimeout>>();
const _debug = createDebugger('realtime');

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

function getActivityChannelName(channelName: string): string {
  return channelName.startsWith('squad:') ||
    channelName.startsWith('guild:') ||
    channelName.startsWith('user:')
    ? channelName
    : `activity:${channelName}`;
}
