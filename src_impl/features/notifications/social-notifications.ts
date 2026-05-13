/**
 * Social Notifications Service
 *
 * Handles push notifications for social interactions:
 * - Feed reactions
 * - Comments
 * - New followers
 * - Squad invites
 *
 * @phase 10.1
 */

import * as Notifications from 'expo-notifications';
import { createDebugger } from '../../utils/debug';
import { getSupabaseClient } from '../../config/supabase';

const debug = createDebugger('notifications:social');

// ============================================================================
// Types
// ============================================================================
// ============================================================================
// Notification Templates
// ============================================================================

const NOTIFICATION_TEMPLATES: Record<SocialNotificationType, (data: Record<string, unknown>, actorName: string) => { title: string; body: string }> = {
  FEED_REACTION: (data, actorName) => ({
    title: `${actorName} reacted ${data.reactionEmoji || '💪'}`,
    body: `To your post: "${String(data.postPreview || '').substring(0, 40)}${String(data.postPreview || '').length > 40 ? '...' : ''}"`,
  }),
  FEED_COMMENT: (data, actorName) => ({
    title: `${actorName} commented`,
    body: `"${String(data.commentPreview || '').substring(0, 50)}${String(data.commentPreview || '').length > 50 ? '...' : ''}"`,
  }),
  NEW_FOLLOWER: (_data, actorName) => ({
    title: 'New Follower!',
    body: `${actorName} started following you`,
  }),
  SQUAD_INVITE: (data, actorName) => ({
    title: 'Squad Invite',
    body: `${actorName} invited you to join ${String(data.squadName || 'their squad')}`,
  }),
  RIVAL_CHALLENGE: (data, actorName) => ({
    title: 'Rival Challenge!',
    body: `${actorName} challenged you to a ${String(data.challengeType || 'focus duel')}`,
  }),
  ACHIEVEMENT_UNLOCKED: (data, _actorName) => ({
    title: '🏆 Achievement Unlocked!',
    body: `You earned: ${String(data.achievementName || 'New Achievement')}`,
  }),
};

// ============================================================================
// Push Token Retrieval
// ============================================================================

/**
 * Get user's push tokens from Supabase
 */
async function getUserPushTokens(userId: string): Promise<string[]> {
  try {
    const { data, error } = await getSupabaseClient().from('user_push_tokens').select('expo_push_token').eq('user_id', userId).eq('is_active', true);

    if (error) {
      debug.warn('Failed to fetch push tokens', error);
      return [];
    }

    return (data ?? []).map((row) => row.expo_push_token).filter((token): token is string => Boolean(token));
  } catch (error) {
    debug.warn('Error fetching push tokens', error);
    return [];
  }
}

// ============================================================================
// Notification Dispatch
// ============================================================================

/**
 * Send push notification via Expo
 */
async function sendExpoPushNotification(pushToken: string, title: string, body: string, data: Record<string, unknown>): Promise<boolean> {
  try {
    // In production, this would call the Expo Push API
    // For now, we use local notifications for testing
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default',
        badge: 1,
      },
      trigger: null, // Show immediately
    });

    debug.info('Sent notification', { title, to: pushToken.slice(0, 10) + '...' });
    return true;
  } catch (error) {
    debug.warn('Failed to send push notification', error);
    return false;
  }
}

// ============================================================================
// Notification Settings
// ============================================================================
export * from "./social-notifications.types";
export * from "./social-notifications.part1";
