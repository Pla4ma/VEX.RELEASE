import { getSupabaseClient } from '../../../config/supabase';
import * as Sentry from '@sentry/react-native';
import { createDebugger } from '../../../utils/debug';

const debug = createDebugger('coach:realtime:subscriptions');

const supabase = getSupabaseClient();

/**
 * Handle Supabase Realtime subscription status changes.
 * Logs warnings and triggers query invalidation on reconnect.
 */
function handleSubscriptionStatus(
  channelName: string,
  status: string,
  onReconnect?: () => void,
): void {
  if (status === 'SUBSCRIBED') {
    debug.info('Channel %s subscribed', channelName);
    onReconnect?.();
    return;
  }

  if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
    Sentry.addBreadcrumb({
      category: 'realtime',
      message: `Channel ${channelName} status: ${status}`,
      level: 'warning',
    });
    debug.warn('Channel %s error status: %s', channelName, status);
    return;
  }

  if (status === 'CLOSED') {
    debug.info('Channel %s closed', channelName);
    return;
  }
}

export function subscribeToCoachMessages(
  userId: string,
  onInsert: (payload: unknown) => void,
  onReconnect?: () => void,
) {
  const channelName = `coach-messages-${userId}`;
  return supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'coach_messages',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => onInsert(payload),
    )
    .subscribe((status) =>
      handleSubscriptionStatus(channelName, status, onReconnect),
    );
}

export function subscribeToCoachState(
  userId: string,
  onUpdate: (payload: unknown) => void,
  onReconnect?: () => void,
) {
  const channelName = `coach-state-${userId}`;
  return supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'coach_states',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => onUpdate(payload),
    )
    .subscribe((status) =>
      handleSubscriptionStatus(channelName, status, onReconnect),
    );
}

export function subscribeToComebackPlan(
  userId: string,
  onChange: () => void,
  onReconnect?: () => void,
) {
  const channelName = `coach-comeback-${userId}`;
  return supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'comeback_plans',
        filter: `user_id=eq.${userId}`,
      },
      () => onChange(),
    )
    .subscribe((status) =>
      handleSubscriptionStatus(channelName, status, onReconnect),
    );
}

export function subscribeToRecommendations(
  userId: string,
  onChange: () => void,
  onReconnect?: () => void,
) {
  const channelName = `coach-recommendations-${userId}`;
  return supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'coach_recommendations',
        filter: `user_id=eq.${userId}`,
      },
      () => onChange(),
    )
    .subscribe((status) =>
      handleSubscriptionStatus(channelName, status, onReconnect),
    );
}

/**
 * Combined realtime subscription for all coach-related tables.
 * Creates a single channel with multiple .on() handlers instead of
 * separate channels per table, reducing connection overhead.
 * Kept alongside individual functions for backward compatibility.
 */
export function subscribeToCoachRealtime(
  userId: string,
  handlers: {
    onMessageInsert: (payload: unknown) => void;
    onStateUpdate: (payload: unknown) => void;
    onComebackChange: () => void;
    onRecommendationChange: () => void;
  },
  onReconnect?: () => void,
) {
  const channelName = `coach-realtime-${userId}`;
  return supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'coach_messages',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => handlers.onMessageInsert(payload),
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'coach_states',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => handlers.onStateUpdate(payload),
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'comeback_plans',
        filter: `user_id=eq.${userId}`,
      },
      () => handlers.onComebackChange(),
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'coach_recommendations',
        filter: `user_id=eq.${userId}`,
      },
      () => handlers.onRecommendationChange(),
    )
    .subscribe((status) =>
      handleSubscriptionStatus(channelName, status, onReconnect),
    );
}
