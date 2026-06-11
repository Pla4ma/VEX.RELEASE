/**
 * Realtime broadcast logic
 * Extracted from realtimeSubscriptions to keep it under 200 lines
 */
import { z } from 'zod';
import { getSupabaseClient } from '../config/supabase';
import { createDebugger } from '../utils/debug';
import {
  activeChannels,
  getCurrentUserId,
  type BroadcastMessage,
} from './realtimeShared';

const BroadcastMessageTypeSchema = z.enum([
  'activity',
  'notification',
  'sync',
  'typing',
]);

const BroadcastPayloadSchema = z
  .object({
    senderId: z.string().optional(),
    timestamp: z.number().optional(),
  })
  .passthrough();

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
  const typeResult = BroadcastMessageTypeSchema.safeParse(event);
  const type = typeResult.success ? typeResult.data : 'activity';

  const parsed = BroadcastPayloadSchema.safeParse(rawPayload);
  return {
    type,
    payload: rawPayload,
    senderId: parsed.success ? (parsed.data.senderId ?? '') : '',
    timestamp: parsed.success ? (parsed.data.timestamp ?? Date.now()) : Date.now(),
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
    const broadcastBody: Record<string, unknown> =
      typeof payload === 'object' && payload !== null
        ? { ...(payload as Record<string, unknown>) }
        : {};
    await channel.send({
      type: 'broadcast',
      event: type,
      payload: {
        ...broadcastBody,
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
      callback(
        parseBroadcastPayload(
          typeof payload.event === 'string' ? payload.event : String(payload.event),
          payload.payload,
        ),
      );
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
